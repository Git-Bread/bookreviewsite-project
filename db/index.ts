import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import * as schema from "./schema";

//database setup
const sqlite = new Database(join(process.cwd(), "sqlite.db"));
const db = drizzle(sqlite, { schema });

export default db;