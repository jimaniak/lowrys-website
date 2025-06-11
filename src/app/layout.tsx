// src/app/layout.tsx

import '@/app/globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import { ResumeAccessProvider } from '@/components/ResumeAccessContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jim Lowry | Data Analytics & Power Platform Specialist',
  description: 'Portfolio of Jim Lowry, specializing in data analytics, Microsoft Power BI, Power Query/M, Power Platform, and business intelligence. Committed to continuous learning and delivering actionable insights.',
  keywords: 'data analytics, Power BI, Power Query, Power Platform, business intelligence, automation, SQL, Tableau, Google Data Studio, continuous learning, Jim Lowry',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ResumeAccessProvider>
          <Header />
          {children}
        </ResumeAccessProvider>
      </body>
    </html>
  )
}