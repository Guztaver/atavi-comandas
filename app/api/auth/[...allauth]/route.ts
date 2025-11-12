import { auth } from "@/lib/auth-config";
import { toNextJsHandler } from "better-auth/next-js";
import { initializeDatabase } from "@/lib/db";

// Initialize database on first request
let dbInitialized = false;

const handler = async (request: Request) => {
  // Initialize database on first request
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
      console.log("Database initialized successfully for auth");
    } catch (error) {
      console.error("Failed to initialize database for auth:", error);
      // Continue anyway - Better Auth will create its own tables
    }
  }

  return auth.handler(request);
};

export const { GET, POST } = toNextJsHandler(handler);