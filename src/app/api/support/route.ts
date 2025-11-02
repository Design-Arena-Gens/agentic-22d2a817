import { NextResponse } from 'next/server';
import { supportRequestSchema } from '@/types/support';
import { searchKnowledgeBase } from '@/lib/knowledge-base';
import { createClickUpTask, CRM_STATUS_MESSAGES } from '@/lib/crm';

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = supportRequestSchema.safeParse(json);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return NextResponse.json({ error: issues.join('; ') }, { status: 400 });
  }

  const payload = parsed.data;
  const matches = searchKnowledgeBase(payload.query);

  const shouldEscalate = payload.severity === 'high' || payload.severity === 'critical' || matches.length === 0;

  let clickup = null;

  if (shouldEscalate && process.env.CLICKUP_API_TOKEN && process.env.CLICKUP_SUPPORT_LIST_ID) {
    clickup = await createClickUpTask(payload, process.env.CLICKUP_SUPPORT_LIST_ID);
  }

  return NextResponse.json({
    resources: matches.map((section) => ({
      id: section.id,
      title: section.title,
      answer: section.body
    })),
    escalate: shouldEscalate,
    clickup: clickup ?? { ok: false, error: CRM_STATUS_MESSAGES.missingClickUp }
  });
}
