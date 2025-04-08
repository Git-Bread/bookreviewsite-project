import { drizzle } from "drizzle-orm/better-sqlite3";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

// Use a path that will be writable in your deployment environment
const dbPath = process.env.DATABASE_URL || './data/database.db';

// Define the database type
type DB = BetterSQLite3Database<typeof schema>;

// Create directory if it doesn't exist (only in server environment)
if (typeof window === 'undefined') {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// Database setup with proper typing
let db: DB;
try {
  // Only try to connect on server and when not building
  if (typeof window === 'undefined' && !(process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build')) {
    const sqlite = new Database(dbPath);
    db = drizzle(sqlite, { schema });
  } else {
    // During build or on client, use a dummy DB
    throw new Error('Not connecting during build or on client side');
  }
} catch (error) {
  console.error("Database connection error:", error);
  
  // Create mock DB during build time or on client
  const mockDb = {} as Partial<DB>;
  db = mockDb as DB;
}

export default db;