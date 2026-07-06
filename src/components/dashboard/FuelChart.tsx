import { formatRupiah } from "../../utils/formatter";

type FuelChartProps = {
  monthlyTotals: number[];
  labels?: string[];
};

export default function FuelChart({ monthlyTotals, labels }: FuelChartProps) {
  const maxValue = Math.max(...monthlyTotals, 1);
  const total = monthlyTotals.reduce((sum, value) => sum + value, 0);
  const average = monthlyTotals.length ? Math.round(total / monthlyTotals.length) : 0;

  return (
    <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-ink">Grafik Bensin</h3>
          <p className="text-sm text-ink-muted">Pengeluaran bensin per periode</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-subtle">Rata-rata</p>
          <p className="font-semibold text-ink">{formatRupiah(average)}</p>
        </div>
      </div>

      <div className="mt-6 flex h-40 items-end gap-2">
        {monthlyTotals.map((value, index) => {
          const height = Math.max((value / maxValue) * 100, 6);
          return (
            <div key={index} className="group relative flex flex-1 flex-col items-center">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-brand-500/25 to-brand-500 transition group-hover:from-brand-600/40 group-hover:to-brand-600"
                style={{ height: `${height}%` }}
              />
              <div className="pointer-events-none absolute bottom-full mb-2 rounded-md bg-ink px-2 py-1 text-xs text-white opacity-0 shadow-pop transition group-hover:opacity-100">
                {formatRupiah(value)}
              </div>
            </div>
          );
        })}
      </div>

      {labels ? (
        <div className="mt-2 flex gap-2 text-center text-xs text-ink-subtle">
          {labels.map((label, index) => (
            <span key={index} className="flex-1">
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
