import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { users, sessions, accounts, verifications } from "./db/schema";

export const auth = betterAuth({
  // Database configuration
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      users,
      sessions,
      accounts,
      verifications,
    },
  }),

  // User configuration
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "kitchen",
        required: false,
        input: false,
      },
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Email and password configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },

  // Advanced configuration
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // URL configuration
  basePath: "/api/auth",
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export type Session = typeof auth.$Infer.Session;

// Helper functions for user management
export async function createDefaultUsers() {
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
      // Use the signUpEmail API with additional fields
      await auth.api.signUpEmail({
        body: userData,
      });
      console.log(`Created default user: ${userData.email}`);
    } catch (error) {
      console.error(`Failed to create user ${userData.email}:`, error);
    }
  }
}

export default auth;