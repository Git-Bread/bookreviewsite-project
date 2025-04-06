import db from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// script to create an admin user in the database, if it doesn't exist
// or update an existing user to admin if they exist.
async function createAdmin() {
  console.log('Admin User Creation Tool');
  console.log('------------------------');
  
  // Prompt for username
  rl.question('Enter username for admin: ', async (username) => {
    if (!username) {
      console.error('Username cannot be empty');
      rl.close();
      return;
    }
    
    // Prompt for password
    rl.question('Enter password (min 8 characters): ', async (password) => {
      if (password.length < 8) {
        console.error('Password must be at least 8 characters long');
        rl.close();
        return;
      }
      
      try {
        // Check if user exists
        const existingUser = await db.select()
          .from(users)
          .where(eq(users.username, username))
          .get();
        
        if (existingUser) {
          // Update existing user to admin - schema property name
          await db.update(users)
            .set({ 
              admin: true,  // map to "is_admin" in the database
              password: await bcrypt.hash(password, 10),
              updatedAt: new Date() 
            })
            .where(eq(users.id, existingUser.id));
            
          console.log(`User "${username}" updated to admin successfully`);
        } else {
          // Create new admin use
          await db.insert(users)
            .values({
              username,
              password: await bcrypt.hash(password, 10),
              admin: true,  // map to "is_admin" in the database
              createdAt: new Date()
            });
            
          console.log(`Admin user "${username}" created successfully`);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        rl.close();
      }
    });
  });
}

createAdmin();