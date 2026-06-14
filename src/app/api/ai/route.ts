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

  const tryHandleCreateCommand = async (text: string) => {
    const normalized = text.trim();

    const parseKVs = (s: string) => {
      const kv: Record<string, string> = {};
      const re = /([a-zA-Z0-9_]+)=((?:\"[^\"]+\")|(?:'[^']+')|(?:[^\s]+))/g;
      let m;
      while ((m = re.exec(s))) {
        let val = m[2];
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        kv[m[1]] = val;
      }
      return kv;
    };

    const extractName = (s: string) => {
      const match = s.match(
        /(?:named?|called|with name|з назвою|називається|під назвою|назва)\s+["']?([^"',]+?)["']?(?:\s+\w+=|$)/i,
      );
      return match ? match[1].trim() : undefined;
    };

    const extractWarehouseName = (s: string) => {
      const match = s.match(
        /(?:in warehouse|in the warehouse|у склад[іу]|на склад[іу]|склад)\s+["']?([^"',\n]+?)["']?(?:\s+\w+=|$)/i,
      );
      return match ? match[1].trim() : undefined;
    };

    const isCreateWarehouse =
      /\bcreate\s+(?:a\s+)?warehouse\b/i.test(normalized) ||
      /\bстворити?\s+склад\b/i.test(normalized) ||
      /\bдодати?\s+склад\b/i.test(normalized);

    const isCreateShelf =
      /\bcreate\s+(?:a\s+)?shelf\b/i.test(normalized) ||
      /\bстворити?\s+полиц[юі]\b/i.test(normalized) ||
      /\bдодати?\s+полиц[юі]\b/i.test(normalized) ||
      /\bстворити?\s+поличк[уи]\b/i.test(normalized) ||
      /\bдодати?\s+поличк[уи]\b/i.test(normalized);

    const isCreateItem =
      /\bcreate\s+(?:an?\s+)?item\b/i.test(normalized) ||
      /\bстворити?\s+(?:предмет|товар|елемент)\b/i.test(normalized) ||
      /\bдодати?\s+(?:предмет|товар|елемент)\b/i.test(normalized);

    // CREATE WAREHOUSE
    if (isCreateWarehouse) {
      const rest = normalized.replace(
        /.*(?:\bcreate\s+(?:a\s+)?warehouse|\bстворити?\s+склад|\bдодати?\s+склад)[:\s]*/i,
        "",
      );
      const kv = parseKVs(rest);
      if (!kv.name)
        kv.name = extractName(normalized) ?? extractName(rest) ?? "";
      if (!kv.name)
        return { handled: true, response: "Missing required fields: name" };

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

      const width = kv.width ? Number(kv.width) : 800;
      const height = kv.height ? Number(kv.height) : 600;

      const [created] = await db
        .insert(warehouses)
        .values({ userId: session.user.id, name: kv.name, width, height })
        .returning();
      return {
        handled: true,
        response: `Warehouse "${created.name}" created successfully.`,
      };
    }

    // CREATE SHELF
    if (isCreateShelf) {
      const rest = normalized.replace(
        /.*(?:\bcreate\s+(?:a\s+)?shelf|\bстворити?\s+полиц[юі]|\bдодати?\s+полиц[юі]|\bстворити?\s+поличк[уи]|\bдодати?\s+поличк[уи])[:\s]*/i,
        "",
      );
      const kv = parseKVs(rest);
      if (!kv.name)
        kv.name = extractName(normalized) ?? extractName(rest) ?? "";
      if (!kv.warehouseName)
        kv.warehouseName =
          extractWarehouseName(normalized) ?? extractWarehouseName(rest) ?? "";

      const missing: string[] = [];
      if (!kv.warehouseId && !kv.warehouseName)
        missing.push("warehouseId or warehouseName");
      if (!kv.name) missing.push("name");
      if (missing.length)
        return {
          handled: true,
          response: `Missing required fields: ${missing.join(", ")}`,
        };

      let warehouseRecord;
      if (kv.warehouseId) {
        const [w] = await db
          .select()
          .from(warehouses)
          .where(eq(warehouses.id, kv.warehouseId));
        warehouseRecord = w;
      } else {
        const [w] = await db
          .select()
          .from(warehouses)
          .where(
            and(
              eq(warehouses.name, kv.warehouseName),
              eq(warehouses.userId, session.user.id),
            ),
          );
        warehouseRecord = w;
      }

      if (!warehouseRecord)
        return { handled: true, response: "Warehouse not found." };

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
          name: kv.name,
          positionX: kv.positionX ? Number(kv.positionX) : 100,
          positionY: kv.positionY ? Number(kv.positionY) : 100,
          width: kv.width ? Number(kv.width) : 100,
          depth: kv.depth ? Number(kv.depth) : 50,
          rotation: kv.rotation ? Number(kv.rotation) : 0,
          color: kv.color || "#3B82F6",
        })
        .returning();
      return {
        handled: true,
        response: `Shelf "${created.name}" created successfully in warehouse "${warehouseRecord.name}".`,
      };
    }

    // CREATE ITEM
    if (isCreateItem) {
      const rest = normalized.replace(
        /.*(?:\bcreate\s+(?:an?\s+)?item|\bстворити?\s+(?:предмет|товар|елемент)|\bдодати?\s+(?:предмет|товар|елемент))[:\s]*/i,
        "",
      );
      const kv = parseKVs(rest);
      if (!kv.name)
        kv.name = extractName(normalized) ?? extractName(rest) ?? "";

      const missing: string[] = [];
      if (!kv.shelfId && !kv.shelfName) missing.push("shelfId or shelfName");
      if (!kv.name) missing.push("name");
      if (missing.length)
        return {
          handled: true,
          response: `Missing required fields: ${missing.join(", ")}`,
        };

      let shelfRecord;
      if (kv.shelfId) {
        const [s] = await db
          .select()
          .from(shelves)
          .where(eq(shelves.id, kv.shelfId));
        shelfRecord = s;
      } else {
        const [s] = await db
          .select()
          .from(shelves)
          .where(eq(shelves.name, kv.shelfName));
        shelfRecord = s;
      }

      if (!shelfRecord) return { handled: true, response: "Shelf not found." };

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

      const parentId = kv.parentId || null;
      let path = "/";
      let depth = 0;
      if (parentId) {
        const [parentItem] = await db
          .select()
          .from(items)
          .where(eq(items.id, parentId));
        if (!parentItem || parentItem.shelfId !== shelfRecord.id)
          return {
            handled: true,
            response: "Parent item not found or not in same shelf.",
          };
        if (!parentItem.isContainer)
          return { handled: true, response: "Parent must be a container." };
        path = `${parentItem.path}${parentItem.id}/`;
        depth = parentItem.depth + 1;
      }

      const siblingItems = await db
        .select()
        .from(items)
        .where(
          and(
            eq(items.shelfId, shelfRecord.id),
            parentId ? eq(items.parentId, parentId) : eq(items.parentId, ""),
          ),
        );
      const maxSortOrder = siblingItems.reduce(
        (max, item) => Math.max(max, item.sortOrder),
        -1,
      );

      const [created] = await db
        .insert(items)
        .values({
          shelfId: shelfRecord.id,
          parentId,
          name: kv.name,
          description: kv.description || null,
          isContainer: kv.isContainer === "true" || kv.isContainer === "1",
          quantity: kv.quantity ? Number(kv.quantity) : 1,
          path,
          depth,
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
      return NextResponse.json({ response: cmdResult.response });
    }
  } catch (err) {
    console.error("Command handling error:", err);
    // fall through to AI
  }

  // Only fetch warehouse context when we actually need it for the AI
  const warehouseData = await getWarehouseContext(session.user.id);

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
    - Main metrics: 
    - Current items: X 
    - Max capacity: X 
    - Remaining: X 
    - Utilization: X% 
    - Specific Details: mention only shelves relevant to the user's query or requiring attention. 
    
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
