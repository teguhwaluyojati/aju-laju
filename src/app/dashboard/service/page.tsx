"use client";

import { useState } from "react";
import ServiceCard from "../../../components/dashboard/ServiceCard";
import { formatRupiah } from "../../../utils/formatter";

export default function ServiceHistoryPage() {
  const [services] = useState<Array<{
    id: string;
    title: string;
    date: string;
    cost: number;
    vehicle: string;
    location: string;
  }>>([]);

  const total = services.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Riwayat Servis</h1>
          <p className="mt-1 text-sm text-ink-muted">Daftar semua catatan servis kendaraan kamu.</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah Servis
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Total Servis</p>
          <p className="mt-2 font-display text-2xl text-ink">{services.length}x</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Total Pengeluaran</p>
          <p className="mt-2 font-display text-2xl text-ink">{formatRupiah(total)}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Servis Terakhir</p>
          <p className="mt-2 font-display text-2xl text-ink">-</p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-surface-border bg-white p-12 shadow-soft text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3-.6-.6Z" />
            </svg>
          </span>
          <h3 className="mt-4 font-semibold text-ink">Belum ada catatan servis</h3>
          <p className="mt-2 text-sm text-ink-muted">Mulai catat servis kendaraanmu untuk melacak pengeluaran perawatan.</p>
          <button
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Tambah Servis Pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              date={service.date}
              cost={formatRupiah(service.cost)}
              vehicle={service.vehicle}
              location={service.location}
            />
          ))}
        </div>
      )}
    </div>
  );
}
