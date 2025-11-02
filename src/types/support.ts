import { z } from 'zod';

export const supportRequestSchema = z.object({
  accountId: z.string().min(2),
  module: z.string().min(2),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  query: z.string().min(5),
  language: z.string().default('en'),
  contactEmail: z.string().email().optional(),
  transcript: z.array(
    z.object({
      from: z.enum(['user', 'bot']),
      message: z.string()
    })
  )
});

export type SupportRequest = z.infer<typeof supportRequestSchema>;
