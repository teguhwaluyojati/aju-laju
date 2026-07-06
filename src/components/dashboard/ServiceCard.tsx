import type { ReactNode } from "react";

type ServiceCardProps = {
  title: string;
  date: string;
  cost: string;
  vehicle?: string;
  location?: string;
  actions?: ReactNode;
};

export default function ServiceCard({ title, date, cost, vehicle, location, actions }: ServiceCardProps) {
  return (
    <article className="group rounded-2xl border border-surface-border bg-white p-5 shadow-soft transition hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3-.6-.6Z" />
            </svg>
          </span>
          <div>
            <h3 className="font-semibold text-ink">{title}</h3>
            <p className="text-sm text-ink-muted">{date}</p>
            {vehicle ? (
              <p className="mt-1 text-xs text-ink-subtle">
                {vehicle}
                {location ? ` • ${location}` : ""}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink">
            {cost}
          </span>
          {actions ? <div className="flex items-center gap-1.5">{actions}</div> : null}
        </div>
      </div>
    </article>
  );
}
