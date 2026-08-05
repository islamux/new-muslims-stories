import { Amiri, Inter, Source_Serif_4 } from 'next/font/google';

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

// Combined className to apply all three CSS variables in one place (e.g. on <html>)
export const fontVariables = `${fontUI.variable} ${fontBody.variable} ${fontDisplay.variable}`;
