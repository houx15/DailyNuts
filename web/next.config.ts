import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// In dev, always use "". In production, use NEXT_PUBLIC_BASE_PATH env or "/DailyNuts" for the default project site.
// For custom domains, set NEXT_PUBLIC_BASE_PATH="" in your deploy environment.
const basePath = isDev
  ? ""
  : (process.env.NEXT_PUBLIC_BASE_PATH ?? "/DailyNuts");

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  distDir: "dist",
};

export default nextConfig;
