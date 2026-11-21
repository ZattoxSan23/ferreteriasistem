import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  serverExternalPackages: ["@prisma/client"],
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
