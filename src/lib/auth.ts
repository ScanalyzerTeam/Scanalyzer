import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

import { env } from "@/env.mjs";
import { db, users } from "@/lib/schema";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[auth] Missing email or password");
            return null;
          }

          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          if (!user || user.length === 0) {
            console.log("[auth] User not found:", credentials.email);
            return null;
          }

          const dbUser = user[0];

          if (!dbUser.password) {
            console.log("[auth] User has no password set:", dbUser.email);
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password as string,
            dbUser.password,
          );

          if (!passwordMatch) {
            console.log("[auth] Password mismatch for user:", dbUser.email);
            return null;
          }

          console.log("[auth] Authentication successful for:", dbUser.email);
          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
          };
        } catch (error) {
          console.error("[auth] Authorization error:", error);
          return null;
        }
      },
    }),
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      // Refresh user data when session is updated
      if (trigger === "update" && token.id) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);
        if (dbUser[0]) {
          token.name = dbUser[0].name;
          token.email = dbUser[0].email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
