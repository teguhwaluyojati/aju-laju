"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import { useAuth } from "../../../../hooks/useAuth";
import { useT } from "../../../../hooks/useT";
import { getVehicle, getServiceRecords, getFuelRecords, updateVehicle, deleteVehicle } from "../../../../lib/firestore";
import { formatRupiah, formatServiceDate } from "../../../../utils/formatter";
import type { Vehicle, ServiceRecord, FuelRecord, VehicleInput } from "../../../../types";

export default function VehicleDetailPage() {
  const { t, locale } = useT();
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const vehicleId = params.id as string;
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [fuels, setFuels] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<VehicleInput>({
    name: "",
    plateNumber: "",
    type: "motorcycle",
    brand: "",
    year: new Date().getFullYear(),
    color: "",
    odometer: 0,
    serviceInterval: 5000,
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [vehicleData, serviceData, fuelData] = await Promise.all([
          getVehicle(vehicleId),
          getServiceRecords(user.uid, vehicleId),
          getFuelRecords(user.uid, vehicleId),
        ]);
        
        // Verify this vehicle belongs to the user
        if (vehicleData && vehicleData.userId === user.uid) {
          setVehicle(vehicleData);
          setServices(serviceData);
          setFuels(fuelData);
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, vehicleId]);

  function openEditModal() {
    if (!vehicle) return;
    setEditForm({
      name: vehicle.name,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      brand: vehicle.brand,
      year: vehicle.year,
      color: vehicle.color || "",
      odometer: vehicle.odometer || 0,
      serviceInterval: vehicle.serviceInterval || 5000,
    });
    setIsEditModalOpen(true);
  }

  async function handleEditVehicle() {
    if (!vehicle) return;
    setSaving(true);
    try {
      await updateVehicle(vehicle.id, editForm);
      setVehicle({ ...vehicle, ...editForm });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert(t("Gagal memperbarui kendaraan.", "Failed to update vehicle."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVehicle() {
    if (!vehicle) return;
    setSaving(true);
    try {
      await deleteVehicle(vehicle.id);
      router.push(`/${locale}/dashboard/vehicles`);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert(t("Gagal menghapus kendaraan.", "Failed to delete vehicle."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link
          href={`/${locale}/dashboard/vehicles`}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {t("Kembali ke Daftar Kendaraan", "Back to Vehicle List")}
        </Link>

        {/* Not Found State */}
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-ink-subtle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </span>
            <h2 className="mt-6 text-xl font-semibold text-ink">{t("Kendaraan tidak ditemukan", "Vehicle not found")}</h2>
            <p className="mt-2 text-sm text-ink-muted">
              {t("Kendaraan yang kamu cari tidak ada atau sudah dihapus.", "The vehicle you are looking for does not exist or has been deleted.")}
            </p>
            <Link href={`/${locale}/dashboard/vehicles`}>
              <Button className="mt-6" variant="secondary">
                {t("Kembali ke Daftar Kendaraan", "Back to Vehicle List")}
              </Button>
            </Link>
          </div>
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
        href={`/${locale}/dashboard/vehicles`}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        {t("Kembali ke Daftar Kendaraan", "Back to Vehicle List")}
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
          <div className="flex gap-2">
            <Button variant="secondary" onClick={openEditModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              {t("Edit", "Edit")}
            </Button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1.5">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              {t("Hapus", "Delete")}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 border-t border-surface-border pt-6 sm:grid-cols-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Odometer</p>
            <p className="mt-1 font-display text-xl text-ink">{vehicle.odometer.toLocaleString(locale === "en" ? "en-US" : "id-ID")} KM</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Total Servis", "Total Services")}</p>
            <p className="mt-1 font-display text-xl text-ink">{formatRupiah(totalServiceCost, locale)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Total Bensin", "Total Fuel")}</p>
            <p className="mt-1 font-display text-xl text-ink">{formatRupiah(totalFuelCost, locale)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Konsumsi BBM", "Fuel Consumption")}</p>
            <p className="mt-1 font-display text-xl text-ink">
              {vehicle.fuelConsumption ? `${vehicle.fuelConsumption} km/L` : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Servis Berikutnya", "Next Service")}</p>
            <p className="mt-1 font-display text-xl text-ink">
              {vehicle.serviceInterval && vehicle.lastServiceOdometer 
                ? `${(vehicle.lastServiceOdometer + vehicle.serviceInterval).toLocaleString(locale === "en" ? "en-US" : "id-ID")} KM`
                : "-"}
            </p>
          </div>
        </div>

        {vehicle.notes && (
          <div className="mt-6 rounded-xl bg-surface-muted p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{t("Catatan", "Notes")}</p>
            <p className="mt-1 text-sm text-ink-muted">{vehicle.notes}</p>
          </div>
        )}
      </div>

      {/* Tabs Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Service History */}
        <div className="rounded-2xl border border-surface-border bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <h3 className="font-display text-lg text-ink">{t("Riwayat Servis", "Service History")}</h3>
            <span className="text-xs text-ink-subtle">{services.length} {t("catatan", "records")}</span>
          </div>
          {services.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-ink-muted">{t("Belum ada catatan servis.", "No service records yet.")}</p>
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
                        {formatServiceDate(service.date, locale)} • {service.location}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-ink">{formatRupiah(service.cost, locale)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fuel History */}
        <div className="rounded-2xl border border-surface-border bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <h3 className="font-display text-lg text-ink">{t("Riwayat Bensin", "Fuel History")}</h3>
            <span className="text-xs text-ink-subtle">{fuels.length} {t("catatan", "records")}</span>
          </div>
          {fuels.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-ink-muted">{t("Belum ada catatan bensin.", "No fuel records yet.")}</p>
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
                        {formatServiceDate(fuel.date, locale)} • {fuel.liter} L • {fuel.odometer.toLocaleString(locale === "en" ? "en-US" : "id-ID")} KM
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-ink">{formatRupiah(fuel.cost, locale)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Edit Vehicle Modal */}
      <Modal open={isEditModalOpen} title={t("Edit Kendaraan", "Edit Vehicle")} onClose={() => setIsEditModalOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleEditVehicle();
          }}
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="editVehicleName">
              {t("Nama Kendaraan", "Vehicle Name")}
            </label>
            <Input
              id="editVehicleName"
              placeholder={t("Contoh: Vario Hitam", "Example: Black Vario")}
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="editVehiclePlate">
              {t("Plat Nomor", "Plate Number")}
            </label>
            <Input
              id="editVehiclePlate"
              placeholder={t("Contoh: B 1234 ABC", "Example: B 1234 ABC")}
              value={editForm.plateNumber}
              onChange={(e) => setEditForm({ ...editForm, plateNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink">{t("Tipe Kendaraan", "Vehicle Type")}</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditForm({ ...editForm, type: "motorcycle" })}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  editForm.type === "motorcycle"
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-border bg-white text-ink-muted hover:bg-surface-muted"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="17" r="2" />
                  <path d="M12 15V5l4 2v4" />
                  <circle cx="12" cy="5" r="1" />
                </svg>
                {t("Motor", "Motorcycle")}
              </button>
              <button
                type="button"
                onClick={() => setEditForm({ ...editForm, type: "car" })}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  editForm.type === "car"
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-border bg-white text-ink-muted hover:bg-surface-muted"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
                {t("Mobil", "Car")}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="editVehicleBrand">
              {t("Merek & Tipe", "Brand & Model")}
            </label>
            <Input
              id="editVehicleBrand"
              placeholder={t("Contoh: Honda Vario 160", "Example: Honda Vario 160")}
              value={editForm.brand}
              onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="editVehicleYear">
                {t("Tahun", "Year")}
              </label>
              <Input
                id="editVehicleYear"
                type="number"
                min={1990}
                max={new Date().getFullYear() + 1}
                value={editForm.year}
                onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="editVehicleOdometer">
                Odometer (KM)
              </label>
              <Input
                id="editVehicleOdometer"
                type="number"
                min={0}
                value={editForm.odometer}
                onChange={(e) => setEditForm({ ...editForm, odometer: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="editVehicleColor">
              {t("Warna", "Color")}
            </label>
            <Input
              id="editVehicleColor"
              placeholder={t("Contoh: Hitam", "Example: Black")}
              value={editForm.color}
              onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="editServiceInterval">
              {t("Pengingat Servis (per KM)", "Service Reminder (per KM)")}
            </label>
            <select
              id="editServiceInterval"
              className="w-full rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={editForm.serviceInterval || 0}
              onChange={(e) => setEditForm({ ...editForm, serviceInterval: parseInt(e.target.value) })}
            >
              <option value={0}>{t("Tidak ada pengingat", "No reminder")}</option>
              <option value={1000}>{t("Setiap 1.000 KM", "Every 1,000 KM")}</option>
              <option value={2000}>{t("Setiap 2.000 KM", "Every 2,000 KM")}</option>
              <option value={3000}>{t("Setiap 3.000 KM", "Every 3,000 KM")}</option>
              <option value={5000}>{t("Setiap 5.000 KM", "Every 5,000 KM")}</option>
              <option value={10000}>{t("Setiap 10.000 KM", "Every 10,000 KM")}</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsEditModalOpen(false)} disabled={saving}>
              {t("Batal", "Cancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? t("Menyimpan...", "Saving...") : t("Simpan Perubahan", "Save Changes")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} title={t("Hapus Kendaraan", "Delete Vehicle")} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </span>
          <h3 className="mt-4 text-lg font-semibold text-ink">
            {t("Hapus", "Delete")} {vehicle?.name}?
          </h3>
          <p className="mt-2 text-sm text-ink-muted">
            {t("Kendaraan ini akan dihapus secara permanen beserta semua catatan servis dan bensinnya. Aksi ini tidak dapat dibatalkan.", "This vehicle and all related service/fuel records will be permanently deleted. This action cannot be undone.")}
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={saving}
            >
              {t("Batal", "Cancel")}
            </Button>
            <button
              onClick={handleDeleteVehicle}
              disabled={saving}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? t("Menghapus...", "Deleting...") : t("Ya, Hapus", "Yes, Delete")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
