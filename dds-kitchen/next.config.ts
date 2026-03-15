// dds-kitchen/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Change '/App' to match your repository name exactly if it's different
  basePath: '/App', 
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export on GitHub Pages
  },
};

export default nextConfig;
