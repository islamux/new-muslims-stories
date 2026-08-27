'use client';

import { useEffect } from 'react';

export default function LocalePersist({ locale }: { locale: string }) {
  useEffect(() => {
    try {
      localStorage.setItem('locale', locale);
    } catch {
      // localStorage unavailable (private browsing, storage full, etc.)
    }
  }, [locale]);

  return null;
}
