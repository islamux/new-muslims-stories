// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { sanitizeHtmlServer } from '@/lib/sanitize';

describe('sanitizeHtmlServer', () => {
  it('strips <script> tags while keeping allowed content', async () => {
    const result = await sanitizeHtmlServer('<script>alert(1)</script><p>hi</p>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>hi</p>');
  });

  it('strips inline event handlers (onerror)', async () => {
    const result = await sanitizeHtmlServer('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
  });

  it('strips javascript: URIs', async () => {
    const result = await sanitizeHtmlServer('<a href="javascript:alert(1)">x</a>');
    expect(result).not.toContain('javascript:');
  });

  it('keeps allowed formatting tags', async () => {
    const result = await sanitizeHtmlServer('<p>hello <strong>world</strong></p>');
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });
});
