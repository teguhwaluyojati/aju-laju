"use client";

import { useState, useEffect } from "react";
import FuelChart from "../../../components/dashboard/FuelChart";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { formatRupiah, formatServiceDate } from "../../../utils/formatter";
import { useAuth } from "../../../hooks/useAuth";
import { useT } from "../../../hooks/useT";
import {
  getFuelRecords,
  getVehicles,
  createFuelRecord,
  updateFuelRecord,
  deleteFuelRecord,
} from "../../../lib/firestore";
import type { FuelRecord, FuelRecordInput, Vehicle } from "../../../types";

type FuelWithVehicle = FuelRecord & { vehicleName: string };

export default function FuelHistoryPage() {
  const { t, locale } = useT();
  const { user } = useAuth();
  const [entries, setEntries] = useState<FuelWithVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFuelId, setEditingFuelId] = useState<string | null>(null);
  const [newFuel, setNewFuel] = useState({
    vehicleId: "",
    date: new Date().toISOString().split("T")[0],
    liter: 0,
    cost: 0,
    station: "",
    odometer: 0,
    fuelType: "Pertalite",
  });

  const defaultFuelState = {
    vehicleId: "",
    date: new Date().toISOString().split("T")[0],
    liter: 0,
    cost: 0,
    station: "",
    odometer: 0,
    fuelType: "Pertalite",
  };

  function mapFuelWithVehicle(fuelList: FuelRecord[], vehicleList: Vehicle[]): FuelWithVehicle[] {
    return fuelList.map((f) => ({
      ...f,
      vehicleName: vehicleList.find((v) => v.id === f.vehicleId)?.name || t("Kendaraan Dihapus", "Deleted Vehicle"),
    }));
  }

  async function refreshFuelEntries(userId: string, vehicleList: Vehicle[]) {
    const fuelList = await getFuelRecords(userId);
    setEntries(mapFuelWithVehicle(fuelList, vehicleList));
  }

  function openAddModal() {
    setEditingFuelId(null);
    setNewFuel(defaultFuelState);
    setIsModalOpen(true);
  }

  function openEditModal(entry: FuelWithVehicle) {
    setEditingFuelId(entry.id);
    setNewFuel({
      vehicleId: entry.vehicleId,
      date: entry.date,
      liter: entry.liter,
      cost: entry.cost,
      station: entry.station,
      odometer: entry.odometer,
      fuelType: entry.fuelType || "Pertalite",
    });
    setIsModalOpen(true);
  }

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [fuelList, vehicleList] = await Promise.all([
          getFuelRecords(user.uid),
          getVehicles(user.uid),
        ]);

        setVehicles(vehicleList);
        setEntries(mapFuelWithVehicle(fuelList, vehicleList));
      } catch (error) {
        console.error("Error fetching fuels:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, t]);

  async function handleSaveFuel() {
    if (!user || !newFuel.vehicleId) return;
    setSaving(true);
    try {
      const pricePerLiter = newFuel.liter > 0 ? Math.round(newFuel.cost / newFuel.liter) : 0;

      const payload: FuelRecordInput = {
        vehicleId: newFuel.vehicleId,
        date: newFuel.date,
        liter: newFuel.liter,
        cost: newFuel.cost,
        pricePerLiter,
        station: newFuel.station,
        odometer: newFuel.odometer,
        fuelType: newFuel.fuelType,
      };

      if (editingFuelId) {
        await updateFuelRecord(editingFuelId, payload);
      } else {
        await createFuelRecord(user.uid, payload);
      }

      await refreshFuelEntries(user.uid, vehicles);

      setIsModalOpen(false);
      setEditingFuelId(null);
      setNewFuel(defaultFuelState);
    } catch (error) {
      console.error("Error saving fuel:", error);
      alert(
        editingFuelId
          ? t("Gagal memperbarui catatan bensin. Silakan coba lagi.", "Failed to update fuel record. Please try again.")
          : t("Gagal menambahkan catatan bensin. Silakan coba lagi.", "Failed to add fuel record. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFuel(entry: FuelWithVehicle) {
    if (!user) return;

    const isConfirmed = window.confirm(
      t(
        `Hapus catatan bensin di \"${entry.station}\"? Tindakan ini tidak bisa dibatalkan.`,
        `Delete fuel record at \"${entry.station}\"? This action cannot be undone.`
      )
    );
    if (!isConfirmed) return;

    setDeletingId(entry.id);
    try {
      await deleteFuelRecord(entry.id);
      await refreshFuelEntries(user.uid, vehicles);
    } catch (error) {
      console.error("Error deleting fuel:", error);
      alert(t("Gagal menghapus catatan bensin. Silakan coba lagi.", "Failed to delete fuel record. Please try again."));
    } finally {
      setDeletingId(null);
    }
  }

  const now = new Date();
  const monthNames = locale === "en"
    ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    : ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
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
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{t("Riwayat Bensin", "Fuel History")}</h1>
          <p className="mt-1 text-sm text-ink-muted">{t("Pantau pengisian bahan bakar dan biayanya.", "Track fuel fills and their costs.")}</p>
        </div>
        <Button onClick={openAddModal} disabled={vehicles.length === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t("Catat Isi Bensin", "Log Fuel Fill")}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Bulan Ini", "This Month")}</p>
          <p className="mt-2 font-display text-2xl text-ink">{formatRupiah(thisMonthTotal, locale)}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Total Pengeluaran", "Total Expense")}</p>
          <p className="mt-2 font-display text-2xl text-ink">{formatRupiah(total, locale)}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Total Pengisian", "Total Fills")}</p>
          <p className="mt-2 font-display text-2xl text-ink">{entries.length}x</p>
        </div>
      </div>

      {entries.length > 0 && <FuelChart monthlyTotals={monthlyTotals} labels={last6Months} />}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-surface-border bg-white p-12 shadow-soft text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
            </svg>
          </span>
          <h3 className="mt-4 font-semibold text-ink">{t("Belum ada catatan bensin", "No fuel records yet")}</h3>
          <p className="mt-2 text-sm text-ink-muted">
            {vehicles.length === 0
              ? t("Tambahkan kendaraan terlebih dahulu sebelum mencatat pengisian bensin.", "Add a vehicle before logging fuel fills.")
              : t("Mulai catat pengisian bensin kendaraanmu untuk melacak konsumsi BBM.", "Start logging fuel fills to track fuel consumption.")}
          </p>
          {vehicles.length > 0 && (
            <Button className="mt-6" onClick={openAddModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {t("Catat Pengisian Pertama", "Log First Fill")}
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-border bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <h3 className="font-display text-lg text-ink">{t("Pengisian Terbaru", "Latest Fills")}</h3>
            <span className="text-xs text-ink-subtle">{entries.length} {t("entri", "entries")}</span>
          </div>
          <ul className="divide-y divide-surface-border">
            {entries.slice(0, 10).map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{entry.station}</p>
                  <p className="truncate text-sm text-ink-muted">
                    {formatServiceDate(entry.date, locale)} • {entry.liter} L • {entry.vehicleName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink">
                    {formatRupiah(entry.cost, locale)}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEditModal(entry)}
                    disabled={saving || deletingId === entry.id}
                    aria-label={t("Edit", "Edit")}
                    title={t("Edit", "Edit")}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-surface-border bg-white text-ink-muted transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFuel(entry)}
                    disabled={saving || deletingId === entry.id}
                    aria-label={deletingId === entry.id ? t("Menghapus...", "Deleting...") : t("Hapus", "Delete")}
                    title={t("Hapus", "Delete")}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === entry.id ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={isModalOpen}
        title={editingFuelId ? t("Edit Catatan Bensin", "Edit Fuel Record") : t("Catat Pengisian Bensin", "Log Fuel Fill")}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFuelId(null);
          setNewFuel(defaultFuelState);
        }}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveFuel();
          }}
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="fuelVehicle">
              {t("Kendaraan", "Vehicle")}
            </label>
            <select
              id="fuelVehicle"
              className="h-11 w-full rounded-xl border border-surface-border bg-white px-4 text-sm text-ink transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              value={newFuel.vehicleId}
              onChange={(e) => setNewFuel({ ...newFuel, vehicleId: e.target.value })}
              required
            >
              <option value="">{t("Pilih kendaraan", "Select vehicle")}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="fuelDate">
                {t("Tanggal", "Date")}
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
                {t("Jenis BBM", "Fuel Type")}
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
                {t("Jumlah (Liter)", "Amount (Liters)")}
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
                {t("Total Biaya (Rp)", "Total Cost (IDR)")}
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
              {t("SPBU / Lokasi", "Station / Location")}
            </label>
            <Input
              id="fuelStation"
              placeholder={t("Contoh: Pertamina Cikini", "Example: Pertamina Cikini")}
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
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsModalOpen(false);
                setEditingFuelId(null);
                setNewFuel(defaultFuelState);
              }}
              disabled={saving}
            >
              {t("Batal", "Cancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving
                ? editingFuelId
                  ? t("Menyimpan Perubahan...", "Saving Changes...")
                  : t("Menyimpan...", "Saving...")
                : editingFuelId
                ? t("Simpan Perubahan", "Save Changes")
                : t("Simpan", "Save")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
