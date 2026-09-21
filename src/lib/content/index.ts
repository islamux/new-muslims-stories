import path from 'path';
import { MarkdownStoryRepository } from './markdown-story-repository';
import type { StoryRepository } from './types';

export type { StoryRepository, StorySlugEntry } from './types';

export const storyRepository: StoryRepository = new MarkdownStoryRepository(
  path.join(process.cwd(), 'src', 'stories'),
);