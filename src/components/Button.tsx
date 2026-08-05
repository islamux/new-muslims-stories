'use client';

import type { ButtonProps, ButtonSize, ButtonVariant } from '@/types/component.types';

const BASE =
  'inline-flex items-center justify-center gap-2 font-sans font-semibold rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md active:translate-y-px',
  ghost:
    'border border-line bg-transparent text-ink hover:border-gilt-400 hover:text-emerald-700 dark:hover:text-emerald-300',
  link: 'bg-transparent text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string | undefined;
} = {}): string {
  return [BASE, VARIANTS[variant], SIZES[size], className].filter(Boolean).join(' ');
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}
