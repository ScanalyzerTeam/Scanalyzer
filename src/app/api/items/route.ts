import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db, items, shelves, warehouses } from "@/lib/schema";

// GET - List all items for a shelf
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shelfId = searchParams.get("shelfId");

    if (!shelfId) {
      return NextResponse.json(
        { error: "shelfId is required" },
        { status: 400 },
      );
    }

    // Verify shelf ownership through warehouse
    const [shelf] = await db
      .select()
      .from(shelves)
      .where(eq(shelves.id, shelfId));

    if (!shelf) {
      return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
    }

    const [warehouse] = await db
      .select()
      .from(warehouses)
      .where(
        and(
          eq(warehouses.id, shelf.warehouseId),
          eq(warehouses.userId, session.user.id),
        ),
      );

    if (!warehouse) {
      return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
    }

    const shelfItems = await db
      .select()
      .from(items)
      .where(eq(items.shelfId, shelfId));

    return NextResponse.json(shelfItems);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 },
    );
  }
}

// POST - Create a new item
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      shelfId,
      parentId = null,
      name,
      description = null,
      isContainer = false,
      quantity = 1,
    } = body;

    if (!shelfId || !name) {
      return NextResponse.json(
        { error: "shelfId and name are required" },
        { status: 400 },
      );
    }

    // Verify shelf ownership through warehouse
    const [shelf] = await db
      .select()
      .from(shelves)
      .where(eq(shelves.id, shelfId));

    if (!shelf) {
      return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
    }

    const [warehouse] = await db
      .select()
      .from(warehouses)
      .where(
        and(
          eq(warehouses.id, shelf.warehouseId),
          eq(warehouses.userId, session.user.id),
        ),
      );

    if (!warehouse) {
      return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
    }

    // Calculate path and depth based on parent
    let path = "/";
    let depth = 0;

    if (parentId) {
      const [parentItem] = await db
        .select()
        .from(items)
        .where(eq(items.id, parentId));

      if (!parentItem || parentItem.shelfId !== shelfId) {
        return NextResponse.json(
          { error: "Parent item not found" },
          { status: 404 },
        );
      }

      if (!parentItem.isContainer) {
        return NextResponse.json(
          { error: "Parent must be a container" },
          { status: 400 },
        );
      }

      path = `${parentItem.path}${parentItem.id}/`;
      depth = parentItem.depth + 1;
    }

    // Get the max sortOrder for items in the same parent
    const siblingItems = await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.shelfId, shelfId),
          parentId ? eq(items.parentId, parentId) : eq(items.parentId, ""),
        ),
      );

    const maxSortOrder = siblingItems.reduce(
      (max, item) => Math.max(max, item.sortOrder),
      -1,
    );

    const [newItem] = await db
      .insert(items)
      .values({
        shelfId,
        parentId,
        name,
        description,
        isContainer,
        quantity,
        path,
        depth,
        sortOrder: maxSortOrder + 1,
      })
      .returning();

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );
  }
}
