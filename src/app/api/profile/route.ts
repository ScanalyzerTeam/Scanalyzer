import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db, users } from "@/lib/schema";

export async function GET() {
  try {
    const session = await auth();

    console.log("[profile] GET - session user id:", session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        location: users.location,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    console.log("[profile] GET - user from db:", user[0]);

    if (!user || user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("[profile] GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    console.log("[profile] PUT - session:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      console.log("[profile] PUT - No user id in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, location, image } = body;

    console.log("[profile] PUT - body:", {
      name,
      email,
      location,
      image: image ? "[image data]" : null,
    });

    const updateData: {
      name?: string;
      email?: string;
      location?: string;
      image?: string;
    } = {};

    if (name !== undefined && name !== "") updateData.name = name;
    if (email !== undefined && email !== "") updateData.email = email;
    if (location !== undefined) updateData.location = location;
    if (image !== undefined) updateData.image = image;

    console.log("[profile] PUT - updateData:", {
      ...updateData,
      image: updateData.image ? "[image data]" : null,
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    console.log("[profile] PUT - Updating user:", session.user.id);
    await db.update(users).set(updateData).where(eq(users.id, session.user.id));
    console.log("[profile] PUT - Update complete");

    const updatedUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        location: users.location,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("[profile] PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
