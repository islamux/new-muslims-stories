'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Icon from './ui/Icon';
import Star from './ui/Star';
import { buttonVariants } from './Button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWA_FEATURES = ['featureOffline', 'featureFast', 'featureHome'] as const;

export default function PWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const t = useTranslations('PWA');

  useEffect(() => {
    const dismissedStorage = localStorage.getItem('pwa-install-dismissed');
    if (dismissedStorage) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowInstallPrompt(true), 5000);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }

    setShowInstallPrompt(false);
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstallPrompt || !installPrompt) return null;

  return (
    <div className="fixed bottom-4 inset-inline-start-4 z-50 md:inset-inline-end-4 md:inset-inline-start-auto md:max-w-sm">
      <div className="animate-in slide-in-from-bottom-5 rounded-lg border border-line bg-panel p-4 shadow-xl">
        <div className="mb-3 flex items-start">
          <Star size={30} className="flex-shrink-0 text-gilt-500" aria-hidden="true" />
          <div className="ms-3 flex-1">
            <h3 className="font-heading text-lg font-bold text-ink">{t('installTitle')}</h3>
            <p className="mt-1 font-sans text-sm text-ink-soft">{t('installDescription')}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-ink-soft transition-colors hover:text-emerald-700 dark:hover:text-emerald-300"
            aria-label={t('dismiss')}
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <ul className="mb-4 space-y-2 font-sans text-sm text-ink-soft">
          {PWA_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center">
              <Icon name="check" className="me-2 h-4 w-4 text-emerald-600" />
              {t(feature)}
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <button onClick={handleInstall} className={buttonVariants({ variant: 'primary' })}>
            {t('install')}
          </button>
          <button onClick={handleDismiss} className={buttonVariants({ variant: 'ghost' })}>
            {t('notNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
