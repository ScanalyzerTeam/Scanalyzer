import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db, items, shelves, warehouses } from "@/lib/schema";

// GET - Get a single shelf with its items
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

    const [shelf] = await db.select().from(shelves).where(eq(shelves.id, id));

    if (!shelf) {
      return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
    }

    // Verify warehouse ownership
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
      .where(eq(items.shelfId, id));

    return NextResponse.json({
      ...shelf,
      items: shelfItems,
    });
  } catch (error) {
    console.error("Error fetching shelf:", error);
    return NextResponse.json(
      { error: "Failed to fetch shelf" },
      { status: 500 },
    );
  }
}

// PATCH - Update a shelf
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
    const body = await request.json();

    const [shelf] = await db.select().from(shelves).where(eq(shelves.id, id));

    if (!shelf) {
      return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
    }

    // Verify warehouse ownership
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

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.positionX !== undefined) updateData.positionX = body.positionX;
    if (body.positionY !== undefined) updateData.positionY = body.positionY;
    if (body.width !== undefined) updateData.width = body.width;
    if (body.depth !== undefined) updateData.depth = body.depth;
    if (body.rotation !== undefined) updateData.rotation = body.rotation;
    if (body.color !== undefined) updateData.color = body.color;

    const [updated] = await db
      .update(shelves)
      .set(updateData)
      .where(eq(shelves.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating shelf:", error);
    return NextResponse.json(
      { error: "Failed to update shelf" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a shelf
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

    const [shelf] = await db.select().from(shelves).where(eq(shelves.id, id));

    if (!shelf) {
      return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
    }

    // Verify warehouse ownership
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

    await db.delete(shelves).where(eq(shelves.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shelf:", error);
    return NextResponse.json(
      { error: "Failed to delete shelf" },
      { status: 500 },
    );
  }
}
