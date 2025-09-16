import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Cloudflare Pages with OpenNext
  images: {
    unoptimized: true
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Required for OpenNext Cloudflare
    serverComponentsExternalPackages: ['@opennextjs/cloudflare']
  }
};

export default nextConfig;
