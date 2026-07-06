import ServiceCard from "../../../components/dashboard/ServiceCard";
import { formatRupiah, formatServiceDate } from "../../../utils/formatter";

const services = [
  {
    id: "s1",
    title: "Ganti Oli Mesin",
    date: "2026-06-24",
    cost: 320000,
    vehicle: "Honda Vario 160",
    location: "AHASS Menteng",
  },
  {
    id: "s2",
    title: "Servis Berkala 10.000 KM",
    date: "2026-05-11",
    cost: 750000,
    vehicle: "Toyota Avanza",
    location: "Auto2000 Cikini",
  },
  {
    id: "s3",
    title: "Ganti Kampas Rem",
    date: "2026-03-18",
    cost: 240000,
    vehicle: "Honda Vario 160",
    location: "AHASS Menteng",
  },
];

export default function ServiceHistoryPage() {
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
          <p className="mt-2 font-display text-2xl text-ink">{formatServiceDate(services[0].date)}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            date={formatServiceDate(service.date)}
            cost={formatRupiah(service.cost)}
            vehicle={service.vehicle}
            location={service.location}
          />
        ))}
      </div>
    </div>
  );
}
