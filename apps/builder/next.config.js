/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nudge/ui', '@nudge/db', '@nudge/ai'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
}

const sentryWebpackPluginOptions = {
  silent: true,
  hideSourceMaps: true,
}

const { withSentryConfig } = require('@sentry/nextjs')
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
