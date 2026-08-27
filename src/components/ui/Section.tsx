import React from 'react';
import type { SectionProps } from '@/types/component.types';

const Section: React.FC<SectionProps> = ({ id, className, children }) => {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
};

export default Section;
