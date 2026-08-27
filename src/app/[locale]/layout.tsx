import { ReactNode, Suspense } from 'react';
import { getMessages, getTimeZone, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import PlausibleAnalytics from '@/components/PlausibleAnalytics';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import LocalePersist from '@/components/LocalePersist';
import PWAInstall from '@/components/PWAInstall';
import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { fontVariables } from '@/lib/fonts';
import '../globals.css';

export { metadata, viewport } from '@/lib/metadata';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

// Prerender both locales at build time (static rendering)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering and set locale for all next-intl calls
  setRequestLocale(locale);

  const messages = await getMessages();
  const timeZone = await getTimeZone();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={fontVariables} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages} locale={locale} timeZone={timeZone}>
            {children}
            <PWAInstall />
          </NextIntlClientProvider>
        </ThemeProvider>
        <Suspense fallback={null}>
          <PlausibleAnalytics />
        </Suspense>
        <ServiceWorkerRegistration />
        <LocalePersist locale={locale} />
      </body>
    </html>
  );
}
