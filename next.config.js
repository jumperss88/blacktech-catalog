import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  reactStrictMode: true,
  redirects,
  webpack: (webpackConfig, { dev }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Keep fast rebuilds in dev, but avoid flaky filesystem cache on some macOS setups
    // (ENOENT: .next/cache/webpack/*.pack.gz during next dev).
    // Set NEXT_DISABLE_WEBPACK_CACHE=true to fully disable cache if needed.
    if (dev) {
      webpackConfig.cache =
        process.env.NEXT_DISABLE_WEBPACK_CACHE === 'true' ? false : { type: 'memory' }
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig)
