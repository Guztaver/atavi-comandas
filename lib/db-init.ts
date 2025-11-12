import { auth } from "./auth-config";
import { db, initializeDatabase } from "./db";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";

const DB_INIT_FLAG_FILE = join(process.cwd(), ".database-initialized");

async function isDatabaseInitialized(): Promise<boolean> {
  try {
    return existsSync(DB_INIT_FLAG_FILE);
  } catch {
    return false;
  }
}

function markDatabaseInitialized() {
  try {
    writeFileSync(DB_INIT_FLAG_FILE, new Date().toISOString());
  } catch (error) {
    console.warn("Could not write database initialization flag:", error);
  }
}

export async function initializeApp() {
  try {
    // Check if database is already initialized
    if (await isDatabaseInitialized()) {
      // Only log in development mode to reduce noise
      if (process.env.NODE_ENV === 'development') {
        console.log("Database already initialized. Skipping initialization.");
      }
      return;
    }

    console.log("Initializing application database...");

    // Initialize database and create default menu items
    await initializeDatabase();

    // Create default users
    const defaultUsers = [
      {
        name: "Administrador",
        email: "admin@atavi.com",
        password: "admin123",
        role: "admin" as const,
      },
      {
        name: "Cozinha",
        email: "kitchen@atavi.com",
        password: "cozinha123",
        role: "kitchen" as const,
      },
      {
        name: "Delivery",
        email: "delivery@atavi.com",
        password: "delivery123",
        role: "delivery" as const,
      },
    ];

    for (const userData of defaultUsers) {
      try {
        // Check if user already exists
        const existingUsers = await db.query.users.findMany({
          where: (users, { eq }) => eq(users.email, userData.email),
        });

        if (existingUsers.length === 0) {
          await auth.api.signUpEmail({
            body: userData,
          });
          console.log(`Created default user: ${userData.email}`);
        } else {
          console.log(`User already exists: ${userData.email}`);
        }
      } catch (error) {
        console.error(`Failed to create user ${userData.email}:`, error);
      }
    }

    // Mark database as initialized
    markDatabaseInitialized();
    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Failed to initialize application:", error);
    throw error;
  }
}

