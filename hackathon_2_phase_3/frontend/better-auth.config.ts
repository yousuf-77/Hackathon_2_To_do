import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Export Better Auth instance configuration for CLI
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
    jwt: true,
  },

  account: {
    accountLinking: {
      enabled: false,
    },
  },
});
