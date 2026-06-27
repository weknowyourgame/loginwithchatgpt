import type { NextConfig } from "next";

const config: NextConfig = {
  // The SDK ships TypeScript source; let Next transpile it.
  transpilePackages: ["loginwithchatgpt"],
};

export default config;
