import { betterAuth } from "better-auth";

// Create Better Auth instance for server-side use
// This mirrors the configuration in /api/auth/[...all]/route.ts
export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "Ix8VG1V8AcbECliujtd2snDxAmMvVxX5",

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
