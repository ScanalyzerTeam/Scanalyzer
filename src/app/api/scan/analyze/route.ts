import { NextResponse } from "next/server";
import OpenAI from "openai";

import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { db, scans } from "@/lib/schema";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface RawItem {
  name: unknown;
  description: unknown;
  quantity: unknown;
  isContainer: unknown;
  containedIn: unknown;
}

function sanitizeItems(raw: unknown[]): {
  name: string;
  description: string;
  quantity: number;
  isContainer: boolean;
  containedIn: string | null;
}[] {
  return raw
    .map((item) => {
      const i = item as RawItem;
      return {
        name: typeof i.name === "string" ? i.name.trim() : "Unknown item",
        description:
          typeof i.description === "string" ? i.description.trim() : "",
        quantity:
          typeof i.quantity === "number" && i.quantity >= 1
            ? Math.round(i.quantity)
            : 1,
        isContainer: i.isContainer === true,
        containedIn: typeof i.containedIn === "string" ? i.containedIn : null,
      };
    })
    .filter((i) => i.name.length > 0);
}

function parseJson(content: string): unknown[] | null {
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    // Try to salvage truncated JSON
    const salvage =
      cleaned.replace(/,\s*$/, "") + (cleaned.includes("[") ? "]" : "");
    try {
      const parsed = JSON.parse(salvage);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

const SYSTEM_PROMPT = `You are an expert warehouse inventory scanner. Your job is to identify every distinct physical item visible in the photo with high accuracy.

Rules:
- List EVERY visible item, even partially visible ones
- For quantity, count carefully — if you see 3 boxes, quantity is 3, not 1
- isContainer = true only for boxes, bins, crates, bags, drawers, or anything that physically holds other items
- containedIn = the exact name of the container the item is sitting inside or on top of (must match another item's name exactly), otherwise null
- If you are unsure of a name, use a descriptive label (e.g. "Unknown black electronic device")
- Never group different items together — each distinct item type gets its own entry
- Include packaging, labels, and loose items on surfaces

Respond ONLY with a valid JSON array, no markdown, no explanation.
[{"name":"...","description":"...","quantity":1,"isContainer":false,"containedIn":null}]`;

async function analyzeImage(
  image: string,
  detail: "auto" | "high",
): Promise<unknown[] | null> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
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
            image_url: { url: image, detail },
          },
        ],
      },
    ],
    max_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  return parseJson(content);
}

async function analyzeImageSimple(image: string): Promise<unknown[] | null> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "List every physical object you can see in this image as a JSON array with fields: name, description, quantity, isContainer (bool), containedIn (string|null). JSON only, no markdown.",
          },
          {
            type: "image_url",
            image_url: { url: image, detail: "high" },
          },
        ],
      },
    ],
    max_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  return parseJson(content);
}

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

    // First attempt
    let items = await analyzeImage(image, "auto");

    // Retry with high detail if empty
    if (!items || items.length === 0) {
      items = await analyzeImage(image, "high");
    }

    // Last resort: simpler prompt
    if (!items || items.length === 0) {
      items = await analyzeImageSimple(image);
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items detected in the image" },
        { status: 422 },
      );
    }

    const sanitized = sanitizeItems(items);

    await db.insert(scans).values({
      userId: session.user.id,
      itemCount: sanitized.length,
    });

    return NextResponse.json({ items: sanitized });
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
