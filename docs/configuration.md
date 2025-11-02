# Configuration & Deployment

## Environment Variables
Provide the following keys in your `.env.local` (local dev) and Vercel project settings:

| Variable | Required | Description |
| --- | --- | --- |
| `HUBSPOT_API_KEY` | Optional | Private app token used to create deals. When absent, the app returns guidance but still collects leads. |
| `CLICKUP_API_TOKEN` | Optional | Personal token for ClickUp API access. Needed for escalation + lead tasks. |
| `CLICKUP_LEAD_LIST_ID` | Optional | Target ClickUp list ID for new lead tasks. |
| `CLICKUP_SUPPORT_LIST_ID` | Optional | Target ClickUp list ID for support escalations. |
| `TRANSLATION_WEBHOOK_URL` | Optional | HTTPS endpoint that performs machine translation. The app will POST `{ text, targetLanguage, sourceLanguage }`. |
| `TRANSLATION_WEBHOOK_TOKEN` | Optional | Bearer token injected into translation requests when provided. |
| `DEFAULT_LOCALE` | Optional | Default UI locale (defaults to `en`). |
| `KNOWLEDGE_BASE_BUCKET` | Optional | Reserved for future storage-backed knowledge bases. |

## Local Development
1. Install dependencies: `npm install`
2. Run the dev server: `npm run dev`
3. Visit `http://localhost:3000`

## Production Deployment (Vercel)
1. Ensure `VERCEL_TOKEN` is available in your environment.
2. Build locally: `npm run build`
3. Deploy: `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-22d2a817`
4. Verify: `curl https://agentic-22d2a817.vercel.app`

## Knowledge Base Updates
- Replace or extend `src/data/system-manual.ts` with fresh sections.
- For larger corpora, wire up an external store (e.g., Supabase) and update `searchKnowledgeBase` accordingly.
- Keep tags consistent for faster retrieval and filtering.

## CRM Integration Notes
- HubSpot scopes: `crm.objects.deals.write`, `crm.objects.contacts.read`.
- ClickUp: generate a token with write access to the target Workspace and lists.
- Consider rate limits when running in production—wrap calls with retry + backoff if necessary.

## Multilingual Training Tips
- Feed translated transcripts back into your LLM training pipeline to improve tone and terminology.
- Maintain glossary entries (e.g., property names, rate plan names) and inject them into the translation webhook for higher accuracy.

