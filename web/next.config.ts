import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages project site: https://houx15.github.io/DailyNuts/
  basePath: isDev ? "" : "/DailyNuts",
  assetPrefix: isDev ? "" : "/DailyNuts",
  images: {
    unoptimized: true, // required for static export
  },
  distDir: "dist",
};

export default nextConfig;
