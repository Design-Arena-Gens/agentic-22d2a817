import { LeadCaptureBot } from '@/components/lead-capture-bot';
import { SupportBot } from '@/components/support-bot';
import { Panel } from '@/components/panel';

const highlights = [
  {
    title: 'HubSpot & ClickUp sync',
    description: 'Push qualified leads and escalations straight into your revenue and support pipelines with secure API integrations.'
  },
  {
    title: 'Multilingual readiness',
    description: 'Translate responses into key Asia-Pacific languages and respect regional data residency policies.'
  },
  {
    title: 'Knowledge-grounded',
    description: 'Ground support answers with OneHotel system manual sections to maintain compliance and auditability.'
  }
];

const languages = ['English', 'Chinese (Simplified)', 'Thai', 'Japanese', 'Korean', 'Bahasa Melayu'];

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12">
      <section className="grid gap-8 rounded-3xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-10 text-white lg:grid-cols-2">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">OneHotel Conversational Suite</p>
          <h1 className="text-4xl font-semibold leading-tight">
            Lead capture and support bots tailored for modern hospitality groups.
          </h1>
          <p className="max-w-xl text-base text-slate-100">
            Automate qualification, standardize playbooks, and escalate critical incidents faster. Deployable to Vercel, fully API driven, and ready for multilingual operations across APAC markets.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-200">
            {highlights.map((highlight) => (
              <span key={highlight.title} className="rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                {highlight.title}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-6 rounded-2xl bg-white/10 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Multilingual coverage</h2>
          <p className="text-sm text-slate-100">
            Train bots to respond in guest-preferred languages. Confidence thresholds ensure English fallbacks when translation quality drops.
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm text-white/90">
            {languages.map((language) => (
              <div key={language} className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
                {language}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <Panel
          title="Lead Capture Bot"
          description="Qualify inbound groups, capture portfolio data, and push to HubSpot & ClickUp."
        >
          <LeadCaptureBot />
        </Panel>
        <Panel
          title="Support Bot"
          description="Answer operational questions with the OneHotel manual and auto-escalate critical incidents."
        >
          <SupportBot />
        </Panel>
      </section>

      <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-100 lg:grid-cols-3">
        {highlights.map((highlight) => (
          <article key={highlight.title} className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">{highlight.title}</h3>
            <p className="text-sm text-slate-600">{highlight.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
