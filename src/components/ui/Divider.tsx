import type { WithClassName } from '@/types/component.types';
import Star from './Star';

// Gilded manuscript-style divider: hairline — star — hairline.
export default function Divider({ className }: WithClassName) {
  return (
    <div
      className={`flex items-center justify-center gap-4 text-gilt-500 ${className ?? ''}`}
      aria-hidden="true"
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gilt-400/70 sm:w-28" />
      <Star size={18} className="shrink-0" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gilt-400/70 sm:w-28" />
    </div>
  );
}
