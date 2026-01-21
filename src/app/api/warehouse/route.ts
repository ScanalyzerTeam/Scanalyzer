import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db, items, shelves, warehouses } from "@/lib/schema";

const MAX_WAREHOUSES_PER_USER = 3;

// GET - List all warehouses for the current user with shelf and item counts
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWarehouses = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.userId, session.user.id));

    // Get shelf counts and item counts for each warehouse
    const warehousesWithCounts = await Promise.all(
      userWarehouses.map(async (warehouse) => {
        const [shelfCountResult] = await db
          .select({ count: count() })
          .from(shelves)
          .where(eq(shelves.warehouseId, warehouse.id));

        const [itemCountResult] = await db
          .select({ count: count() })
          .from(items)
          .innerJoin(shelves, eq(items.shelfId, shelves.id))
          .where(eq(shelves.warehouseId, warehouse.id));

        return {
          ...warehouse,
          shelfCount: shelfCountResult?.count || 0,
          itemCount: itemCountResult?.count || 0,
        };
      }),
    );

    return NextResponse.json(warehousesWithCounts);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 },
    );
  }
}

// POST - Create a new warehouse
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check warehouse limit
    const existingWarehouses = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.userId, session.user.id));

    if (existingWarehouses.length >= MAX_WAREHOUSES_PER_USER) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_WAREHOUSES_PER_USER} warehouses allowed` },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name, width = 800, height = 600 } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [newWarehouse] = await db
      .insert(warehouses)
      .values({
        userId: session.user.id,
        name,
        width,
        height,
      })
      .returning();

    return NextResponse.json(newWarehouse, { status: 201 });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to create warehouse" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a warehouse and all its shelves
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("id");

    if (!warehouseId) {
      return NextResponse.json(
        { error: "Warehouse ID is required" },
        { status: 400 },
      );
    }

    // Verify ownership
    const [warehouse] = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.id, warehouseId));

    if (!warehouse || warehouse.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 },
      );
    }

    // Delete all shelves first (cascade should handle this, but be explicit)
    await db.delete(shelves).where(eq(shelves.warehouseId, warehouseId));

    // Delete the warehouse
    await db.delete(warehouses).where(eq(warehouses.id, warehouseId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 },
    );
  }
}
