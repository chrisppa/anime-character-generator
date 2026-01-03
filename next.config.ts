import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["three"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
