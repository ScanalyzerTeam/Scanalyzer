import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { auth } from "@/lib/auth";
import { db, items, shelves, warehouses } from "@/lib/schema";
import {
  getCapacitySuggestions,
  getShelfCapacity,
  getWarehouseCapacity,
} from "@/lib/capacity";

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

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  if (prompt.length > 500) {
    return NextResponse.json(
      { error: "Prompt too long (max 500 characters)" },
      { status: 400 }
    );
  }

  const warehouseData = await getWarehouseContext(session.user.id);

  // Calculate capacity info
  const warehousesWithCapacity = warehouseData.map((w) => {
    const warehouseCapacity = getWarehouseCapacity(w.name, w.shelves);

    const shelvesWithCapacity = w.shelves.map((s) => {
      const shelfCapacity = getShelfCapacity(s.name, s.items);

      return {
        name: s.name,
        items: s.items.slice(0, 30).map((i) => ({
          name: i.name,
          quantity: i.quantity,
        })),
        capacity: shelfCapacity,
      };
    });

    return {
      name: w.name,
      shelves: shelvesWithCapacity,
      capacity: warehouseCapacity,
    };
  });

  // Generate suggestions
  const allSuggestions: string[] = [];

  for (const warehouse of warehousesWithCapacity) {
    allSuggestions.push(
      ...getCapacitySuggestions(
        warehouse.capacity.utilizationPercent,
        warehouse.name,
        "warehouse"
      )
    );

    for (const shelf of warehouse.shelves) {
      allSuggestions.push(
        ...getCapacitySuggestions(
          shelf.capacity.utilizationPercent,
          `${warehouse.name} - ${shelf.name}`,
          "shelf"
        )
      );
    }
  }

  const systemMessage = {
    role: "system",
    content: `
    You are an expert AI Warehouse Management Assistant.

    Your goal is to help users manage inventory, locate items, and optimize space with professional precision. 
    
    CORE FUNCTIONS: 
    - Locate items & count inventory. 
    - Explain warehouse structure. 
    - Report capacity/utilization. 
    - Provide high-level optimization advice. 
    
    STRICT RULES: 
    - ALWAYS use double line breaks between sections (1, 2, 3, 4). 
    - EVERY bullet point must start on a NEW LINE. 
    - NEVER put a header and its content on the same line. 
    - Be concise. Use bullet points on new lines. 
    - Do not repeat the same advice multiple times. 
    - If multiple shelves have the same status (e.g., all are empty), group them together. 
    - Use ONLY provided data. No assumptions. 
    - Always respond in the same language as the user. 
    - When the user communicates in Ukrainian, translate key terms appropriately (e.g., "Summary" → "Підсумок", "Main metrics" → "Ключові показники"), keep formatting consistent. 
    
    CAPACITY LOGIC: 
    - current = total items 
    - remaining = capacity - current 
    - utilization = (current / capacity) * 100 (round to whole number) 
    
    RESPONSE STRUCTURE: 
    - Summary: a brief (1-sentence) overview of the warehouse or requested item status. 
    - Main metrics: - Current items: X 
    - Max capacity: X - Remaining: X 
    - Utilization: X% - Specific Details: mention only shelves relevant to the user's query or requiring attention. 
    
    - Recommendations: 
    - Combine similar suggestions (e.g., instead of listing 5 empty shelves, say "Shelves A, B, and C are empty; consider consolidating"). 
    - List suggestions with and place each on a new line. 
    
    ERROR HANDLING: 
    - If an item is missing: "I cannot find that item in your warehouse." 
    
    
    Warehouse Data:
    ${JSON.stringify(warehousesWithCapacity, null, 2)}
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
      }
    );
  } catch (error) {
    console.error("OpenAI Error:", error);

    return NextResponse.json(
      { error: "AI request failed or timed out" },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }

  const response =
    completion.choices?.[0]?.message?.content ?? "No response";

  return NextResponse.json({ response });
  }