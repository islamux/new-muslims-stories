// src/lib/metadata.ts
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'New Muslim Stories',
  description: 'Inspiring journeys to Islam from around the world.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'New Muslim Stories',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F5C3E',
  width: 'device-width',
  initialScale: 1,
};
