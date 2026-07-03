import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  /**
   * Allow the cloud preview panel (preview-chat-*.space-z.ai) and any other
   * sandbox subdomain to load /_next/* resources without triggering the
   * Next.js cross-origin dev warning. The session id in the subdomain
   * changes per conversation, so we wildcard the host.
   */
  allowedDevOrigins: ["*.space-z.ai"],
};

export default nextConfig;
