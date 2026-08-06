import { describe, it, expect } from 'vitest';
import { buttonVariants } from '@/components/Button';

describe('buttonVariants', () => {
  it('applies primary variant by default', () => {
    const cls = buttonVariants();
    expect(cls).toContain('bg-emerald-600');
    expect(cls).toContain('px-5');
  });

  it('applies ghost variant', () => {
    expect(buttonVariants({ variant: 'ghost' })).toContain('border-line');
  });

  it('applies link variant', () => {
    expect(buttonVariants({ variant: 'link' })).toContain('underline-offset-4');
  });

  it('applies lg size', () => {
    const cls = buttonVariants({ size: 'lg' });
    expect(cls).toContain('px-7');
    expect(cls).toContain('py-3.5');
  });

  it('appends a custom className', () => {
    expect(buttonVariants({ className: 'extra-class' })).toContain('extra-class');
  });
});
