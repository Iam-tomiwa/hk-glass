import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Only proxy in development. In production, we call the API directly to avoid proxying traffic.
    if (process.env.NODE_ENV === "production") {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: "https://backend.glasstronictech.org/api/:path*",
      },
    ];
  },
};

export default nextConfig;
