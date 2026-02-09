-- Better Auth Core Schema for PostgreSQL
-- This creates the required tables for Better Auth

-- Drop tables if they exist (for clean slate)
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- User table
CREATE TABLE "user" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN DEFAULT FALSE,
    "image" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session table
CREATE TABLE "session" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Account table
CREATE TABLE "account" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP,
    "refreshTokenExpiresAt" TIMESTAMP,
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("accountId", "providerId"),
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Verification table
CREATE TABLE "verification" (
    "id" TEXT PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX "session_userId_idx" ON "session" ("userId");
CREATE INDEX "session_token_idx" ON "session" ("token");
CREATE INDEX "session_expiresAt_idx" ON "session" ("expiresAt");
CREATE INDEX "account_userId_idx" ON "account" ("userId");
CREATE INDEX "account_providerId_idx" ON "account" ("providerId");
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");
CREATE INDEX "verification_expiresAt_idx" ON "verification" ("expiresAt");
