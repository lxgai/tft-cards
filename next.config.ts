import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static: no server, no API routes, no runtime data fetching.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
