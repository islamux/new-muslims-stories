const THEME_SCRIPT_WARNING = 'Encountered a script tag while rendering React component.';

export function isThemeScriptWarning(args: unknown[]): boolean {
  return typeof args[0] === 'string' && args[0].includes(THEME_SCRIPT_WARNING);
}

export function installThemeConsoleFilter(): () => void {
  const originalError = console.error;

  console.error = (...args: unknown[]) => {
    if (isThemeScriptWarning(args)) return;
    originalError.apply(console, args as Parameters<typeof console.error>);
  };

  return () => {
    console.error = originalError;
  };
}