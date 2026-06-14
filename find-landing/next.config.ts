import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export for Cloudflare Pages (fully static site — no API routes / server actions).
  output: 'export',
  images: {
    // CF Pages has no Next image optimizer; serve images as-is.
    unoptimized: true,
    qualities: [75, 85, 90],
  },
}

export default nextConfig
