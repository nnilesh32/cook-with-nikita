import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the user's home directory otherwise confuses
  // Next.js's workspace-root inference.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
