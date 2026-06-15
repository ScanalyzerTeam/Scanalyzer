import { and, eq, sum } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db, items, shelves, warehouses } from "@/lib/schema";

// GET - Get a single warehouse with its shelves
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

    const [warehouse] = await db
      .select()
      .from(warehouses)
      .where(
        and(eq(warehouses.id, id), eq(warehouses.userId, session.user.id)),
      );

    if (!warehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 },
      );
    }

    const warehouseShelves = await db
      .select()
      .from(shelves)
      .where(eq(shelves.warehouseId, id));

    // Get item quantities summed by shelf for this warehouse
    const itemCounts = await db
      .select({ shelfId: items.shelfId, quantity: sum(items.quantity) })
      .from(items)
      .innerJoin(shelves, eq(items.shelfId, shelves.id))
      .where(and(eq(shelves.warehouseId, id), eq(items.isContainer, false)))
      .groupBy(items.shelfId);

    const countsMap: Record<string, number> = {};
   itemCounts.forEach((r) => {
  countsMap[r.shelfId as string] = Number(r.quantity || 0);
});

    const shelvesWithCounts = warehouseShelves.map((s) => ({
      ...s,
      _count: { inventoryItems: countsMap[s.id] || 0 },
    }));

    return NextResponse.json({
      ...warehouse,
      shelves: shelvesWithCounts,
    });
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse" },
      { status: 500 },
    );
  }
}

// PATCH - Update a warehouse
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

    // Verify ownership
    const [existing] = await db
      .select()
      .from(warehouses)
      .where(
        and(eq(warehouses.id, id), eq(warehouses.userId, session.user.id)),
      );

    if (!existing) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.width !== undefined) updateData.width = body.width;
    if (body.height !== undefined) updateData.height = body.height;

    const [updated] = await db
      .update(warehouses)
      .set(updateData)
      .where(eq(warehouses.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to update warehouse" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a warehouse
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

    // Verify ownership
    const [existing] = await db
      .select()
      .from(warehouses)
      .where(
        and(eq(warehouses.id, id), eq(warehouses.userId, session.user.id)),
      );

    if (!existing) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 },
      );
    }

    await db.delete(warehouses).where(eq(warehouses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 },
    );
  }
}
