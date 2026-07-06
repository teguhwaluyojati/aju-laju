import Link from "next/link";
import { formatRupiah } from "../../utils/formatter";

const stats = [
  {
    label: "Total Pengeluaran Bulan Ini",
    value: formatRupiah(1240000),
    change: "-12%",
    changeType: "positive" as const,
  },
  {
    label: "Pengeluaran Bensin",
    value: formatRupiah(840000),
    change: "+5%",
    changeType: "negative" as const,
  },
  {
    label: "Pengeluaran Servis",
    value: formatRupiah(400000),
    change: "-28%",
    changeType: "positive" as const,
  },
  {
    label: "Total Kendaraan",
    value: "2",
    change: null,
    changeType: null,
  },
];

const recentActivities = [
  { type: "fuel", title: "Isi Bensin - Pertamina Cikini", date: "28 Jun 2026", amount: 65000 },
  { type: "service", title: "Ganti Oli Mesin", date: "24 Jun 2026", amount: 320000 },
  { type: "fuel", title: "Isi Bensin - Shell Menteng", date: "20 Jun 2026", amount: 60000 },
  { type: "service", title: "Servis Berkala 10.000 KM", date: "11 Mei 2026", amount: 750000 },
];

const quickLinks = [
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

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">Ringkasan pengeluaran kendaraan kamu.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft"
          >
            <p className="text-xs uppercase tracking-wide text-ink-subtle">{stat.label}</p>
            <p className="mt-2 font-display text-2xl text-ink">{stat.value}</p>
            {stat.change ? (
              <p
                className={`mt-1 text-xs font-medium ${
                  stat.changeType === "positive" ? "text-brand-600" : "text-red-500"
                }`}
              >
                {stat.change} dari bulan lalu
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
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

      {/* Recent Activity */}
      <div className="rounded-2xl border border-surface-border bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h3 className="font-display text-lg text-ink">Aktivitas Terbaru</h3>
          <span className="text-xs text-ink-subtle">{recentActivities.length} aktivitas</span>
        </div>
        <ul className="divide-y divide-surface-border">
          {recentActivities.map((activity, index) => (
            <li key={index} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-lg ${
                    activity.type === "fuel"
                      ? "bg-brand-50 text-brand-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {activity.type === "fuel" ? (
                      <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
                    ) : (
                      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3-.6-.6Z" />
                    )}
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-ink">{activity.title}</p>
                  <p className="text-sm text-ink-muted">{activity.date}</p>
                </div>
              </div>
              <span className="font-semibold text-ink">{formatRupiah(activity.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
