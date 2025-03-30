import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Find user in database
        const user = await db.select()
          .from(users)
          .where(eq(users.username, credentials.username))
          .get();

        if (!user) {
          return null;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        if (!isPasswordValid) {
          return null;
        }

        // Return user object without password
        return {
          id: user.id.toString(),
          name: user.username
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 5 * 24 * 60 * 60, // 5 daysb
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || (() => {
    console.error("ERROR: No NEXTAUTH_SECRET environment variable set!");
    console.error("Please set it NOW for security!");
    
    //big nope for production environment
    if (process.env.NODE_ENV === 'production') {
      throw new Error("Missing NEXTAUTH_SECRET in production environment");
    }
    
    return "Thisisthebestsecretkeyever...pleasechangeit";
  })(),
};