import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { auth } from "@/lib/auth";
import {
  CAPACITY_LIMITS,
  getCapacitySuggestions,
  getShelfCapacity,
  getWarehouseCapacity,
} from "@/lib/capacity";
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

const detectLanguage = async (text: string): Promise<string> => {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Detect the language of this text and respond with ONLY the language code (en, uk, pl, etc): "${text}"`,
      },
    ],
    max_tokens: 5,
    temperature: 0,
  });
  return res.choices[0]?.message?.content?.trim().toLowerCase() ?? "en";
};

const translateResponse = async (
  text: string,
  lang: string,
): Promise<string> => {
  if (lang === "en") return text;
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Translate the following text to language code "${lang}". Respond with ONLY the translated text, nothing else.`,
      },
      { role: "user", content: text },
    ],
    max_tokens: 200,
    temperature: 0,
  });
  return res.choices[0]?.message?.content?.trim() ?? text;
};

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
      { status: 400 },
    );
  }

  const warehouseData = await getWarehouseContext(session.user.id);
  const userLang = await detectLanguage(prompt);

  const tryHandleCreateCommand = async (text: string) => {
    const parseResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a command parser for a warehouse management system.
Extract the user's intent and parameters from their message.

Available warehouses the user has access to:
${JSON.stringify(warehouseData.map((w) => ({ id: w.id, name: w.name })))}

Respond ONLY with a JSON object, no markdown, no explanation.

If the user wants to create a warehouse:
{"action":"create_warehouse","name":"...","width":800,"height":600}

If the user wants to create a shelf:
{"action":"create_shelf","name":"...","warehouseName":"...","warehouseId":"..."}
Use warehouseId if you can match the warehouse name to one of the available warehouses above, otherwise use warehouseName.

If the user wants to create an item:
{"action":"create_item","name":"...","shelfName":"...","shelfId":"...","quantity":1,"description":"...","isContainer":false}

If the message is not a create command:
{"action":"none"}

Rules:
- Extract the name even if written in any language or format
- Match warehouse names loosely (e.g. "Stock складі" → warehouse named "Stock")
- If a required field is missing, omit it from the JSON (do not guess)`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 200,
      temperature: 0,
    });

    const raw = parseResponse.choices[0]?.message?.content ?? "{}";
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return { handled: false };
    }

    if (!parsed.action || parsed.action === "none") {
      return { handled: false };
    }

    // CREATE WAREHOUSE
    if (parsed.action === "create_warehouse") {
      if (!parsed.name) {
        return { handled: true, response: "Missing required fields: name" };
      }

      const existing = await db
        .select()
        .from(warehouses)
        .where(eq(warehouses.userId, session.user.id));
      const MAX = 3;
      if (existing.length >= MAX) {
        return {
          handled: true,
          response: `Cannot create warehouse: maximum of ${MAX} warehouses reached.`,
        };
      }

      const [created] = await db
        .insert(warehouses)
        .values({
          userId: session.user.id,
          name: parsed.name as string,
          width: (parsed.width as number) || 800,
          height: (parsed.height as number) || 600,
        })
        .returning();
      return {
        handled: true,
        response: `Warehouse "${created.name}" created successfully.`,
      };
    }

    // CREATE SHELF
    if (parsed.action === "create_shelf") {
      if (!parsed.name) {
        return { handled: true, response: "Missing required fields: name" };
      }
      if (!parsed.warehouseId && !parsed.warehouseName) {
        return {
          handled: true,
          response: "Missing required fields: warehouse name",
        };
      }

      let warehouseRecord;
      if (parsed.warehouseId) {
        const [w] = await db
          .select()
          .from(warehouses)
          .where(eq(warehouses.id, parsed.warehouseId as string));
        warehouseRecord = w;
      } else {
        const [w] = await db
          .select()
          .from(warehouses)
          .where(
            and(
              eq(warehouses.name, parsed.warehouseName as string),
              eq(warehouses.userId, session.user.id),
            ),
          );
        warehouseRecord = w;
      }

      if (!warehouseRecord) {
        return { handled: true, response: "Warehouse not found." };
      }

      const allItems = await db
        .select({ quantity: items.quantity })
        .from(items)
        .innerJoin(shelves, eq(items.shelfId, shelves.id))
        .where(eq(shelves.warehouseId, warehouseRecord.id));
      const total = allItems.reduce((s, it) => s + (it.quantity || 1), 0);
      if (
        Math.round((total / CAPACITY_LIMITS.WAREHOUSE_DEFAULT) * 100) >= 100
      ) {
        return {
          handled: true,
          response: "Cannot create shelf: warehouse at full capacity.",
        };
      }

      const [created] = await db
        .insert(shelves)
        .values({
          warehouseId: warehouseRecord.id,
          name: parsed.name as string,
          positionX: 100,
          positionY: 100,
          width: 100,
          depth: 50,
          rotation: 0,
          color: "#3B82F6",
        })
        .returning();
      return {
        handled: true,
        response: `Shelf "${created.name}" created successfully in warehouse "${warehouseRecord.name}".`,
      };
    }

    // CREATE ITEM
    if (parsed.action === "create_item") {
      if (!parsed.name) {
        return { handled: true, response: "Missing required fields: name" };
      }
      if (!parsed.shelfId && !parsed.shelfName) {
        return {
          handled: true,
          response: "Missing required fields: shelf name",
        };
      }

      let shelfRecord;
      if (parsed.shelfId) {
        const [s] = await db
          .select()
          .from(shelves)
          .where(eq(shelves.id, parsed.shelfId as string));
        shelfRecord = s;
      } else {
        const [s] = await db
          .select()
          .from(shelves)
          .where(eq(shelves.name, parsed.shelfName as string));
        shelfRecord = s;
      }

      if (!shelfRecord) {
        return { handled: true, response: "Shelf not found." };
      }

      const [warehouseRecord] = await db
        .select()
        .from(warehouses)
        .where(eq(warehouses.id, shelfRecord.warehouseId));
      if (!warehouseRecord || warehouseRecord.userId !== session.user.id) {
        return { handled: true, response: "Shelf not accessible." };
      }

      const allItems = await db
        .select({ quantity: items.quantity })
        .from(items)
        .innerJoin(shelves, eq(items.shelfId, shelves.id))
        .where(eq(shelves.warehouseId, warehouseRecord.id));
      const total = allItems.reduce((s, it) => s + (it.quantity || 1), 0);
      if (
        Math.round((total / CAPACITY_LIMITS.WAREHOUSE_DEFAULT) * 100) >= 100
      ) {
        return {
          handled: true,
          response: "Cannot create item: warehouse at full capacity.",
        };
      }

      const siblingItems = await db
        .select()
        .from(items)
        .where(and(eq(items.shelfId, shelfRecord.id), eq(items.parentId, "")));
      const maxSortOrder = siblingItems.reduce(
        (max, item) => Math.max(max, item.sortOrder),
        -1,
      );

      const [created] = await db
        .insert(items)
        .values({
          shelfId: shelfRecord.id,
          parentId: null,
          name: parsed.name as string,
          description: (parsed.description as string) || null,
          isContainer: parsed.isContainer === true,
          quantity: (parsed.quantity as number) || 1,
          path: "/",
          depth: 0,
          sortOrder: maxSortOrder + 1,
        })
        .returning();
      return {
        handled: true,
        response: `Item "${created.name}" created successfully on shelf "${shelfRecord.name}".`,
      };
    }

    return { handled: false };
  };

  // Try to intercept simple create commands before calling the AI model
  try {
    const cmdResult = await tryHandleCreateCommand(prompt);
    if (cmdResult.handled) {
      const translatedResponse = await translateResponse(
        cmdResult.response ?? "",
        userLang,
      );
      return NextResponse.json({ response: translatedResponse });
    }
  } catch (err) {
    console.error("Command handling error:", err);
  }

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
        "warehouse",
      ),
    );

    for (const shelf of warehouse.shelves) {
      allSuggestions.push(
        ...getCapacitySuggestions(
          shelf.capacity.utilizationPercent,
          `${warehouse.name} - ${shelf.name}`,
          "shelf",
        ),
      );
    }
  }

  const systemMessage = {
    role: "system",
    content: `
    You are an expert AI Warehouse Management Assistant.

    LANGUAGE RULE: You MUST respond in the same language the user wrote in.
    The user is writing in language code: "${userLang}". Always respond in that language.
    Never switch languages mid-response.

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

    CAPACITY LOGIC:
    - current = total items
    - remaining = capacity - current
    - utilization = (current / capacity) * 100 (round to whole number)

    RESPONSE STRUCTURE:
    - Summary: a brief (1-sentence) overview of the warehouse or requested item status.
    - Main metrics:
    - Current items: X
    - Max capacity: X
    - Remaining: X
    - Utilization: X%
    - Specific Details: mention only shelves relevant to the user's query or requiring attention.

    - Recommendations:
    - Combine similar suggestions (e.g., instead of listing 5 empty shelves, say "Shelves A, B, and C are empty; consider consolidating").
    - List suggestions and place each on a new line.

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
