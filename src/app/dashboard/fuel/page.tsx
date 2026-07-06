import FuelChart from "../../../components/dashboard/FuelChart";
import { formatRupiah, formatServiceDate } from "../../../utils/formatter";

const monthlyTotals = [420000, 380000, 510000, 470000, 560000, 610000];
const labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];

const entries = [
  { id: "f1", date: "2026-06-28", liter: 5.2, cost: 65000, station: "Pertamina Cikini" },
  { id: "f2", date: "2026-06-20", liter: 4.8, cost: 60000, station: "Shell Menteng" },
  { id: "f3", date: "2026-06-10", liter: 5.0, cost: 62500, station: "Pertamina Cikini" },
];

export default function FuelHistoryPage() {
  const total = monthlyTotals.reduce((sum, value) => sum + value, 0);
  const thisMonth = monthlyTotals[monthlyTotals.length - 1];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Riwayat Bensin</h1>
          <p className="mt-1 text-sm text-ink-muted">Pantau pengisian bahan bakar dan biayanya.</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Catat Isi Bensin
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Bulan Ini</p>
          <p className="mt-2 font-display text-2xl text-ink">{formatRupiah(thisMonth)}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">6 Bulan Terakhir</p>
          <p className="mt-2 font-display text-2xl text-ink">{formatRupiah(total)}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Total Pengisian</p>
          <p className="mt-2 font-display text-2xl text-ink">{entries.length}x</p>
        </div>
      </div>

      <FuelChart monthlyTotals={monthlyTotals} labels={labels} />

      <div className="rounded-2xl border border-surface-border bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h3 className="font-display text-lg text-ink">Pengisian Terbaru</h3>
          <span className="text-xs text-ink-subtle">{entries.length} entri</span>
        </div>
        <ul className="divide-y divide-surface-border">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-ink">{entry.station}</p>
                <p className="text-sm text-ink-muted">
                  {formatServiceDate(entry.date)} • {entry.liter} L
                </p>
              </div>
              <span className="font-semibold text-ink">{formatRupiah(entry.cost)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
