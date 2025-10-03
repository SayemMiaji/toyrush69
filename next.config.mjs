/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif','image/webp'],
    minimumCacheTTL: 60*60*24*7,
    remotePatterns: [
      { protocol: 'https', hostname: 'freeimage.host' },
      { protocol: 'http', hostname: 'freeimage.host' },
      // Freeimage CDN domains often include iili.io and i.ibb.co mirrors
      { protocol: 'https', hostname: 'iili.io' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ibb.co.com' },
      { protocol: 'https', hostname: 'i.ibb.co.com' }
    ],
  },
  // Optional: allow LAN dev (silences the dev origin warning)
  // allowedDevOrigins: ['http://localhost:3000'],
}

export default nextConfig
