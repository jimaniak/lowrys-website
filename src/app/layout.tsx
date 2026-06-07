// src/app/layout.tsx

import '@/app/globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ResumeAccessProvider } from '@/components/ResumeAccessContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jim Lowry | AI-Native Product Engineer',
  description: 'Portfolio of Jim Lowry — AI-native product engineer shipping production SaaS (WorkAide Jobs, EZ Voice, EZWeb.work). Lead Developer on Autoshops.com. ~9 years enterprise experience at Ameren. Remote US.',
  keywords: 'AI-Native Product Engineer, full-stack developer, WorkAide Jobs, EZ Voice, agentic AI, Next.js, TypeScript, NestJS, Supabase, Stripe, SaaS, Jim Lowry, remote developer',
  metadataBase: new URL('https://www.lowrys.org'),
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/favicon/site.webmanifest',
      },
    ],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
        <ResumeAccessProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </ResumeAccessProvider>
      </body>
    </html>
  )
}