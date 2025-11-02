import { NextResponse } from 'next/server';
import { leadSchema } from '@/types/lead';
import { createClickUpTask, CRM_STATUS_MESSAGES, syncLeadToHubSpot } from '@/lib/crm';

type CRMResult = {
  ok: boolean;
  status?: number;
  error?: string;
  data?: unknown;
};

const parseError = (issues: string[]) =>
  issues.map((issue) => issue.replaceAll('"', '"')).join('; ');

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = leadSchema.safeParse({
    ...json,
    portfolioSize: Number(json.portfolioSize)
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return NextResponse.json({ error: parseError(issues) }, { status: 400 });
  }

  const payload = parsed.data;

  let hubspot: CRMResult | null = null;
  let clickup: CRMResult | null = null;

  if (process.env.HUBSPOT_API_KEY) {
    hubspot = await syncLeadToHubSpot(payload);
  }

  if (process.env.CLICKUP_API_TOKEN && process.env.CLICKUP_LEAD_LIST_ID) {
    clickup = await createClickUpTask(payload, process.env.CLICKUP_LEAD_LIST_ID);
  }

  return NextResponse.json({
    lead: payload,
    hubspot: hubspot ?? { ok: false, error: CRM_STATUS_MESSAGES.missingHubspot },
    clickup: clickup ?? { ok: false, error: CRM_STATUS_MESSAGES.missingClickUp }
  });
}
