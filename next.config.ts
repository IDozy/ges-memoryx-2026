import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Solo aplicar en el servidor (donde se usa Prisma)
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client-runtime-utils': path.join(
          __dirname,
          'node_modules/@prisma/client-runtime-utils'
        ),
      };
    }
    return config;
  },
};

export default nextConfig;