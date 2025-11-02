# OneHotel Conversational Suite

## Overview
This Next.js 14 application delivers two production-ready bots for OneHotel.asia:

- **Lead Capture Bot** – Guides inbound prospects through a qualification flow, captures portfolio intelligence, and pushes qualified leads to HubSpot and ClickUp.
- **Support Bot** – Answers operational queries using the OneHotel System Manual, localises responses, and escalates critical incidents to human agents.

The stack prioritises Vercel deployability with React Server Components, Tailwind CSS, and API routes for backend logic.

## High-Level Architecture

```
┌─────────────────────────┐
│ React App Router (UI)   │
│  • LeadCaptureBot       │
│  • SupportBot           │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Next.js API Routes      │
│  /api/lead              │⟶ HubSpot CRM / ClickUp (REST)
│  /api/support           │⟶ Knowledge search + ClickUp
│  /api/translation       │⟶ External translation webhook
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Shared Libraries        │
│  • lib/crm.ts           │
│  • lib/knowledge-base.ts│
│  • lib/translation.ts   │
│  • data/system-manual   │
└─────────────────────────┘
```

### Data Flow
1. **Lead capture** collects answers step-by-step, validates via Zod, and submits to `/api/lead`.
2. The API validates payloads, attempts HubSpot and ClickUp sync (if credentials exist), and returns result metadata to the bot.
3. **Support bot** gathers account context, sends query to `/api/support`, which searches the manual (cosine similarity over token counts). High-severity or low-confidence answers trigger escalation to ClickUp.
4. Both bots share a translation service that either proxies to an external webhook or falls back to identity translation when not configured.

## Multilingual Strategy
- Conversations store canonical English transcripts. Displayed messages are translated on the fly with `/api/translation`.
- Supported locales are centralised in `lib/translation.ts` to keep UI selectors and validation in sync.
- Translation provider is pluggable via `TRANSLATION_WEBHOOK_URL` + `TRANSLATION_WEBHOOK_TOKEN`.
- Bots detect target language from operator choice; fallback to English automatically when translation fails.

## CRM Integration
- HubSpot: uses CRM v3 deals endpoint, injecting qualification notes in `description`.
- ClickUp: tasks are posted to list IDs provided through env vars. Lead and support flows can target different lists (`CLICKUP_LEAD_LIST_ID`, `CLICKUP_SUPPORT_LIST_ID`).
- All external calls are guarded with safe logging and friendly status messages when keys are absent.

## Knowledge Base Retrieval
- Manual excerpts live in `data/system-manual.ts` and can be replaced with a datastore or S3 ingestion.
- `lib/knowledge-base.ts` tokenises, builds basic term frequency vectors, and ranks sections via cosine similarity.
- The top results surface to agents while the raw transcript is available for escalation payloads.

## Extensibility
- Replace the manual data structure with a vector database (e.g., Supabase pgvector) by swapping out `searchKnowledgeBase`.
- Plug in LLM responses by augmenting `/api/support` with OpenAI calls once knowledge snippets are retrieved.
- Convert `api/lead` into a server action if you prefer RSC-first patterns.
- Add analytics (Amplitude, Segment) by instrumenting the component state transitions.

