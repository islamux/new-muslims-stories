import { describe, it, expect } from 'vitest';
import { useStorySections } from '@/hooks/useStorySections';

describe('useStorySections', () => {
  it('extracts three ordered sections from h2 headings', () => {
    const html =
      '<h2>Before</h2><p>life</p><h2>Moment</h2><p>guidance</p><h2>Reflections</h2><p>reflect</p>';
    const result = useStorySections(html);
    expect(result.lifeBeforeIslam).toBe('<p>life</p>');
    expect(result.momentOfGuidance).toBe('<p>guidance</p>');
    expect(result.reflections).toBe('<p>reflect</p>');
  });

  it('handles h3 headings', () => {
    const html = '<h3>A</h3><p>1</p><h3>B</h3><p>2</p><h3>C</h3><p>3</p>';
    const result = useStorySections(html);
    expect(result.lifeBeforeIslam).toBe('<p>1</p>');
    expect(result.momentOfGuidance).toBe('<p>2</p>');
    expect(result.reflections).toBe('<p>3</p>');
  });

  it('merges extra sections into reflections', () => {
    const html = '<h2>A</h2><p>1</p><h2>B</h2><p>2</p><h2>C</h2><p>3</p><h2>D</h2><p>4</p>';
    const result = useStorySections(html);
    expect(result.lifeBeforeIslam).toBe('<p>1</p>');
    expect(result.momentOfGuidance).toBe('<p>2</p>');
    expect(result.reflections).toContain('<p>3</p>');
    expect(result.reflections).toContain('<p>4</p>');
  });

  it('returns empty strings when later sections are missing', () => {
    const html = '<h2>A</h2><p>1</p>';
    const result = useStorySections(html);
    expect(result.lifeBeforeIslam).toBe('<p>1</p>');
    expect(result.momentOfGuidance).toBe('');
    expect(result.reflections).toBe('');
  });

  it('handles headings with attributes', () => {
    const html =
      '<h2 id="x">A</h2><p>1</p><h2 class="y">B</h2><p>2</p><h2>C</h2><p>3</p>';
    const result = useStorySections(html);
    expect(result.lifeBeforeIslam).toBe('<p>1</p>');
    expect(result.momentOfGuidance).toBe('<p>2</p>');
    expect(result.reflections).toBe('<p>3</p>');
  });

  it('returns empty sections for content with no headings', () => {
    const result = useStorySections('<p>just text</p>');
    expect(result.lifeBeforeIslam).toBe('');
    expect(result.momentOfGuidance).toBe('');
    expect(result.reflections).toBe('');
  });
});
