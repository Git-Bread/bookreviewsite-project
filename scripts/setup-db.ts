import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsFolder = join(__dirname, '../drizzle');

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  // Database path
  const dbPath = process.env.DATABASE_URL || './database.db';
  
  // Create db directory if it doesn't exist
  const dbDir = dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Initialize database
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);
  
  // Run migrations
  console.log('🔄 Running migrations...');
  await migrate(db, { migrationsFolder });
  
  console.log('✅ Database setup complete');
  
  return db;
}
export default setupDatabase;

// Only run directly if this script is called directly
if (require.main === module) {
    setupDatabase()
      .catch(e => {
        console.error('❌ Database setup error:', e);
        process.exit(1);
      });
  }