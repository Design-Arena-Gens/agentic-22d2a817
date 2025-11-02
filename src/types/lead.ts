import { z } from 'zod';

export const leadSchema = z.object({
  organizationName: z.string().min(2),
  portfolioSize: z.number().int().min(1),
  region: z.string().min(2),
  currentSystems: z.array(z.string()).nonempty(),
  deploymentTimeline: z.string().min(2),
  budgetRange: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactRole: z.string().min(2),
  notes: z.string().optional(),
  locale: z.string().optional()
});

export type LeadPayload = z.infer<typeof leadSchema>;
