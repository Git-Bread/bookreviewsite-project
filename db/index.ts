import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

// Use a path that will be writable in your deployment environment
const dbPath = process.env.DATABASE_URL || './data/database.db';

// Create directory if it doesn't exist (only in server environment)
if (typeof window === 'undefined') {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// Database setup
let db;
try {
  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });
} catch (error) {
  console.error("Database connection error:", error);
  // Simple mock for build time
  db = {} as any;
}

export default db;