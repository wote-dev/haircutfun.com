import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Cloudflare Pages
  images: {
    unoptimized: true
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
