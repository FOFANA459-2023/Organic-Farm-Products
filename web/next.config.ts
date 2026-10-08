import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "127.0.0.1";

const nextConfig: NextConfig = {
  transpilePackages: ["@ofp/shared"],
  images: {
    // Product photos are served from Supabase Storage; Cloudflare has no Next image optimiser by default.
    unoptimized: true,
    remotePatterns: [{ hostname: supabaseHost }],
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
