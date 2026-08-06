import type { Metadata } from 'next';
import { fontVariables } from '@/lib/fonts';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Offline — New Muslim Stories',
};

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
