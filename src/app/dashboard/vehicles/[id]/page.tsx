"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { formatRupiah, formatServiceDate } from "../../../../utils/formatter";
import Button from "../../../../components/ui/Button";

type Vehicle = {
  id: string;
  name: string;
  plateNumber: string;
  type: "car" | "motorcycle";
  brand: string;
  year: number;
  color: string;
  odometer: number;
  purchaseDate: string;
  notes: string;
};

type ServiceRecord = {
  id: string;
  title: string;
  date: string;
  cost: number;
  location: string;
};

type FuelRecord = {
  id: string;
  date: string;
  liter: number;
  cost: number;
  station: string;
  odometer: number;
};

const mockVehicles: Record<string, Vehicle> = {
  v1: {
    id: "v1",
    name: "Vario Hitam",
    plateNumber: "B 1234 ABC",
    type: "motorcycle",
    brand: "Honda Vario 160",
    year: 2023,
    color: "Hitam",
    odometer: 12500,
    purchaseDate: "2023-03-15",
    notes: "Beli baru dari dealer resmi",
  },
  v2: {
    id: "v2",
    name: "Mobil Keluarga",
    plateNumber: "B 5678 DEF",
    type: "car",
    brand: "Toyota Avanza",
    year: 2021,
    color: "Putih",
    odometer: 35000,
    purchaseDate: "2021-08-20",
    notes: "Mobil keluarga untuk sehari-hari",
  },
};

const mockServices: Record<string, ServiceRecord[]> = {
  v1: [
    { id: "s1", title: "Ganti Oli Mesin", date: "2026-06-24", cost: 120000, location: "AHASS Menteng" },
    { id: "s2", title: "Ganti Kampas Rem", date: "2026-03-18", cost: 240000, location: "AHASS Menteng" },
    { id: "s3", title: "Servis Rutin", date: "2025-12-10", cost: 85000, location: "AHASS Cikini" },
  ],
  v2: [
    { id: "s4", title: "Servis Berkala 10.000 KM", date: "2026-05-11", cost: 750000, location: "Auto2000 Cikini" },
    { id: "s5", title: "Ganti Oli & Filter", date: "2026-01-20", cost: 450000, location: "Auto2000 Cikini" },
  ],
};

const mockFuels: Record<string, FuelRecord[]> = {
  v1: [
    { id: "f1", date: "2026-06-28", liter: 5.2, cost: 65000, station: "Pertamina Cikini", odometer: 12500 },
    { id: "f2", date: "2026-06-20", liter: 4.8, cost: 60000, station: "Shell Menteng", odometer: 12350 },
    { id: "f3", date: "2026-06-10", liter: 5.0, cost: 62500, station: "Pertamina Cikini", odometer: 12180 },
  ],
  v2: [
    { id: "f4", date: "2026-06-25", liter: 35, cost: 455000, station: "Shell Kemang", odometer: 35000 },
    { id: "f5", date: "2026-06-15", liter: 30, cost: 390000, station: "Pertamina Sudirman", odometer: 34650 },
  ],
};

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  
  const vehicle = mockVehicles[vehicleId];
  const services = mockServices[vehicleId] || [];
  const fuels = mockFuels[vehicleId] || [];

  if (!vehicle) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-ink">Kendaraan tidak ditemukan</h2>
          <p className="mt-2 text-sm text-ink-muted">Kendaraan yang kamu cari tidak ada.</p>
          <Link href="/dashboard/vehicles">
            <Button className="mt-4" variant="secondary">
              Kembali ke Daftar Kendaraan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalServiceCost = services.reduce((sum, s) => sum + s.cost, 0);
  const totalFuelCost = fuels.reduce((sum, f) => sum + f.cost, 0);
  const totalFuelLiter = fuels.reduce((sum, f) => sum + f.liter, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Link
        href="/dashboard/vehicles"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Kembali ke Daftar Kendaraan
      </Link>

      {/* Vehicle Header */}
      <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span
              className={`grid h-16 w-16 place-items-center rounded-2xl ${
                vehicle.type === "car" ? "bg-blue-50 text-blue-600" : "bg-brand-50 text-brand-700"
              }`}
            >
              {vehicle.type === "car" ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="17" r="2" />
                  <path d="M12 15V5l4 2v4" />
                  <circle cx="12" cy="5" r="1" />
                </svg>
              )}
            </span>
            <div>
              <h1 className="font-display text-2xl text-ink sm:text-3xl">{vehicle.name}</h1>
              <p className="mt-1 text-ink-muted">{vehicle.brand}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink">
                  {vehicle.plateNumber}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink">
                  {vehicle.year}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink">
                  {vehicle.color}
                </span>
              </div>
            </div>
          </div>
          <Button variant="secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            Edit
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 border-t border-surface-border pt-6 sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Odometer</p>
            <p className="mt-1 font-display text-xl text-ink">{vehicle.odometer.toLocaleString()} KM</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Total Servis</p>
            <p className="mt-1 font-display text-xl text-ink">{formatRupiah(totalServiceCost)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Total Bensin</p>
            <p className="mt-1 font-display text-xl text-ink">{formatRupiah(totalFuelCost)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Konsumsi Bensin</p>
            <p className="mt-1 font-display text-xl text-ink">{totalFuelLiter.toFixed(1)} L</p>
          </div>
        </div>

        {vehicle.notes ? (
          <div className="mt-6 rounded-xl bg-surface-muted p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Catatan</p>
            <p className="mt-1 text-sm text-ink-muted">{vehicle.notes}</p>
          </div>
        ) : null}
      </div>

      {/* Tabs Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Service History */}
        <div className="rounded-2xl border border-surface-border bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <h3 className="font-display text-lg text-ink">Riwayat Servis</h3>
            <span className="text-xs text-ink-subtle">{services.length} catatan</span>
          </div>
          {services.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-ink-muted">Belum ada catatan servis.</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface-border">
              {services.map((service) => (
                <li key={service.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-700">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3-.6-.6Z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-ink">{service.title}</p>
                      <p className="text-sm text-ink-muted">
                        {formatServiceDate(service.date)} • {service.location}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-ink">{formatRupiah(service.cost)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fuel History */}
        <div className="rounded-2xl border border-surface-border bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <h3 className="font-display text-lg text-ink">Riwayat Bensin</h3>
            <span className="text-xs text-ink-subtle">{fuels.length} catatan</span>
          </div>
          {fuels.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-ink-muted">Belum ada catatan bensin.</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface-border">
              {fuels.map((fuel) => (
                <li key={fuel.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-ink">{fuel.station}</p>
                      <p className="text-sm text-ink-muted">
                        {formatServiceDate(fuel.date)} • {fuel.liter} L • {fuel.odometer.toLocaleString()} KM
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-ink">{formatRupiah(fuel.cost)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
