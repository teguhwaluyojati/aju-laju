"use client";

import { useState, useEffect } from "react";
import FuelChart from "../../../components/dashboard/FuelChart";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { formatRupiah, formatServiceDate } from "../../../utils/formatter";
import { useAuth } from "../../../hooks/useAuth";
import { getFuelRecords, getVehicles, createFuelRecord } from "../../../lib/firestore";
import type { FuelRecord, Vehicle } from "../../../types";

type FuelWithVehicle = FuelRecord & { vehicleName: string };

export default function FuelHistoryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FuelWithVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFuel, setNewFuel] = useState({
    vehicleId: "",
    date: new Date().toISOString().split("T")[0],
    liter: 0,
    cost: 0,
    station: "",
    odometer: 0,
    fuelType: "Pertalite",
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [fuelList, vehicleList] = await Promise.all([
          getFuelRecords(user.uid),
          getVehicles(user.uid),
        ]);
        
        setVehicles(vehicleList);
        setEntries(
          fuelList.map((f) => ({
            ...f,
            vehicleName: vehicleList.find((v) => v.id === f.vehicleId)?.name || "Kendaraan Dihapus",
          }))
        );
      } catch (error) {
        console.error("Error fetching fuels:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  async function handleAddFuel() {
    if (!user || !newFuel.vehicleId) return;
    setSaving(true);
    try {
      const pricePerLiter = newFuel.liter > 0 ? Math.round(newFuel.cost / newFuel.liter) : 0;
      
      await createFuelRecord(user.uid, {
        vehicleId: newFuel.vehicleId,
        date: newFuel.date,
        liter: newFuel.liter,
        cost: newFuel.cost,
        pricePerLiter,
        station: newFuel.station,
        odometer: newFuel.odometer,
        fuelType: newFuel.fuelType,
      });
      
      // Refresh list
      const fuelList = await getFuelRecords(user.uid);
      setEntries(
        fuelList.map((f) => ({
          ...f,
          vehicleName: vehicles.find((v) => v.id === f.vehicleId)?.name || "Kendaraan Dihapus",
        }))
      );
      
      setIsModalOpen(false);
      setNewFuel({
        vehicleId: "",
        date: new Date().toISOString().split("T")[0],
        liter: 0,
        cost: 0,
        station: "",
        odometer: 0,
        fuelType: "Pertalite",
      });
    } catch (error) {
      console.error("Error adding fuel:", error);
      alert("Gagal menambahkan catatan bensin. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  // Calculate monthly totals for chart
  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const last6Months: string[] = [];
  const monthlyTotals: number[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push(monthNames[d.getMonth()]);
    
    const monthTotal = entries
      .filter((e) => {
        const entryDate = new Date(e.date);
        return entryDate.getMonth() === d.getMonth() && entryDate.getFullYear() === d.getFullYear();
      })
      .reduce((sum, e) => sum + e.cost, 0);
    monthlyTotals.push(monthTotal);
  }

  const total = entries.reduce((sum, item) => sum + item.cost, 0);
  const thisMonthTotal = entries
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.cost, 0);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Riwayat Bensin</h1>
          <p className="mt-1 text-sm text-ink-muted">Pantau pengisian bahan bakar dan biayanya.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} disabled={vehicles.length === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Catat Isi Bensin
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Bulan Ini</p>
          <p className="mt-2 font-display text-2xl text-ink">{formatRupiah(thisMonthTotal)}</p>
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
        <FuelChart monthlyTotals={monthlyTotals} labels={last6Months} />
      )}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-surface-border bg-white p-12 shadow-soft text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
            </svg>
          </span>
          <h3 className="mt-4 font-semibold text-ink">Belum ada catatan bensin</h3>
          <p className="mt-2 text-sm text-ink-muted">
            {vehicles.length === 0 
              ? "Tambahkan kendaraan terlebih dahulu sebelum mencatat pengisian bensin."
              : "Mulai catat pengisian bensin kendaraanmu untuk melacak konsumsi BBM."}
          </p>
          {vehicles.length > 0 && (
            <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Catat Pengisian Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-border bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <h3 className="font-display text-lg text-ink">Pengisian Terbaru</h3>
            <span className="text-xs text-ink-subtle">{entries.length} entri</span>
          </div>
          <ul className="divide-y divide-surface-border">
            {entries.slice(0, 10).map((entry) => (
              <li key={entry.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-ink">{entry.station}</p>
                  <p className="text-sm text-ink-muted">
                    {formatServiceDate(entry.date)} • {entry.liter} L • {entry.vehicleName}
                  </p>
                </div>
                <span className="font-semibold text-ink">{formatRupiah(entry.cost)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Fuel Modal */}
      <Modal open={isModalOpen} title="Catat Pengisian Bensin" onClose={() => setIsModalOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddFuel();
          }}
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="fuelVehicle">
              Kendaraan
            </label>
            <select
              id="fuelVehicle"
              className="h-11 w-full rounded-xl border border-surface-border bg-white px-4 text-sm text-ink transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              value={newFuel.vehicleId}
              onChange={(e) => setNewFuel({ ...newFuel, vehicleId: e.target.value })}
              required
            >
              <option value="">Pilih kendaraan</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="fuelDate">
                Tanggal
              </label>
              <Input
                id="fuelDate"
                type="date"
                value={newFuel.date}
                onChange={(e) => setNewFuel({ ...newFuel, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="fuelType">
                Jenis BBM
              </label>
              <select
                id="fuelType"
                className="h-11 w-full rounded-xl border border-surface-border bg-white px-4 text-sm text-ink transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                value={newFuel.fuelType}
                onChange={(e) => setNewFuel({ ...newFuel, fuelType: e.target.value })}
              >
                <option value="Pertalite">Pertalite</option>
                <option value="Pertamax">Pertamax</option>
                <option value="Pertamax Turbo">Pertamax Turbo</option>
                <option value="Solar">Solar</option>
                <option value="Dexlite">Dexlite</option>
                <option value="Pertamina Dex">Pertamina Dex</option>
                <option value="Shell V-Power">Shell V-Power</option>
                <option value="Shell Super">Shell Super</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="fuelLiter">
                Jumlah (Liter)
              </label>
              <Input
                id="fuelLiter"
                type="number"
                step="0.1"
                placeholder="5.5"
                min={0}
                value={newFuel.liter || ""}
                onChange={(e) => setNewFuel({ ...newFuel, liter: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="fuelCost">
                Total Biaya (Rp)
              </label>
              <Input
                id="fuelCost"
                type="number"
                placeholder="65000"
                min={0}
                value={newFuel.cost || ""}
                onChange={(e) => setNewFuel({ ...newFuel, cost: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="fuelStation">
              SPBU / Lokasi
            </label>
            <Input
              id="fuelStation"
              placeholder="Contoh: Pertamina Cikini"
              value={newFuel.station}
              onChange={(e) => setNewFuel({ ...newFuel, station: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="fuelOdometer">
              Odometer (KM)
            </label>
            <Input
              id="fuelOdometer"
              type="number"
              placeholder="12500"
              min={0}
              value={newFuel.odometer || ""}
              onChange={(e) => setNewFuel({ ...newFuel, odometer: parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
