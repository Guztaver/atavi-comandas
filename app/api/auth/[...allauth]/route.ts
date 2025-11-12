import { auth } from "@/lib/auth-config";
import { toNextJsHandler } from "better-auth/next-js";
import { initializeApp } from "@/lib/db-init";

// Initialize the app once on module load (server-side only)
let initializationPromise: Promise<void> | null = null;

async function ensureInitialized() {
  if (!initializationPromise) {
    initializationPromise = initializeApp();
  }
  return initializationPromise;
}

// Wrap the auth handler to ensure initialization
const handler = async (request: Request) => {
  await ensureInitialized();
  return auth.handler(request);
};

export const { GET, POST } = toNextJsHandler(handler);