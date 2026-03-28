import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Vercel can handle both static and dynamic routes
  // basePath: '/App', // Remove if hosting on a root domain
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'obrzfvcaaidyzhbzsdqa.supabase.co',
      },
    ],
  },
};

export default nextConfig;
