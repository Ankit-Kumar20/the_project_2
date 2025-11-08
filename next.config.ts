import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.REPLIT_DOMAINS ? [process.env.REPLIT_DOMAINS.split(",")[0]] : [],
};

export default nextConfig;
