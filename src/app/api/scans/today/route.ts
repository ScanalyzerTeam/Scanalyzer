import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db, scans } from "@/lib/schema";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(scans)
      .where(
        sql`${scans.userId} = ${session.user.id} AND ${scans.createdAt} >= ${today}`,
      );

    return NextResponse.json({ count: Number(result[0]?.count ?? 0) });
  } catch (error) {
    console.error("Error fetching scan count:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan count" },
      { status: 500 },
    );
  }
}
