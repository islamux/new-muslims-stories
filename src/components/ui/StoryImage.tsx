'use client';

import Image from 'next/image';
import type { StoryImageProps } from '@/types';

export default function StoryImage({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: StoryImageProps) {
  return (
    <Image
      src={src}
      alt={alt || 'Story portrait'}
      fill
      className="object-cover"
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
    />
  );
}
