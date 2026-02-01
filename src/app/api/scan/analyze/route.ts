import { NextResponse } from "next/server";
import OpenAI from "openai";

import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { image } = body;

    if (
      !image ||
      typeof image !== "string" ||
      !image.startsWith("data:image")
    ) {
      return NextResponse.json(
        { error: "A valid base64 image data URL is required" },
        { status: 400 },
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a warehouse inventory assistant. Analyze the photo and identify all distinct items visible. For each item, provide:
- name: a short descriptive name
- description: a brief description (materials, color, condition, brand if visible)
- quantity: how many of this item are visible (integer >= 1)
- isContainer: true if the item is a box, bin, crate, shelf, or container that could hold other items

Respond ONLY with a JSON array. No markdown, no explanation. Example:
[{"name":"Cardboard Box","description":"Brown cardboard shipping box, medium size","quantity":3,"isContainer":true}]`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify all items in this photo for warehouse inventory.",
            },
            {
              type: "image_url",
              image_url: { url: image, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content ?? "[]";

    // Strip markdown fences if present
    const cleaned = content
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const items = JSON.parse(cleaned);

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "AI returned unexpected format" },
        { status: 502 },
      );
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error analyzing image:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 },
    );
  }
}
