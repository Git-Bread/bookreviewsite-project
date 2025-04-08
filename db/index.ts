import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { dirname } from 'path';
import fs from 'fs';

// Create a lazy-loaded database connection to avoid issues with serverless environments cough cough, Render
let _db: ReturnType<typeof drizzle> | null = null;

const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get: (target, prop) => {
    // Initialize database on first use
    if (!_db) {
      try {
        // Only run in server environment
        if (typeof window === 'undefined') {
          const dbPath = process.env.DATABASE_URL || './database.db';
          
          // Ensure directory exists
          const dbDir = dirname(dbPath);
          if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
          }
          
          const sqlite = new Database(dbPath);
          _db = drizzle(sqlite, { schema });
        } else {
          // Client side - return mock functions
          _db = {} as any;
        }
      } catch (error) {
        // If we're in build phase, just return a mock
        if (process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME) {
          console.warn('Using mock DB during build phase');
          _db = {} as any;
        } else {
          console.error('Database connection error:', error);
          throw error;
        }
      }
    }
    
    return _db?.[prop as keyof typeof _db] ?? {};
  }
});

export default db;