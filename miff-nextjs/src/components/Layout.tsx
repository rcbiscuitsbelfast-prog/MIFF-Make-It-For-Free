'use client'

import { ReactNode } from 'react'
import { NextSeo } from 'next-seo'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
  canonical?: string
  openGraph?: {
    title?: string
    description?: string
    url?: string
    type?: string
    images?: Array<{
      url: string
      width: number
      height: number
      alt: string
    }>
  }
}

export default function Layout({
  children,
  title = 'MIFF Framework',
  description = 'Modular, CLI-first, engine-agnostic game development framework built for contributors',
  canonical,
  openGraph,
}: LayoutProps) {
  const siteTitle = title === 'MIFF Framework' ? title : `${title} | MIFF Framework`
  
  return (
    <>
      <NextSeo
        title={siteTitle}
        description={description}
        canonical={canonical}
        openGraph={{
          title: openGraph?.title || siteTitle,
          description: openGraph?.description || description,
          url: openGraph?.url || canonical,
          type: openGraph?.type || 'website',
          images: openGraph?.images || [
            {
              url: '/og-image.png',
              width: 1200,
              height: 630,
              alt: 'MIFF Framework - Modular Game Development',
            },
          ],
          siteName: 'MIFF Framework',
        }}
        twitter={{
          handle: '@miffframework',
          site: '@miffframework',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1',
          },
          {
            name: 'theme-color',
            content: '#7c3aed',
          },
        ]}
      />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  )
}