import { Aref_Ruqaa, Amiri, Inter, Source_Serif_4 } from 'next/font/google';

// UI / chrome: buttons, nav, labels, captions
export const fontUI = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

// Long-form reading body (Latin)
export const fontBody = Source_Serif_4({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

// Display + Arabic (designed for Qur'anic typesetting; covers Latin + Arabic glyphs)
export const fontDisplay = Amiri({
  subsets: ['latin', 'arabic'],
  weight: ['400', '700'],
  variable: '--font-display',
  display: 'swap',
});

// Arabic UI sans for RTL chrome (buttons, nav, labels). Aref Ruqaa is a legible
// Ruqaa calligraphic face; pairs with Amiri for headings/body. Falls back to
// Noto Naskh Arabic (installed on most systems) and Amiri.
export const fontArabicUI = Aref_Ruqaa({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-ruqaa',
  display: 'swap',
});

// Combined className to apply all four CSS variables in one place (e.g. on <html>)
export const fontVariables = `${fontUI.variable} ${fontBody.variable} ${fontDisplay.variable} ${fontArabicUI.variable}`;
