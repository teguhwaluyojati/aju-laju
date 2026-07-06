import { formatRupiah } from "../../utils/formatter";

type FuelChartProps = {
  monthlyTotals: number[];
  labels?: string[];
};

export default function FuelChart({ monthlyTotals, labels }: FuelChartProps) {
  const maxValue = Math.max(...monthlyTotals, 1);
  const total = monthlyTotals.reduce((sum, value) => sum + value, 0);
  const average = monthlyTotals.length ? Math.round(total / monthlyTotals.length) : 0;

  // Generate grid values (4 lines)
  const gridValues = [0.25, 0.5, 0.75, 1].map((p) => Math.round(maxValue * p));

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

      <div className="relative mt-6 h-40 border-b border-l border-slate-200 ml-16">
        {/* Horizontal Grid Lines */}
        {gridValues.map((value, index) => (
          <div
            key={index}
            className="absolute left-0 right-0 border-t border-dashed border-slate-200"
            style={{ bottom: `${(index + 1) * 25}%` }}
          >
            <span className="absolute -left-16 -top-2 w-14 text-right text-[10px] text-ink-subtle">
              {value >= 1000000 
                ? `${(value / 1000000).toFixed(1)}jt`
                : value >= 1000 
                ? `${(value / 1000).toFixed(0)}rb`
                : value}
            </span>
          </div>
        ))}
        <span className="absolute -left-16 -bottom-1 w-14 text-right text-[10px] text-ink-subtle">0</span>

        {/* Vertical Grid Lines */}
        {monthlyTotals.map((_, index) => (
          <div
            key={`v-${index}`}
            className="absolute top-0 bottom-0 border-l border-dashed border-slate-100"
            style={{ left: `${((index + 1) / monthlyTotals.length) * 100}%` }}
          />
        ))}

        {/* Bars */}
        <div className="absolute inset-0 flex items-end z-10">
          {monthlyTotals.map((value, index) => {
            const height = value > 0 ? Math.max((value / maxValue) * 100, 8) : 0;
            return (
              <div key={index} className="group relative flex flex-1 flex-col items-center justify-end px-1 h-full">
                {value > 0 && (
                  <div
                    className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-brand-400 to-brand-600 transition group-hover:from-brand-500 group-hover:to-brand-700"
                    style={{ height: `${height}%` }}
                  />
                )}
                <div className="pointer-events-none absolute bottom-full mb-2 rounded-md bg-ink px-2 py-1 text-xs text-white opacity-0 shadow-pop transition group-hover:opacity-100 whitespace-nowrap z-20">
                  {formatRupiah(value)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {labels ? (
        <div className="mt-2 flex ml-16 text-center text-xs text-ink-subtle">
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
