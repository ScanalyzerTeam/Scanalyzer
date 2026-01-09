import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

import { env } from "@/env.mjs";
import { db, users } from "@/lib/schema";
import { stripeServer } from "@/lib/stripe";

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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (!user || user.length === 0) {
          return null;
        }

        const dbUser = user[0];

        if (!dbUser.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          dbUser.password,
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          image: dbUser.image,
          stripeCustomerId: dbUser.stripeCustomerId || "",
          isActive: dbUser.isActive,
        };
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.stripeCustomerId = user.stripeCustomerId;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.stripeCustomerId = token.stripeCustomerId as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (!user.email || !user.name) return;

      await stripeServer.customers
        .create({
          email: user.email,
          name: user.name,
        })
        .then(async (customer) =>
          db
            .update(users)
            .set({ stripeCustomerId: customer.id })
            .where(eq(users.id, user.id!)),
        );
    },
  },
});
