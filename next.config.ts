import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["100.116.183.7"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vegmgtqjlsqbwqgmlarq.supabase.co",
        pathname: '/storage/v1/object/public/avatars/**',
      },
    ]
  }
};

export default nextConfig;
