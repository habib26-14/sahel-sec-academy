/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (bucket course-media, couvertures de cours)
      { protocol: 'https', hostname: '**supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '**supabase.co', pathname: '/storage/v1/render/image/public/**' },
      // Images Medium (widget CyberVice)
      { protocol: 'https', hostname: 'cdn-images-1.medium.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn-images-1.medium.com', pathname: '/max/**' },
      { protocol: 'https', hostname: '*.medium.com', pathname: '/**' },
    ],
  },
  poweredByHeader: false,
  // H4 : en-têtes de sécurité appliqués à toutes les réponses.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // unsafe-inline/unsafe-eval gardeés pour l'hydratation Next.js ;
              // durcir (retrait) après passage à des chunks statiques si besoin.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              "font-src 'self' data:",
              "frame-src https://www.youtube-nocookie.com",
              "connect-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig