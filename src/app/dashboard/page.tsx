"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRupiah } from "../../utils/formatter";
import { useAuth } from "../../hooks/useAuth";
import { getUserStats } from "../../lib/firestore";

const quickLinks = [
  {
    href: "/dashboard/vehicles",
    title: "Kendaraan",
    description: "Kelola daftar kendaraan kamu",
    icon: <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
    color: "bg-blue-50 text-blue-700",
  },
  {
    href: "/dashboard/service",
    title: "Riwayat Servis",
    description: "Lihat semua catatan servis kendaraan",
    icon: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3-.6-.6Z" />,
    color: "bg-amber-50 text-amber-700",
  },
  {
    href: "/dashboard/fuel",
    title: "Riwayat Bensin",
    description: "Pantau pengisian bahan bakar",
    icon: <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />,
    color: "bg-brand-50 text-brand-700",
  },
];

interface Stats {
  vehicleCount: number;
  serviceCount: number;
  fuelCount: number;
  totalServiceCost: number;
  totalFuelCost: number;
  totalCost: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Pengguna";
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const data = await getUserStats(user.uid);
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">
          Halo, {displayName}! 👋
        </h1>
        <p className="mt-1 text-sm text-ink-muted">Selamat datang di AjuLaju. Mulai catat pengeluaran kendaraanmu.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Total Pengeluaran</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {loading ? "..." : formatRupiah(stats?.totalCost || 0)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Semua waktu</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Pengeluaran Bensin</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {loading ? "..." : formatRupiah(stats?.totalFuelCost || 0)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">{stats?.fuelCount || 0} pengisian</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Pengeluaran Servis</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {loading ? "..." : formatRupiah(stats?.totalServiceCost || 0)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">{stats?.serviceCount || 0} servis</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Total Kendaraan</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {loading ? "..." : stats?.vehicleCount || 0}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Terdaftar</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-start gap-4 rounded-2xl border border-surface-border bg-white p-5 shadow-soft transition hover:shadow-card"
          >
            <span className={`grid h-12 w-12 place-items-center rounded-xl ${link.color}`}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {link.icon}
              </svg>
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-ink group-hover:text-brand-700">{link.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{link.description}</p>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="mt-1 text-ink-subtle transition group-hover:translate-x-1 group-hover:text-brand-600"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Recent Activity - Empty State */}
      <div className="rounded-2xl border border-surface-border bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h3 className="font-display text-lg text-ink">Aktivitas Terbaru</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-ink-subtle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <h4 className="mt-4 font-semibold text-ink">Belum ada aktivitas</h4>
          <p className="mt-1 max-w-xs text-sm text-ink-muted">
            Mulai catat servis atau pengisian bensin kendaraanmu untuk melihat aktivitas di sini.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/dashboard/service"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
            >
              + Tambah Servis
            </Link>
            <Link
              href="/dashboard/fuel"
              className="rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-soft transition hover:bg-slate-50"
            >
              + Tambah Bensin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
