'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ChatBubble } from '@/components/chat-bubble';
import type { LeadPayload } from '@/types/lead';
import { leadSchema } from '@/types/lead';
import { SUPPORTED_LANGUAGES, translateText } from '@/lib/translation';

const SYSTEM_OPTIONS = [
  'Opera PMS',
  'Fidelio',
  'Infor HMS',
  'Protel',
  'Cloudbeds',
  'Mews',
  'Other'
];

type LeadStepKey = keyof LeadPayload;

type LeadStep = {
  key: LeadStepKey;
  label: string;
  description?: string;
  type: 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'textarea';
  options?: string[];
  optional?: boolean;
  placeholder?: string;
};

const LEAD_STEPS: LeadStep[] = [
  {
    key: 'organizationName',
    label: 'Great to meet you! What is your hotel group or property name?',
    type: 'text',
    placeholder: 'OneHotel Resorts'
  },
  {
    key: 'portfolioSize',
    label: 'How many properties are in your portfolio today?',
    type: 'number',
    placeholder: 'E.g. 25'
  },
  {
    key: 'region',
    label: 'Where are your properties located?',
    description: 'You can list multiple regions or countries.',
    type: 'text',
    placeholder: 'Southeast Asia, Middle East'
  },
  {
    key: 'currentSystems',
    label: 'Which core systems are you currently using?',
    description: 'Select all that apply. This helps us scope integrations.',
    type: 'multiselect',
    options: SYSTEM_OPTIONS
  },
  {
    key: 'deploymentTimeline',
    label: 'When are you hoping to go live with a new solution?',
    type: 'select',
    options: ['0-3 months', '3-6 months', '6-12 months', '12+ months']
  },
  {
    key: 'budgetRange',
    label: 'What budget range are you targeting for this initiative?',
    type: 'select',
    options: ['<$25k', '$25k-$50k', '$50k-$100k', '$100k+']
  },
  {
    key: 'contactName',
    label: 'Who should we follow up with?',
    description: 'Primary stakeholder name.',
    type: 'text',
    placeholder: 'Alex Tan'
  },
  {
    key: 'contactEmail',
    label: 'What is the best email to reach them?',
    type: 'email',
    placeholder: 'alex@hotelgroup.com'
  },
  {
    key: 'contactRole',
    label: 'What is their role or title?',
    type: 'text',
    placeholder: 'VP of Operations'
  },
  {
    key: 'notes',
    label: 'Any specific requirements or notes we should capture?',
    type: 'textarea',
    optional: true,
    placeholder: 'Preferred integrations, number of rooms, challenge areas...'
  }
];

type LeadMessage = {
  role: 'bot' | 'user';
  message: string;
};

type LeadFormValues = Partial<Record<LeadStepKey, LeadPayload[LeadStepKey]>>;

const initialMessages: LeadMessage[] = [
  {
    role: 'bot',
    message:
      'Hi! I help qualify hospitality groups for OneHotel. I will ask a few quick questions to tailor our playbook.'
  },
  {
    role: 'bot',
    message: LEAD_STEPS[0].label
  }
];

