import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

//database setup
const sqlite = new Database(process.env.DATABASE_URL || './database.db');
const db = drizzle(sqlite, { schema });

export default db;