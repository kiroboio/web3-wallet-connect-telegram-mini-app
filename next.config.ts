import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/marketplace',
        destination: '/',
        permanent: true,
      },
    ];
  },
  webpack: (config) => {
    // Add the fallback configuration
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig