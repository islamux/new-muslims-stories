import { describe, it, expect, vi, afterEach } from 'vitest';
import { isThemeScriptWarning, installThemeConsoleFilter } from '@/lib/theme-console-filter';

describe('theme-console-filter', () => {
  const realError = console.error;

  afterEach(() => {
    console.error = realError;
  });

  describe('isThemeScriptWarning', () => {
    it('detects the React 19 script-tag warning message', () => {
      const warning =
        'Encountered a script tag while rendering React component. ' +
        'Scripts inside React components are never executed when rendering on the client.';
      expect(isThemeScriptWarning([warning])).toBe(true);
    });

    it('returns false for unrelated error messages', () => {
      expect(isThemeScriptWarning(['Something went wrong'])).toBe(false);
    });

    it('returns false when the first argument is not a string', () => {
      expect(isThemeScriptWarning([new Error('boom')])).toBe(false);
    });
  });

  describe('installThemeConsoleFilter', () => {
    it('suppresses only the script-tag warning and forwards the rest', () => {
      console.error = vi.fn();

      const restore = installThemeConsoleFilter();

      console.error('Encountered a script tag while rendering React component.');
      console.error('a real error');
      restore();

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('a real error');
    });

    it('restores the original console.error on uninstall', () => {
      const mockError = vi.fn();
      console.error = mockError;

      const restore = installThemeConsoleFilter();
      restore();

      expect(console.error).toBe(mockError);
    });
  });
});