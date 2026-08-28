'use client';

import type { ComponentProps } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { installThemeConsoleFilter } from '@/lib/theme-console-filter';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  installThemeConsoleFilter();
}

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}