export function LeadCaptureBot() {
  const [transcript, setTranscript] = useState<LeadMessage[]>(initialMessages);
  const [messages, setMessages] = useState<LeadMessage[]>(initialMessages);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formValues, setFormValues] = useState<LeadFormValues>({});
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState(process.env.DEFAULT_LOCALE ?? 'en');
  const [error, setError] = useState<string | null>(null);

  const currentStep = LEAD_STEPS[currentStepIndex];

  const appendMessage = useCallback((role: 'bot' | 'user', text: string) => {
    setTranscript((prev) => [...prev, { role, message: text }]);
  }, []);

  const handleLanguageChange = useCallback((nextLanguage: string) => {
    setLanguage(nextLanguage);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const translateTranscript = async () => {
      if (language === 'en') {
        if (!cancelled) {
          setMessages([...transcript]);
        }
        return;
      }

      const translated = await Promise.all(
        transcript.map(async (entry) => {
          if (entry.role === 'bot') {
            try {
              const translation = await translateText({ text: entry.message, targetLanguage: language });
              return { ...entry, message: translation.translatedText };
            } catch (translationError) {
              console.error('Translation failed', translationError);
              return entry;
            }
          }
          return entry;
        })
      );

      if (!cancelled) {
        setMessages(translated);
      }
    };

    translateTranscript();

    return () => {
      cancelled = true;
    };
  }, [language, transcript]);

  const validateStepValue = (step: LeadStep, value: unknown) => {
    const stepSchema = leadSchema.shape[step.key];
    if (!stepSchema) {
      return value;
    }
    const result = stepSchema.safeParse(value);
    if (!result.success) {
      const issue = result.error.issues[0];
      throw new Error(issue?.message ?? 'Invalid value');
    }
    return result.data;
  };

  const submitLead = useCallback(
    async (payload: LeadPayload) => {
      setSubmitting(true);
      try {
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Unable to submit lead');
        }

        const result = await response.json();

        appendMessage(
          'bot',
          'Thanks! I have everything I need. Our revenue team will reach out within one business day.'
        );

        if (result.hubspot?.ok) {
          appendMessage('bot', 'HubSpot sync succeeded. The deal is now in the Qualified Lead stage.');
        } else {
          appendMessage('bot', result.hubspot?.error ?? 'HubSpot sync pending configuration.');
        }

        if (result.clickup?.ok) {
          appendMessage('bot', 'ClickUp task created to alert the sales pod.');
        } else {
          appendMessage('bot', result.clickup?.error ?? 'ClickUp task will sync once configured.');
        }
      } catch (submitError) {
        appendMessage(
          'bot',
          `I ran into an issue submitting this lead: ${(submitError as Error).message}. Please try again or email sales@onehotel.asia.`
        );
      } finally {
        setSubmitting(false);
      }
    },
    [appendMessage]
  );

  const handleNextStep = useCallback(
    async (value: unknown) => {
      if (!currentStep) return;

      try {
        if (!currentStep.optional) {
          validateStepValue(currentStep, value);
        }
      } catch (validationError) {
        setError((validationError as Error).message);
        return;
      }

      setError(null);

      let normalizedValue: unknown = currentStep.type === 'number' ? Number(value) : value;

      if (currentStep.optional) {
        const isEmptyArray = Array.isArray(normalizedValue) && normalizedValue.length === 0;
        const isEmptyString = typeof normalizedValue === 'string' && normalizedValue.trim().length === 0;
        if (isEmptyArray || isEmptyString) {
          normalizedValue = undefined;
        }
      }

      setFormValues((prev) => ({
        ...prev,
        [currentStep.key]: normalizedValue
      }) as LeadFormValues);

      if (currentStep.key === 'currentSystems') {
        setSelectedSystems(normalizedValue as string[]);
      }

      const userMessage = Array.isArray(normalizedValue)
        ? (normalizedValue as string[]).join(', ')
        : normalizedValue === undefined
          ? 'No additional notes.'
          : String(normalizedValue ?? '');

      appendMessage('user', userMessage);

      const nextStepIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextStepIndex);

      if (nextStepIndex >= LEAD_STEPS.length) {
        const leadPayload = leadSchema.parse({
          ...formValues,
          [currentStep.key]: normalizedValue,
          locale: language
        });
        await submitLead(leadPayload);
      } else {
        appendMessage('bot', LEAD_STEPS[nextStepIndex].label);
      }
      setInputValue('');
    },
    [appendMessage, currentStep, currentStepIndex, formValues, language, submitLead]
  );

  const renderInput = useMemo(() => {
    if (!currentStep) {
      return null;
    }

    switch (currentStep.type) {
      case 'multiselect':
        return (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-slate-700">Select all that apply</legend>
            {currentStep.options?.map((option) => {
              const checkedState = selectedSystems.includes(option);
              return (
                <label key={option} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-sm">
                  <span>{option}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={checkedState}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setSelectedSystems((prev) => {
                        const current = new Set(prev);
                        if (checked) {
                          current.add(option);
                        } else {
                          current.delete(option);
                        }
                        return Array.from(current);
                      });
                    }}
                  />
                </label>
              );
            })}
            <button
              type="button"
              onClick={() => handleNextStep(selectedSystems)}
              className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              disabled={selectedSystems.length === 0}
            >
              Continue
            </button>
          </fieldset>
        );
      case 'select':
        return (
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          >
            <option value="">Select an option</option>
            {currentStep.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            rows={4}
            placeholder={currentStep.placeholder}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
        );
      default:
        return (
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            type={currentStep.type === 'number' ? 'number' : currentStep.type === 'email' ? 'email' : 'text'}
            placeholder={currentStep.placeholder}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
        );
    }
  }, [currentStep, handleNextStep, inputValue, selectedSystems]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentStep) return;

    if (currentStep.type === 'select' && !inputValue) {
      setError('Please choose an option to continue.');
      return;
    }

    if (currentStep.type !== 'multiselect') {
      await handleNextStep(currentStep.type === 'number' ? Number(inputValue) : inputValue);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <label htmlFor="lead-language" className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Language
        </label>
        <select
          id="lead-language"
          className="rounded-lg border border-slate-200 px-3 py-1 text-sm"
          value={language}
          onChange={(event) => handleLanguageChange(event.target.value)}
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
          <ChatBubble key={`${entry.role}-${index}`} role={entry.role} message={entry.message} />
        ))}
        {submitting ? <ChatBubble role="bot" message="Submitting your details..." /> : null}
      </div>

      {currentStep ? (
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">{currentStep.label}</p>
            {currentStep.description ? <p className="text-xs text-slate-500">{currentStep.description}</p> : null}
          </div>
          {renderInput}
          {error ? <p className="text-xs text-red-500">{error}</p> : null}
          {currentStep.type !== 'multiselect' ? (
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {currentStepIndex === LEAD_STEPS.length - 1 ? 'Submit' : 'Continue'}
            </button>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
