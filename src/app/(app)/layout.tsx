import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FontTuner } from '@/components/FontTuner'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { ensureStartsWith } from '@/utilities/ensureStartsWith'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import React from 'react'
import './globals.css'

const { SITE_NAME, TWITTER_CREATOR, TWITTER_SITE } = process.env
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000'
const siteName = SITE_NAME || 'BlackTech Catalog'
const twitterCreator = TWITTER_CREATOR ? ensureStartsWith(TWITTER_CREATOR, '@') : undefined
const twitterSite = TWITTER_SITE ? ensureStartsWith(TWITTER_SITE, 'https://') : undefined

const manrope = localFont({
  src: [
    {
      path: '../../fonts/manrope/manrope-latin.woff2',
      style: 'normal',
      weight: '400 800',
    },
    {
      path: '../../fonts/manrope/manrope-cyrillic.woff2',
      style: 'normal',
      weight: '400 800',
    },
  ],
  display: 'swap',
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  ...(twitterCreator &&
    twitterSite && {
      twitter: {
        card: 'summary_large_image',
        creator: twitterCreator,
        site: twitterSite,
      },
    }),
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const isFontTunerEnabled =
    process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_FONT_TUNER === 'true'

  return (
    <html
      className={[
        GeistSans.variable,
        GeistMono.variable,
        manrope.variable,
      ]
        .filter(Boolean)
        .join(' ')}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
      </head>
      <body>
        <Providers>
          <AdminBar />
          <LivePreviewListener />

          <Header />
          <main>{children}</main>
          <Footer />
          {isFontTunerEnabled ? <FontTuner /> : null}
        </Providers>
      </body>
    </html>
  )
}
