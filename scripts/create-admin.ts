import db from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
          // Update existing user to admin
          await db.update(users)
            .set({ 
              isAdmin: true,
              password: await bcrypt.hash(password, 10),
              updatedAt: new Date() 
            })
            .where(eq(users.id, existingUser.id));
            
          console.log(`User "${username}" updated to admin successfully`);
        } else {
          // Create new admin user
          await db.insert(users)
            .values({
              username,
              password: await bcrypt.hash(password, 10),
              isAdmin: true,
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