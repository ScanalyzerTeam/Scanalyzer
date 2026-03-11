import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { auth } from "@/lib/auth";
import { db, items, shelves, warehouses } from "@/lib/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getWarehouseContext(userId: string) {
  const userWarehouses = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.userId, userId));

  const warehouseData = [];

  for (const warehouse of userWarehouses) {
    const warehouseShelves = await db
      .select()
      .from(shelves)
      .where(eq(shelves.warehouseId, warehouse.id));

    const shelvesWithItems = [];

    for (const shelf of warehouseShelves) {
      const shelfItems = await db
        .select()
        .from(items)
        .where(eq(items.shelfId, shelf.id));

      shelvesWithItems.push({
        ...shelf,
        items: shelfItems,
      });
    }

    warehouseData.push({
      ...warehouse,
      shelves: shelvesWithItems,
    });
  }

  return warehouseData;
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt, history = [] } = await request.json();

  // 🛑 Protect against missing prompt
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  // 🛑 Protect against extremely large prompts
  if (prompt.length > 500) {
    return NextResponse.json(
      { error: "Prompt too long (max 500 characters)" },
      { status: 400 },
    );
  }

  const warehouseData = await getWarehouseContext(session.user.id);

  const simplified = warehouseData.map((w) => ({
    name: w.name,
    shelves: w.shelves.map((s) => ({
      name: s.name,
      itemCount: s.items.length,
      items: s.items.slice(0, 30).map((i) => ({
        name: i.name,
        quantity: i.quantity,
      })),
    })),
  }));

  const systemMessage = {
    role: "system",
    content: `
You are an AI warehouse assistant.

You help users:
- locate items
- count inventory
- understand shelves
- analyze warehouse structure

You must ONLY use the provided warehouse data.

If the user asks about something not in the warehouse say:
"I cannot find that item in your warehouse."

Warehouse Data:
${JSON.stringify(simplified, null, 2)}
`,
  };

  const messages = [
    systemMessage,
    ...history.slice(-10),
    { role: "user", content: prompt },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let completion;

  try {
    completion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages,
      },
      {
        signal: controller.signal,
      },
    );
  } catch (error) {
    console.error("OpenAI Error:", error);

    return NextResponse.json(
      { error: "AI request failed or timed out" },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeout);
  }

  const response = completion.choices?.[0]?.message?.content ?? "No response";

  return NextResponse.json({ response });
}
