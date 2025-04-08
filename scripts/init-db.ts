import setupDatabase from './setup-db';
import db from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function initializeDatabase() {
  console.log('🚀 Initializing database...');
  
  // First set up the database and run migrations
  await setupDatabase();
  
  // Then seed the admin user
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpass';
    
    console.log(`🔑 Checking for admin user: ${adminUsername}`);
    
    // Check if admin user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.username, adminUsername))
      .get();
    
    if (existingUser) {
      console.log(`👑 Admin user "${adminUsername}" already exists`);
    } else {
      // Create new admin user
      console.log(`👤 Creating admin user "${adminUsername}"`);
      await db.insert(users)
        .values({
          username: adminUsername,
          password: await bcrypt.hash(adminPassword, 10),
          admin: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      console.log('✅ Admin user created successfully');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
  
  console.log('✅ Database initialization complete');
}

// Run the initialization
initializeDatabase()
  .catch(e => {
    console.error('❌ Database initialization error:', e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });