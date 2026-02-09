import { betterAuth } from "better-auth";
import { pool } from "@/lib/db";

// Create Better Auth instance with PostgreSQL database adapter
export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "Ix8VG1V8AcbECliujtd2snDxAmMvVxX5",

  // Use PostgreSQL database for persistent session storage
  database: pool,

  advanced: {
    useSecureCookies: false,
    cookiePrefix: "better-auth",
    generateId: () => Math.random().toString(36).substring(2, 15),
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async () => {},
    sendVerificationEmail: async () => {},
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
    // Set JWT as true to enable token-based authentication
    jwt: true,
  },

  account: {
    accountLinking: {
      enabled: false,
    },
  },
});
