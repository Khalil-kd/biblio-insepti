import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://login.microsoftonline.com https://blogs.microsoft.com https://cdn.sanity.io https://www.anthropic.com https://storage.googleapis.com",
  "font-src 'self' data:",
  "connect-src 'self' https://login.microsoftonline.com https://graph.microsoft.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://login.microsoftonline.com",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  images: { remotePatterns: [
    { protocol: "https", hostname: "blogs.microsoft.com" },
    { protocol: "https", hostname: "cdn.sanity.io" },
    { protocol: "https", hostname: "www.anthropic.com" },
    { protocol: "https", hostname: "storage.googleapis.com" },
  ] },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
