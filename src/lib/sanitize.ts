import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import type { DOMPurify } from 'dompurify';

let purify: DOMPurify | null = null;

function getDOMPurify(): DOMPurify {
  if (!purify) {
    purify = createDOMPurify(new JSDOM('').window);
  }
  return purify;
}

export function sanitizeHtmlServer(html: string): string {
  try {
    return getDOMPurify().sanitize(html, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'b',
        'i',
        'em',
        'strong',
        'a',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'pre',
        'code',
        'hr',
        'span',
        'div',
        'img',
        'figure',
        'figcaption',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id'],
      ALLOW_DATA_ATTR: false,
    });
  } catch (error) {
    console.error('[sanitizeHtmlServer] sanitization failed; dropping content', error);
    return '';
  }
}
