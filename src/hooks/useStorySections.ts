'use client';

export interface StorySections {
  lifeBeforeIslam: string;
  momentOfGuidance: string;
  reflections: string;
}

/**
 * Parse story content HTML into ordered sections.
 * Splits on h2/h3 headings and collects each section's body without relying on
 * fixed array indices, so extra/missing headings degrade gracefully.
 */
export function useStorySections(contentHtml: string): StorySections {
  const openings = contentHtml.split(/<h[23][^>]*>/i);
  const bodies: string[] = [];

  for (let i = 1; i < openings.length; i++) {
    const part = openings[i];
    if (!part) continue;
    // Each part is "<heading text></hN><body>"; keep everything after the first closing tag.
    const closingSplit = part.split(/<\/h[23]>/i);
    bodies.push(closingSplit.slice(1).join(''));
  }

  return {
    lifeBeforeIslam: bodies[0] ?? '',
    momentOfGuidance: bodies[1] ?? '',
    reflections: bodies.slice(2).join('\n'),
  };
}
