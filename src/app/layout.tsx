import type { Metadata, Viewport } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { Suspense } from 'react';
import { SafeGenkitProvider } from '@/components/safe-genkit-provider';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Swachh Bharat PWA',
  description: 'A platform for a cleaner India.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon-192x192.png.jpg',
  },
  metadataBase: new URL('https://swachh-bharat.vercel.app'),
  openGraph: {
    type: 'website',
    title: 'Swachh Bharat PWA',
    description: 'A platform for a cleaner India',
    url: 'https://swachh-bharat.vercel.app',
    siteName: 'Swachh Bharat',
    images: [
      {
        url: '/icon-512x512.png.jpg',
        width: 512,
        height: 512,
      }
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#388E3C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <meta name="theme-color" content="#388E3C" />
      </head>
      <body className={`${ptSans.variable} font-sans antialiased`} suppressHydrationWarning>
        <SafeGenkitProvider>
          <Providers>
            {/* Use key to force remount if there are hydration issues */}
            <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
            <Toaster />
          </Providers>
        </SafeGenkitProvider>
      </body>
    </html>
  );
}
