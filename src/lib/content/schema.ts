import { z } from 'zod';

export const storyFrontmatterSchema = z.strictObject({
  title: z.string().min(1),
  author: z.string().min(1),
  firstName: z.string().min(1).optional(),
  language: z.enum(['en', 'ar']),
  date: z
    .string()
    .regex(/^\d{4}(-\d{2}-\d{2})?$/)
    .nullable()
    .optional(),
  image: z.string().nullable().optional(),
  profilePhoto: z.string().nullable().optional(),
  age: z.number().int().positive().nullable().optional(),
  country: z.string().min(1).nullable().optional(),
  previousReligion: z.string().nullable().optional(),
  featured: z.boolean().optional(),
});
