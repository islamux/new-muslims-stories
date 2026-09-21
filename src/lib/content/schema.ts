import { z } from 'zod';

export const storyFrontmatterSchema = z.strictObject({
  title: z.string().min(1),
  author: z.string().min(1),
  firstName: z.string().min(1).optional(),
  language: z.enum(['en', 'ar']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  image: z.string().optional(),
  profilePhoto: z.string().optional(),
  age: z.number().int().positive().nullable().optional(),
  country: z.string().min(1).optional(),
  previousReligion: z.string().optional(),
  featured: z.boolean().optional(),
});

export type StoryFrontmatter = z.infer<typeof storyFrontmatterSchema>;