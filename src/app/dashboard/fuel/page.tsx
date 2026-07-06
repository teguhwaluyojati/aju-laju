"use client";

import { useState } from "react";
import FuelChart from "../../../components/dashboard/FuelChart";
import { formatRupiah, formatServiceDate } from "../../../utils/formatter";

export default function FuelHistoryPage() {
  const [entries] = useState<Array<{
    id: string;
    date: string;
    liter: number;
    cost: number;
    station: string;
  }>>([]);

  const monthlyTotals = [0, 0, 0, 0, 0, 0];
  const labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];

  const total = entries.reduce((sum, item) => sum + item.cost, 0);

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
          <p className="mt-2 font-display text-2xl text-ink">{formatRupiah(0)}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Total Pengeluaran</p>
          <p className="mt-2 font-display text-2xl text-ink">{formatRupiah(total)}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Total Pengisian</p>
          <p className="mt-2 font-display text-2xl text-ink">{entries.length}x</p>
        </div>
      </div>

      {entries.length > 0 && (
        <FuelChart monthlyTotals={monthlyTotals} labels={labels} />
      )}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-surface-border bg-white p-12 shadow-soft text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
            </svg>
          </span>
          <h3 className="mt-4 font-semibold text-ink">Belum ada catatan bensin</h3>
          <p className="mt-2 text-sm text-ink-muted">Mulai catat pengisian bensin kendaraanmu untuk melacak konsumsi BBM.</p>
          <button
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Catat Pengisian Pertama
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
}
