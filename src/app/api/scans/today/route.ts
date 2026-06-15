import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db, scans } from "@/lib/schema";

export async function GET() {
  try {
    const session = await auth();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If user is authenticated, return their personal scan count.
    // Otherwise return the total scans across all users for today (public view).
    // Use the database current date to avoid timezone mismatches between
    // server JS and the DB. Match scan rows where the date part equals today.
    const dateCondition = sql`date(${scans.createdAt}) = CURRENT_DATE`;

    const whereClause = session?.user?.id
      ? sql`${scans.userId} = ${session.user.id} AND ${dateCondition}`
      : dateCondition;

    const result = await db
      .select({ total: sql<number>`coalesce(sum(${scans.itemCount}), 0)` })
      .from(scans)
      .where(whereClause);

    return NextResponse.json({ count: Number(result[0]?.total ?? 0) });
  } catch (error) {
    console.error("Error fetching scan count:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan count" },
      { status: 500 },
    );
  }
}
