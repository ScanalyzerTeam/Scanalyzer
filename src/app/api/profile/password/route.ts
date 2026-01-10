import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db, users } from "@/lib/schema";

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dbUser = user[0];

    if (!dbUser.password) {
      return NextResponse.json(
        { error: "Cannot change password for OAuth accounts" },
        { status: 400 },
      );
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      dbUser.password,
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("[password] PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
