import type { SVGProps } from 'react';

// Eight-pointed Islamic star (khatam) — the brand's signature ornament.
// Color is controlled via `currentColor` (use text-* utilities on the consumer).
const STAR_PATH =
  'M50 2 L57.65 31.52 L83.94 16.06 L68.48 42.35 L98 50 L68.48 57.65 L83.94 83.94 L57.65 68.48 L50 98 L42.35 68.48 L16.06 83.94 L31.52 57.65 L2 50 L31.52 42.35 L16.06 16.06 L42.35 31.52 Z';

export interface StarProps extends SVGProps<SVGSVGElement> {
  size?: number;
  filled?: boolean;
}

export default function Star({ size = 24, filled = true, ...props }: StarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? undefined : 4}
      strokeLinejoin="round"
      aria-hidden={props['aria-label'] ? undefined : true}
      role={props['aria-label'] ? 'img' : undefined}
      {...props}
    >
      {props['aria-label'] ? <title>{props['aria-label']}</title> : null}
      <path d={STAR_PATH} />
    </svg>
  );
}
