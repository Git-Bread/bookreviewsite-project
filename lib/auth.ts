import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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

        try {
          // Find user in database
          const user = await db.select()
            .from(users)
            .where(eq(users.username, credentials.username))
            .get();

          if (!user) {
            return null;
          }

          // Verify password
          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          if (!passwordMatch) {
            return null;
          }

          // Return user data
          return {
            id: String(user.id),
            name: user.username,
            isAdmin: user.isAdmin // Include admin status
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    // JWT callback to include isAdmin in token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin ?? false; // Default to false if not provided
      }
      return token;
    },
    // Session callback to include isAdmin in session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/' // Uses modal not page
  },
  session: {
    strategy: "jwt"
  }
};