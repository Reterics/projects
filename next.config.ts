import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: [],
    },
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
