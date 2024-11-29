import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: [],
    },
    reactStrictMode: true,
};

export default nextConfig;
