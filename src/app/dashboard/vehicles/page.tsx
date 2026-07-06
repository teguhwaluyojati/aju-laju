"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { useAuth } from "../../../hooks/useAuth";
import { useT } from "../../../hooks/useT";
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getServiceRecords, getFuelRecords } from "../../../lib/firestore";
import type { Vehicle, VehicleInput } from "../../../types";

type VehicleWithStats = Vehicle & {
  totalService: number;
  totalFuel: number;
};

export default function VehiclesPage() {
  const { t, locale } = useT();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithStats | null>(null);
  const [editVehicle, setEditVehicle] = useState<VehicleInput & { id: string }>({
    id: "",
    name: "",
    plateNumber: "",
    type: "motorcycle",
    brand: "",
    year: new Date().getFullYear(),
    color: "",
    odometer: 0,
    serviceInterval: 5000,
  });
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    plateNumber: "",
    type: "motorcycle" as "car" | "motorcycle",
    brand: "",
    year: new Date().getFullYear(),
    color: "",
    odometer: 0,
    serviceInterval: 5000,
  });

  useEffect(() => {
    async function fetchVehicles() {
      if (!user) return;
      try {
        const [vehicleList, services, fuels] = await Promise.all([
          getVehicles(user.uid),
          getServiceRecords(user.uid),
          getFuelRecords(user.uid),
        ]);
        
        // Add stats to each vehicle
        const vehiclesWithStats = vehicleList.map((v) => ({
          ...v,
          totalService: services.filter((s) => s.vehicleId === v.id).length,
          totalFuel: fuels.filter((f) => f.vehicleId === v.id).length,
        }));
        
        setVehicles(vehiclesWithStats);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, [user]);

  async function handleAddVehicle() {
    if (!user) return;
    setSaving(true);
    try {
      await createVehicle(user.uid, {
        name: newVehicle.name,
        plateNumber: newVehicle.plateNumber,
        type: newVehicle.type,
        brand: newVehicle.brand,
        year: newVehicle.year,
        color: newVehicle.color || t("Tidak disebutkan", "Not specified"),
        odometer: newVehicle.odometer,
        serviceInterval: newVehicle.serviceInterval,
      });
      
      // Refresh list
      const vehicleList = await getVehicles(user.uid);
      setVehicles(vehicleList.map((v) => ({ ...v, totalService: 0, totalFuel: 0 })));
      
      setIsModalOpen(false);
      setNewVehicle({
        name: "",
        plateNumber: "",
        type: "motorcycle",
        brand: "",
        year: new Date().getFullYear(),
        color: "",
        odometer: 0,
        serviceInterval: 5000,
      });
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert(t("Gagal menambahkan kendaraan. Silakan coba lagi.", "Failed to add vehicle. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(vehicle: VehicleWithStats, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditVehicle({
      id: vehicle.id,
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

  function openDeleteModal(vehicle: VehicleWithStats, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVehicle(vehicle);
    setIsDeleteModalOpen(true);
  }

  async function handleEditVehicle() {
    if (!user || !editVehicle.id) return;
    setSaving(true);
    try {
      await updateVehicle(editVehicle.id, {
        name: editVehicle.name,
        plateNumber: editVehicle.plateNumber,
        type: editVehicle.type,
        brand: editVehicle.brand,
        year: editVehicle.year,
        color: editVehicle.color || t("Tidak disebutkan", "Not specified"),
        odometer: editVehicle.odometer,
        serviceInterval: editVehicle.serviceInterval,
      });
      
      // Refresh list
      const [vehicleList, services, fuels] = await Promise.all([
        getVehicles(user.uid),
        getServiceRecords(user.uid),
        getFuelRecords(user.uid),
      ]);
      const vehiclesWithStats = vehicleList.map((v) => ({
        ...v,
        totalService: services.filter((s) => s.vehicleId === v.id).length,
        totalFuel: fuels.filter((f) => f.vehicleId === v.id).length,
      }));
      setVehicles(vehiclesWithStats);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert(t("Gagal memperbarui kendaraan. Silakan coba lagi.", "Failed to update vehicle. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVehicle() {
    if (!user || !selectedVehicle) return;
    setSaving(true);
    try {
      await deleteVehicle(selectedVehicle.id);
      
      // Refresh list
      setVehicles(vehicles.filter((v) => v.id !== selectedVehicle.id));
      setIsDeleteModalOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert(t("Gagal menghapus kendaraan. Silakan coba lagi.", "Failed to delete vehicle. Please try again."));
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{t("Kendaraan Saya", "My Vehicles")}</h1>
          <p className="mt-1 text-sm text-ink-muted">{t("Kelola semua kendaraan yang kamu miliki.", "Manage all your vehicles.")}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t("Tambah Kendaraan", "Add Vehicle")}
        </Button>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-border bg-white p-12 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-ink-muted">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </span>
          <h3 className="mt-4 font-semibold text-ink">{t("Belum ada kendaraan", "No vehicles yet")}</h3>
          <p className="mt-1 text-sm text-ink-muted">{t("Tambahkan kendaraan pertamamu untuk mulai mencatat.", "Add your first vehicle to start tracking.")}</p>
          <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
            {t("Tambah Kendaraan", "Add Vehicle")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="group relative rounded-2xl border border-surface-border bg-white p-5 shadow-soft transition hover:shadow-card"
            >
              {/* Action Buttons */}
              <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={(e) => openEditModal(vehicle, e)}
                  className="rounded-lg p-2 text-ink-muted transition hover:bg-slate-100 hover:text-brand-600"
                  title="Edit"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => openDeleteModal(vehicle, e)}
                  className="rounded-lg p-2 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                  title="Hapus"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>

              <Link href={`/${locale}/dashboard/vehicles/${vehicle.id}`} className="block">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-xl ${
                    vehicle.type === "car"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {vehicle.type === "car" ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
                      <circle cx="7" cy="17" r="2" />
                      <circle cx="17" cy="17" r="2" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="17" r="2" />
                      <path d="M12 15V5l4 2v4" />
                      <circle cx="12" cy="5" r="1" />
                    </svg>
                  )}
                </span>

                <h3 className="mt-4 font-semibold text-ink group-hover:text-brand-700">{vehicle.name}</h3>
                <p className="text-sm text-ink-muted">{vehicle.brand}</p>
                <p className="mt-1 text-xs text-ink-subtle">{vehicle.plateNumber} • {vehicle.year}</p>

                <div className="mt-4 flex gap-4 border-t border-surface-border pt-4 text-xs text-ink-muted">
                  <span>{vehicle.totalService} {t("servis", "services")}</span>
                  <span>{vehicle.totalFuel} {t("isi bensin", "fuel fills")}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal open={isModalOpen} title={t("Tambah Kendaraan Baru", "Add New Vehicle")} onClose={() => setIsModalOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddVehicle();
          }}
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="vehicleName">
              {t("Nama Kendaraan", "Vehicle Name")}
            </label>
            <Input
              id="vehicleName"
              placeholder={t("Contoh: Vario Hitam", "Example: Black Vario")}
              value={newVehicle.name}
              onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="vehiclePlate">
              {t("Plat Nomor", "Plate Number")}
            </label>
            <Input
              id="vehiclePlate"
              placeholder={t("Contoh: B 1234 ABC", "Example: B 1234 ABC")}
              value={newVehicle.plateNumber}
              onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink">{t("Tipe Kendaraan", "Vehicle Type")}</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setNewVehicle({ ...newVehicle, type: "motorcycle" })}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  newVehicle.type === "motorcycle"
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
                onClick={() => setNewVehicle({ ...newVehicle, type: "car" })}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  newVehicle.type === "car"
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
            <label className="block text-sm font-medium text-ink" htmlFor="vehicleBrand">
              {t("Merek & Tipe", "Brand & Model")}
            </label>
            <Input
              id="vehicleBrand"
              placeholder={t("Contoh: Honda Vario 160", "Example: Honda Vario 160")}
              value={newVehicle.brand}
              onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="vehicleYear">
              {t("Tahun", "Year")}
            </label>
            <Input
              id="vehicleYear"
              type="number"
              placeholder="2023"
              min={1990}
              max={new Date().getFullYear() + 1}
              value={newVehicle.year}
              onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="serviceInterval">
              {t("Pengingat Servis (per KM)", "Service Reminder (per KM)")}
            </label>
            <select
              id="serviceInterval"
              className="w-full rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={newVehicle.serviceInterval}
              onChange={(e) => setNewVehicle({ ...newVehicle, serviceInterval: parseInt(e.target.value) })}
            >
              <option value={0}>{t("Tidak ada pengingat", "No reminder")}</option>
              <option value={1000}>{t("Setiap 1.000 KM", "Every 1,000 KM")}</option>
              <option value={2000}>{t("Setiap 2.000 KM", "Every 2,000 KM")}</option>
              <option value={3000}>{t("Setiap 3.000 KM", "Every 3,000 KM")}</option>
              <option value={5000}>{t("Setiap 5.000 KM", "Every 5,000 KM")}</option>
              <option value={10000}>{t("Setiap 10.000 KM", "Every 10,000 KM")}</option>
            </select>
            <p className="text-xs text-ink-muted">{t("Notifikasi akan muncul saat 500 KM sebelum waktunya servis", "A notification appears when 500 KM remains before service")}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)} disabled={saving}>
              {t("Batal", "Cancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? t("Menyimpan...", "Saving...") : t("Simpan", "Save")}
            </Button>
          </div>
        </form>
      </Modal>

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
              value={editVehicle.name}
              onChange={(e) => setEditVehicle({ ...editVehicle, name: e.target.value })}
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
              value={editVehicle.plateNumber}
              onChange={(e) => setEditVehicle({ ...editVehicle, plateNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink">{t("Tipe Kendaraan", "Vehicle Type")}</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditVehicle({ ...editVehicle, type: "motorcycle" })}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  editVehicle.type === "motorcycle"
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
                onClick={() => setEditVehicle({ ...editVehicle, type: "car" })}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  editVehicle.type === "car"
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
              value={editVehicle.brand}
              onChange={(e) => setEditVehicle({ ...editVehicle, brand: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="editVehicleYear">
                {t("Tahun", "Year")}
            </label>
            <Input
              id="editVehicleYear"
              type="number"
              placeholder="2023"
              min={1990}
              max={new Date().getFullYear() + 1}
              value={editVehicle.year}
              onChange={(e) => setEditVehicle({ ...editVehicle, year: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="editServiceInterval">
              {t("Pengingat Servis (per KM)", "Service Reminder (per KM)")}
            </label>
            <select
              id="editServiceInterval"
              className="w-full rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={editVehicle.serviceInterval || 0}
              onChange={(e) => setEditVehicle({ ...editVehicle, serviceInterval: parseInt(e.target.value) })}
            >
              <option value={0}>{t("Tidak ada pengingat", "No reminder")}</option>
              <option value={1000}>{t("Setiap 1.000 KM", "Every 1,000 KM")}</option>
              <option value={2000}>{t("Setiap 2.000 KM", "Every 2,000 KM")}</option>
              <option value={3000}>{t("Setiap 3.000 KM", "Every 3,000 KM")}</option>
              <option value={5000}>{t("Setiap 5.000 KM", "Every 5,000 KM")}</option>
              <option value={10000}>{t("Setiap 10.000 KM", "Every 10,000 KM")}</option>
            </select>
            <p className="text-xs text-ink-muted">{t("Notifikasi akan muncul saat 500 KM sebelum waktunya servis", "A notification appears when 500 KM remains before service")}</p>
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
            {t("Hapus", "Delete")} {selectedVehicle?.name}?
          </h3>
          <p className="mt-2 text-sm text-ink-muted">
            {t("Kendaraan ini akan dihapus secara permanen. Aksi ini tidak dapat dibatalkan.", "This vehicle will be permanently deleted. This action cannot be undone.")}
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
