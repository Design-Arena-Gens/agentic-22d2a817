import { ReactNode } from 'react';

export function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </header>
      {children}
    </section>
  );
}
