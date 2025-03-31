import type { NextConfig } from "next";
// makes sure it can get images from google api
const nextConfig: NextConfig = {
  images: {
    domains: ['books.google.com'],
  },
};

export default nextConfig;
