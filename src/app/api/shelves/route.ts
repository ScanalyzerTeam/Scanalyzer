import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db, shelves, warehouses } from "@/lib/schema";

// GET - List all shelves for a warehouse
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("warehouseId");

    if (!warehouseId) {
      return NextResponse.json(
        { error: "warehouseId is required" },
        { status: 400 },
      );
    }

    // Verify warehouse ownership
    const [warehouse] = await db
      .select()
      .from(warehouses)
      .where(
        and(
          eq(warehouses.id, warehouseId),
          eq(warehouses.userId, session.user.id),
        ),
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
      .where(eq(shelves.warehouseId, warehouseId));

    return NextResponse.json(warehouseShelves);
  } catch (error) {
    console.error("Error fetching shelves:", error);
    return NextResponse.json(
      { error: "Failed to fetch shelves" },
      { status: 500 },
    );
  }
}

// POST - Create a new shelf
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      warehouseId,
      name,
      positionX = 100,
      positionY = 100,
      width = 100,
      depth = 50,
      rotation = 0,
      color = "#3B82F6",
    } = body;

    if (!warehouseId || !name) {
      return NextResponse.json(
        { error: "warehouseId and name are required" },
        { status: 400 },
      );
    }

    // Verify warehouse ownership
    const [warehouse] = await db
      .select()
      .from(warehouses)
      .where(
        and(
          eq(warehouses.id, warehouseId),
          eq(warehouses.userId, session.user.id),
        ),
      );

    if (!warehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 },
      );
    }

    const [newShelf] = await db
      .insert(shelves)
      .values({
        warehouseId,
        name,
        positionX,
        positionY,
        width,
        depth,
        rotation,
        color,
      })
      .returning();

    return NextResponse.json(newShelf, { status: 201 });
  } catch (error) {
    console.error("Error creating shelf:", error);
    return NextResponse.json(
      { error: "Failed to create shelf" },
      { status: 500 },
    );
  }
}
