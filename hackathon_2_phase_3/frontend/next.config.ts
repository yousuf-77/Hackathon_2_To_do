import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker/Railway deployment
  output: 'standalone',
  serverExternalPackages: [
    "jsonwebtoken",
    // Phase 3: AI SDK packages for ChatKit integration
    "@ai-sdk/cohere",
    "@ai-sdk/openai",
  ],
};

export default nextConfig;
