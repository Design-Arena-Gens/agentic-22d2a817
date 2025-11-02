import clsx from 'clsx';

export type ChatBubbleProps = {
  role: 'bot' | 'user';
  message: string;
  timestamp?: string;
};

export function ChatBubble({ role, message, timestamp }: ChatBubbleProps) {
  const isBot = role === 'bot';
  return (
    <div
      className={clsx('flex w-full flex-col gap-1', {
        'items-end': !isBot,
        'items-start': isBot
      })}
    >
      <span
        className={clsx('max-w-xl rounded-2xl px-4 py-2 text-sm shadow-sm', {
          'bg-white text-slate-900': isBot,
          'bg-brand-600 text-white': !isBot
        })}
      >
        {message}
      </span>
      {timestamp ? <span className="text-xs text-slate-400">{timestamp}</span> : null}
    </div>
  );
}
