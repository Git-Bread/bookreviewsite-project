import { join } from "path";
import { initDb } from "../db/creator";

//path to the database file
const dbPath = join(process.cwd(), "sqlite.db");

// Initialize the database schema
initDb();

console.log("Database setup complete!");
console.log(`Database location: ${dbPath}`);