import type { NextConfig } from "next";

// Custom domain (digest.kookat.icu) needs empty basePath.
// GitHub project site (houx15.github.io/DailyNuts) needs "/DailyNuts".
// Set NEXT_PUBLIC_BASE_PATH="/DailyNuts" in workflow for project-only deploys.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
