import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "ubiquitous-cod-9g5pvpgp9v53pqvq-3000.app.github.dev"
      ],
    },
  },
};

export default nextConfig;