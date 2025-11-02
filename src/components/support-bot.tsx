'use client';

import { FormEvent, useCallback, useState } from 'react';
import { ChatBubble } from '@/components/chat-bubble';
import { SUPPORTED_LANGUAGES, translateText } from '@/lib/translation';

type TranscriptEntry = {
  from: 'user' | 'bot';
  message: string;
};

type SupportResource = {
  id: string;
  title: string;
  answer: string;
};

const INITIAL_MESSAGE: TranscriptEntry = {
  from: 'bot',
  message:
    'Hello! I use the OneHotel System Manual to answer operational questions. Ask me anything about configuration, integrations, or escalation policy.'
};

export function SupportBot() {
  const [messages, setMessages] = useState<TranscriptEntry[]>([INITIAL_MESSAGE]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([INITIAL_MESSAGE]);
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [language, setLanguage] = useState(process.env.DEFAULT_LOCALE ?? 'en');
  const [accountId, setAccountId] = useState('');
  const [module, setModule] = useState('Platform');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appendMessage = useCallback(
    async (entry: TranscriptEntry) => {
      let message = entry.message;
      if (entry.from === 'bot' && language !== 'en') {
        try {
          const translation = await translateText({ text: entry.message, targetLanguage: language });
          message = translation.translatedText;
        } catch (translationError) {
          console.error('Translation failed', translationError);
        }
      }
      setMessages((prev) => [...prev, { ...entry, message }]);
      setTranscript((prev) => [...prev, entry]);
    },
    [language]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim()) {
      setError('Please enter a question.');
      return;
    }

    if (!accountId) {
      setError('Account ID is required to access tailored answers.');
      return;
    }

    setError(null);
    const userMessage: TranscriptEntry = { from: 'user', message: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setTranscript((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: userMessage.message,
          accountId,
          module,
          severity,
          language,
          transcript: [...transcript, userMessage]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve support answer');
      }

      const result = await response.json();
      setResources(result.resources ?? []);

      if (result.resources?.length) {
        await appendMessage({
          from: 'bot',
          message: result.resources[0].answer
        });
      } else {
        await appendMessage({
          from: 'bot',
          message: 'I could not locate an answer in the manual. Logging a support escalation.'
        });
      }

      if (result.escalate) {
        setEscalated(true);
        if (result.clickup?.ok) {
          await appendMessage({ from: 'bot', message: 'A ClickUp escalation task has been created for Tier 2 support.' });
        } else {
          await appendMessage({
            from: 'bot',
            message:
              result.clickup?.error ?? 'Escalation captured. Configure ClickUp credentials to auto-create support tasks.'
          });
        }
      }
    } catch (submitError) {
      await appendMessage({
        from: 'bot',
        message: `Support assistant encountered an issue: ${(submitError as Error).message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Account ID
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            placeholder="OH-12345"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Module
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={module}
            onChange={(event) => setModule(event.target.value)}
          >
            {['Platform', 'PMS', 'CRM', 'RMS', 'Housekeeping', 'Integrations'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Severity
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={severity}
            onChange={(event) => setSeverity(event.target.value as typeof severity)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="support-language" className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Language
        </label>
        <select
          id="support-language"
          className="rounded-lg border border-slate-200 px-3 py-1 text-sm"
          value={language}
          onChange={async (event) => {
            const value = event.target.value;
            setLanguage(value);
            const translatedMessages = await Promise.all(
              transcript.map(async (entry) => {
                if (entry.from === 'bot') {
                  try {
                    const translation = await translateText({ text: entry.message, targetLanguage: value });
                    return { ...entry, message: translation.translatedText };
                  } catch (translationError) {
                    console.error('Translation failed', translationError);
                    return entry;
                  }
                }
                return entry;
              })
            );
            setMessages(translatedMessages);
          }}
        >
          {SUPPORTED_LANGUAGES.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto rounded-xl bg-slate-100 p-4">
        {messages.map((entry, index) => (
          <ChatBubble key={`${entry.from}-${index}`} role={entry.from} message={entry.message} />
        ))}
        {loading ? <ChatBubble role="bot" message="Checking the knowledge base..." /> : null}
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <textarea
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          rows={3}
          placeholder="Ask your question here..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        >
          Ask Support Bot
        </button>
      </form>

      {resources.length ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Knowledge base excerpts</h3>
          <div className="space-y-2">
            {resources.map((resource) => (
              <article key={resource.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <h4 className="text-sm font-semibold text-slate-800">{resource.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{resource.answer}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {escalated ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Escalation registered. Tier 2 support has been notified and will follow up via your preferred channel.
        </div>
      ) : null}
    </div>
  );
}
