/** @type {import('next').NextConfig} */

// Content Security Policy directives
const cspDirectives = [
  "default-src 'self'",
  // Scripts: self + inline (needed for Next.js) + eval in dev only + Vercel analytics
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  // Styles: self + inline (needed for styled-jsx, Tailwind, etc.)
  "style-src 'self' 'unsafe-inline'",
  // Images: self + data URIs + blob (Next.js image optimization) + Cloudinary
  "img-src 'self' data: blob: https://res.cloudinary.com",
  // Fonts: self + data URIs
  "font-src 'self' data:",
  // Connect: self for API routes + Cloudinary + Vercel analytics
  "connect-src 'self' https://res.cloudinary.com https://api.cloudinary.com https://vitals.vercel-insights.com",
  // Media: self
  "media-src 'self'",
  // Object: none (no plugins)
  "object-src 'none'",
  // Frame ancestors: none (equivalent to X-Frame-Options: DENY)
  "frame-ancestors 'none'",
  // Base URI: self
  "base-uri 'self'",
  // Form action: self
  "form-action 'self'",
  // Upgrade insecure requests in production
  "upgrade-insecure-requests",
];

const ContentSecurityPolicy = cspDirectives.join('; ');

// Security headers configuration
const securityHeaders = [
  {
    // Content Security Policy
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
  {
    // HTTP Strict Transport Security
    // max-age: 2 years, includeSubDomains, preload-ready
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Prevent clickjacking
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Prevent MIME type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Control referrer information
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Permissions Policy (formerly Feature Policy)
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes except API routes
        // API routes return JSON and don't need browser security headers
        source: '/((?!api/).*)',
        headers: securityHeaders,
      },
      {
        // Apply minimal headers to API routes (no CSP needed for JSON responses)
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
