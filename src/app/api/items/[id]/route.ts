import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db, items, shelves, warehouses } from "@/lib/schema";

// Helper to verify item ownership
async function verifyItemOwnership(itemId: string, userId: string) {
  const [item] = await db.select().from(items).where(eq(items.id, itemId));

  if (!item) return null;

  const [shelf] = await db
    .select()
    .from(shelves)
    .where(eq(shelves.id, item.shelfId));

  if (!shelf) return null;

  const [warehouse] = await db
    .select()
    .from(warehouses)
    .where(
      and(eq(warehouses.id, shelf.warehouseId), eq(warehouses.userId, userId)),
    );

  if (!warehouse) return null;

  return item;
}

// GET - Get a single item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await verifyItemOwnership(id, session.user.id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Get children if it's a container
    let children: (typeof item)[] = [];
    if (item.isContainer) {
      children = await db.select().from(items).where(eq(items.parentId, id));
    }

    return NextResponse.json({ ...item, children });
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 },
    );
  }
}

// PATCH - Update an item
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await verifyItemOwnership(id, session.user.id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;

    // Handle parent change (moving item)
    if (body.parentId !== undefined && body.parentId !== item.parentId) {
      const newParentId = body.parentId;

      if (newParentId) {
        const [newParent] = await db
          .select()
          .from(items)
          .where(eq(items.id, newParentId));

        if (!newParent || newParent.shelfId !== item.shelfId) {
          return NextResponse.json(
            { error: "New parent not found" },
            { status: 404 },
          );
        }

        if (!newParent.isContainer) {
          return NextResponse.json(
            { error: "New parent must be a container" },
            { status: 400 },
          );
        }

        updateData.parentId = newParentId;
        updateData.path = `${newParent.path}${newParent.id}/`;
        updateData.depth = newParent.depth + 1;
      } else {
        updateData.parentId = null;
        updateData.path = "/";
        updateData.depth = 0;
      }
    }

    const [updated] = await db
      .update(items)
      .set(updateData)
      .where(eq(items.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 },
    );
  }
}

// DELETE - Delete an item (and all children if it's a container)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await verifyItemOwnership(id, session.user.id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete all descendants if it's a container
    if (item.isContainer) {
      // Delete items that have this item's path in their path (descendants)
      const descendants = await db
        .select()
        .from(items)
        .where(eq(items.shelfId, item.shelfId));

      const descendantIds = descendants
        .filter((d) => d.path.startsWith(`${item.path}${item.id}/`))
        .map((d) => d.id);

      for (const descId of descendantIds) {
        await db.delete(items).where(eq(items.id, descId));
      }
    }

    await db.delete(items).where(eq(items.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 },
    );
  }
}
