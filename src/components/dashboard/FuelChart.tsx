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
  const gridLines = [0.25, 0.5, 0.75, 1].map((p) => Math.round(maxValue * p));

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

      <div className="relative mt-6 h-40">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {gridLines.reverse().map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-16 text-right text-[10px] text-ink-subtle">
                {value >= 1000000 
                  ? `${(value / 1000000).toFixed(1)}jt`
                  : value >= 1000 
                  ? `${(value / 1000).toFixed(0)}rb`
                  : value}
              </span>
              <div className="flex-1 border-t border-dashed border-slate-200" />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-16 text-right text-[10px] text-ink-subtle">0</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-2 pl-[4.5rem]">
          {monthlyTotals.map((value, index) => {
            const height = Math.max((value / maxValue) * 100, 4);
            return (
              <div key={index} className="group relative flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-500/25 to-brand-500 transition group-hover:from-brand-600/40 group-hover:to-brand-600"
                  style={{ height: `${height}%` }}
                />
                <div className="pointer-events-none absolute bottom-full mb-2 rounded-md bg-ink px-2 py-1 text-xs text-white opacity-0 shadow-pop transition group-hover:opacity-100 whitespace-nowrap z-10">
                  {formatRupiah(value)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {labels ? (
        <div className="mt-2 flex gap-2 pl-[4.5rem] text-center text-xs text-ink-subtle">
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
