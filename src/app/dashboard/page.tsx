"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRupiah, formatServiceDate } from "../../utils/formatter";
import { useAuth } from "../../hooks/useAuth";
import { useT } from "../../hooks/useT";
import { getUserStats, getServiceRecords, getFuelRecords, getVehicles, getServiceReminders, type ServiceReminder } from "../../lib/firestore";
import type { ServiceRecord, FuelRecord, Vehicle } from "../../types";

function localizePath(locale: "id" | "en", path: string): string {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

interface Stats {
  vehicleCount: number;
  serviceCount: number;
  fuelCount: number;
  totalServiceCost: number;
  totalFuelCost: number;
  totalCost: number;
}

type Activity = {
  id: string;
  type: "service" | "fuel";
  title: string;
  vehicleName: string;
  date: string;
  cost: number;
};

export default function DashboardPage() {
  const { t, locale } = useT();
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email?.split("@")[0] || t("Pengguna", "User");
  const photoURL = user?.photoURL;
  const email = user?.email || "";
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ labels: string[]; totals: number[] }>({ labels: [], totals: [] });
  const [loading, setLoading] = useState(true);
  const [serviceReminders, setServiceReminders] = useState<ServiceReminder[]>([]);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [dismissedReminders, setDismissedReminders] = useState<string[]>([]);

  const quickLinks = [
    {
      href: "/dashboard/vehicles",
      title: t("Kendaraan", "Vehicles"),
      description: t("Kelola daftar kendaraan kamu", "Manage your vehicle list"),
      icon: <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
      color: "bg-blue-50 text-blue-700",
    },
    {
      href: "/dashboard/service",
      title: t("Riwayat Servis", "Service History"),
      description: t("Lihat semua catatan servis kendaraan", "See all vehicle service records"),
      icon: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3-.6-.6Z" />,
      color: "bg-amber-50 text-amber-700",
    },
    {
      href: "/dashboard/fuel",
      title: t("Riwayat Bensin", "Fuel History"),
      description: t("Pantau pengisian bahan bakar", "Track fuel fills"),
      icon: <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />,
      color: "bg-brand-50 text-brand-700",
    },
  ];

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [statsData, services, fuels, vehicles, reminders] = await Promise.all([
          getUserStats(user.uid),
          getServiceRecords(user.uid),
          getFuelRecords(user.uid),
          getVehicles(user.uid),
          getServiceReminders(user.uid),
        ]);
        
        setStats(statsData);
        setServiceReminders(reminders);
        
        // Show popup if there are reminders that haven't been dismissed
        const storedDismissed = localStorage.getItem("dismissedServiceReminders");
        const dismissed = storedDismissed ? JSON.parse(storedDismissed) : [];
        setDismissedReminders(dismissed);
        
        const hasNewReminders = reminders.some((r) => !dismissed.includes(r.vehicle.id));
        if (hasNewReminders) {
          setShowReminderPopup(true);
        }
        
        // Combine and sort activities
        const vehicleMap = new Map(vehicles.map((v) => [v.id, v.name]));
        
        const allActivities: Activity[] = [
          ...services.map((s) => ({
            id: s.id,
            type: "service" as const,
            title: s.title,
            vehicleName: vehicleMap.get(s.vehicleId) || t("Kendaraan Dihapus", "Deleted Vehicle"),
            date: s.date,
            cost: s.cost,
          })),
          ...fuels.map((f) => ({
            id: f.id,
            type: "fuel" as const,
            title: `${t("Isi", "Fill")} ${f.liter}L ${f.fuelType || t("Bensin", "Fuel")}`,
            vehicleName: vehicleMap.get(f.vehicleId) || t("Kendaraan Dihapus", "Deleted Vehicle"),
            date: f.date,
            cost: f.cost,
          })),
        ];
        
        // Sort by date descending
        allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setActivities(allActivities.slice(0, 5));
        
        // Calculate monthly totals for chart (last 6 months)
        const now = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const labels: string[] = [];
        const totals: number[] = [];
        
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(monthNames[d.getMonth()]);
          
          const monthServiceTotal = services
            .filter((s) => {
              const entryDate = new Date(s.date);
              return entryDate.getMonth() === d.getMonth() && entryDate.getFullYear() === d.getFullYear();
            })
            .reduce((sum, s) => sum + s.cost, 0);
          
          const monthFuelTotal = fuels
            .filter((f) => {
              const entryDate = new Date(f.date);
              return entryDate.getMonth() === d.getMonth() && entryDate.getFullYear() === d.getFullYear();
            })
            .reduce((sum, f) => sum + f.cost, 0);
          
          totals.push(monthServiceTotal + monthFuelTotal);
        }
        
        setMonthlyData({ labels, totals });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  function dismissReminder(vehicleId: string) {
    const newDismissed = [...dismissedReminders, vehicleId];
    setDismissedReminders(newDismissed);
    localStorage.setItem("dismissedServiceReminders", JSON.stringify(newDismissed));
    
    // Hide popup if all reminders dismissed
    const remainingReminders = serviceReminders.filter((r) => !newDismissed.includes(r.vehicle.id));
    if (remainingReminders.length === 0) {
      setShowReminderPopup(false);
    }
  }

  function dismissAllReminders() {
    const allIds = serviceReminders.map((r) => r.vehicle.id);
    setDismissedReminders(allIds);
    localStorage.setItem("dismissedServiceReminders", JSON.stringify(allIds));
    setShowReminderPopup(false);
  }

  const activeReminders = serviceReminders.filter((r) => !dismissedReminders.includes(r.vehicle.id));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Service Reminder Popup */}
      {showReminderPopup && activeReminders.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-pop animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-display text-lg text-ink">{t("Pengingat Servis", "Service Reminder")}</h3>
                  <p className="text-sm text-ink-muted">{t("Kendaraan berikut perlu servis segera", "The following vehicles need service soon")}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReminderPopup(false)}
                className="rounded-lg p-1 text-ink-muted hover:bg-slate-100"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 max-h-60 space-y-3 overflow-y-auto">
              {activeReminders.map((reminder) => (
                <div
                  key={reminder.vehicle.id}
                  className={`flex items-center justify-between rounded-xl border p-4 ${
                    reminder.kmRemaining <= 0
                      ? "border-red-200 bg-red-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-ink">{reminder.vehicle.name}</p>
                    <p className="text-sm text-ink-muted">
                      {reminder.kmRemaining <= 0 ? (
                        <span className="text-red-600 font-medium">
                          {t("Sudah lewat", "Overdue by")} {Math.abs(reminder.kmRemaining).toLocaleString(locale === "en" ? "en-US" : "id-ID")} KM!
                        </span>
                      ) : (
                        <>
                          {t("Servis dalam", "Service in")} {" "}
                          <span className="font-medium text-amber-700">
                            {reminder.kmRemaining.toLocaleString(locale === "en" ? "en-US" : "id-ID")} KM
                          </span>
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-ink-subtle">
                      {t("Target", "Target")}: {reminder.nextServiceAt.toLocaleString(locale === "en" ? "en-US" : "id-ID")} KM
                    </p>
                  </div>
                  <button
                    onClick={() => dismissReminder(reminder.vehicle.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-white"
                  >
                    {t("Tutup", "Dismiss")}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={dismissAllReminders}
                className="flex-1 rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-50"
              >
                {t("Tutup Semua", "Dismiss All")}
              </button>
              <Link
                href={localizePath(locale, "/dashboard/service")}
                className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
                onClick={() => setShowReminderPopup(false)}
              >
                {t("Catat Servis", "Log Service")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Service Reminder Banner (always visible if there are reminders) */}
      {!loading && activeReminders.length > 0 && !showReminderPopup && (
        <button
          onClick={() => setShowReminderPopup(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition hover:bg-amber-100"
        >
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              {activeReminders.length} {t("kendaraan perlu servis", "vehicles need service")}
            </p>
            <p className="text-sm text-amber-700">{t("Klik untuk melihat detail", "Click to view details")}</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-600">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Header with Profile */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="h-14 w-14 rounded-full border-2 border-brand-100 object-cover shadow-soft"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-brand-700 font-semibold text-xl shadow-soft">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="font-display text-2xl text-ink sm:text-3xl">
              {t("Halo", "Hello")}, {displayName}! 👋
            </h1>
            <p className="text-sm text-ink-muted">{email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-subtle">{t("Member sejak", "Member since")}</p>
          <p className="text-sm font-medium text-ink">
            {user?.metadata?.creationTime 
                ? new Date(user.metadata.creationTime).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { 
                  day: "numeric", 
                  month: "long", 
                  year: "numeric" 
                })
              : "-"}
          </p>
        </div>
      </div>

      <p className="text-sm text-ink-muted">
        {t("Selamat datang di", "Welcome to")} <span className="font-semibold">Aju</span><span className="font-semibold text-brand-600">Laju</span>. {t("Mulai catat pengeluaran kendaraanmu.", "Start tracking your vehicle expenses.")}
      </p>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Total Pengeluaran", "Total Expense")}</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {loading ? "..." : formatRupiah(stats?.totalCost || 0, locale)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">{t("Semua waktu", "All time")}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Pengeluaran Bensin", "Fuel Expense")}</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {loading ? "..." : formatRupiah(stats?.totalFuelCost || 0, locale)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">{stats?.fuelCount || 0} {t("pengisian", "fills")}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Pengeluaran Servis", "Service Expense")}</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {loading ? "..." : formatRupiah(stats?.totalServiceCost || 0, locale)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">{stats?.serviceCount || 0} {t("servis", "services")}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Total Kendaraan", "Total Vehicles")}</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {loading ? "..." : stats?.vehicleCount || 0}
          </p>
          <p className="mt-1 text-xs text-ink-muted">{t("Terdaftar", "Registered")}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={localizePath(locale, link.href)}
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

      {/* Expense Chart */}
      {!loading && monthlyData.totals.some((t) => t > 0) && (() => {
        const maxValue = Math.max(...monthlyData.totals, 1);
        const gridValues = [0.25, 0.5, 0.75, 1].map((p) => Math.round(maxValue * p));
        
        return (
          <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg text-ink">{t("Grafik Pengeluaran", "Expense Chart")}</h3>
                <p className="text-sm text-ink-muted">{t("Total pengeluaran per bulan", "Total expense per month")}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-subtle">{t("Rata-rata", "Average")}</p>
                <p className="font-semibold text-ink">
                  {formatRupiah(Math.round(monthlyData.totals.reduce((a, b) => a + b, 0) / monthlyData.totals.length), locale)}
                </p>
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
              {monthlyData.totals.map((_, index) => (
                <div
                  key={`v-${index}`}
                  className="absolute top-0 bottom-0 border-l border-dashed border-slate-100"
                  style={{ left: `${((index + 1) / monthlyData.totals.length) * 100}%` }}
                />
              ))}

              {/* Bars */}
              <div className="absolute inset-0 flex items-end z-10">
                {monthlyData.totals.map((value, index) => {
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
                        {formatRupiah(value, locale)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 flex ml-16 text-center text-xs text-ink-subtle">
              {monthlyData.labels.map((label, index) => (
                <span key={index} className="flex-1">
                  {label}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Recent Activity */}
      <div className="rounded-2xl border border-surface-border bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h3 className="font-display text-lg text-ink">{t("Aktivitas Terbaru", "Recent Activity")}</h3>
          {activities.length > 0 && (
            <span className="text-xs text-ink-subtle">{activities.length} {t("terbaru", "latest")}</span>
          )}
        </div>
        
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-ink-subtle">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <h4 className="mt-4 font-semibold text-ink">{t("Belum ada aktivitas", "No activity yet")}</h4>
            <p className="mt-1 max-w-xs text-sm text-ink-muted">
              {t("Mulai catat servis atau pengisian bensin kendaraanmu untuk melihat aktivitas di sini.", "Start logging service or fuel records to see activity here.")}
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href={localizePath(locale, "/dashboard/service")}
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
              >
                + {t("Tambah Servis", "Add Service")}
              </Link>
              <Link
                href={localizePath(locale, "/dashboard/fuel")}
                className="rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-soft transition hover:bg-slate-50"
              >
                + {t("Tambah Bensin", "Add Fuel")}
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-surface-border">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl ${
                      activity.type === "service"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-brand-50 text-brand-700"
                    }`}
                  >
                    {activity.type === "service" ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3-.6-.6Z" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p className="font-medium text-ink">{activity.title}</p>
                    <p className="text-sm text-ink-muted">
                      {activity.vehicleName} • {formatServiceDate(activity.date, locale)}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-ink">{formatRupiah(activity.cost, locale)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
