import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/marketplace',
        destination: '/',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
