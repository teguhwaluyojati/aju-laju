"use client";

import { useState, useEffect } from "react";
import ServiceCard from "../../../components/dashboard/ServiceCard";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { formatRupiah, formatServiceDate } from "../../../utils/formatter";
import { useAuth } from "../../../hooks/useAuth";
import { useT } from "../../../hooks/useT";
import {
  getServiceRecords,
  getVehicles,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
} from "../../../lib/firestore";
import type { ServiceRecord, ServiceRecordInput, Vehicle } from "../../../types";

type ServiceWithVehicle = ServiceRecord & { vehicleName: string };

export default function ServiceHistoryPage() {
  const { t, locale } = useT();
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceWithVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newService, setNewService] = useState({
    vehicleId: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    cost: 0,
    location: "",
    description: "",
    odometer: 0,
  });

  const defaultServiceState = {
    vehicleId: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    cost: 0,
    location: "",
    description: "",
    odometer: 0,
  };

  function mapServicesWithVehicle(serviceList: ServiceRecord[], vehicleList: Vehicle[]): ServiceWithVehicle[] {
    return serviceList.map((s) => ({
      ...s,
      vehicleName: vehicleList.find((v) => v.id === s.vehicleId)?.name || t("Kendaraan Dihapus", "Deleted Vehicle"),
    }));
  }

  async function refreshServices(userId: string, vehicleList: Vehicle[]) {
    const serviceList = await getServiceRecords(userId);
    setServices(mapServicesWithVehicle(serviceList, vehicleList));
  }

  function openAddModal() {
    setEditingServiceId(null);
    setNewService(defaultServiceState);
    setIsModalOpen(true);
  }

  function openEditModal(service: ServiceWithVehicle) {
    setEditingServiceId(service.id);
    setNewService({
      vehicleId: service.vehicleId,
      title: service.title,
      date: service.date,
      cost: service.cost,
      location: service.location,
      description: service.description || "",
      odometer: service.odometer || 0,
    });
    setIsModalOpen(true);
  }

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [serviceList, vehicleList] = await Promise.all([
          getServiceRecords(user.uid),
          getVehicles(user.uid),
        ]);

        setVehicles(vehicleList);
        setServices(mapServicesWithVehicle(serviceList, vehicleList));
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, t]);

  async function handleSaveService() {
    if (!user || !newService.vehicleId) return;
    setSaving(true);

    const payload: ServiceRecordInput = {
      vehicleId: newService.vehicleId,
      title: newService.title,
      date: newService.date,
      cost: newService.cost,
      location: newService.location,
      description: newService.description,
      odometer: newService.odometer,
    };

    try {
      if (editingServiceId) {
        await updateServiceRecord(editingServiceId, payload);
      } else {
        await createServiceRecord(user.uid, payload);
      }

      await refreshServices(user.uid, vehicles);

      setIsModalOpen(false);
      setEditingServiceId(null);
      setNewService(defaultServiceState);
    } catch (error) {
      console.error("Error saving service:", error);
      alert(
        editingServiceId
          ? t("Gagal memperbarui servis. Silakan coba lagi.", "Failed to update service record. Please try again.")
          : t("Gagal menambahkan servis. Silakan coba lagi.", "Failed to add service record. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteService(service: ServiceWithVehicle) {
    if (!user) return;

    const isConfirmed = window.confirm(
      t(
        `Hapus catatan servis \"${service.title}\"? Tindakan ini tidak bisa dibatalkan.`,
        `Delete service record \"${service.title}\"? This action cannot be undone.`
      )
    );
    if (!isConfirmed) return;

    setDeletingId(service.id);
    try {
      await deleteServiceRecord(service.id);
      await refreshServices(user.uid, vehicles);
    } catch (error) {
      console.error("Error deleting service:", error);
      alert(t("Gagal menghapus servis. Silakan coba lagi.", "Failed to delete service record. Please try again."));
    } finally {
      setDeletingId(null);
    }
  }

  const total = services.reduce((sum, item) => sum + item.cost, 0);
  const lastService = services[0];

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
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{t("Riwayat Servis", "Service History")}</h1>
          <p className="mt-1 text-sm text-ink-muted">{t("Daftar semua catatan servis kendaraan kamu.", "List of all your vehicle service records.")}</p>
        </div>
        <Button onClick={openAddModal} disabled={vehicles.length === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t("Tambah Servis", "Add Service")}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Total Servis", "Total Services")}</p>
          <p className="mt-2 font-display text-2xl text-ink">{services.length}x</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Total Pengeluaran", "Total Expense")}</p>
          <p className="mt-2 font-display text-2xl text-ink">{formatRupiah(total, locale)}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-ink-subtle">{t("Servis Terakhir", "Last Service")}</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {lastService ? formatServiceDate(lastService.date, locale) : "-"}
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-surface-border bg-white p-12 shadow-soft text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3-.6-.6Z" />
            </svg>
          </span>
          <h3 className="mt-4 font-semibold text-ink">{t("Belum ada catatan servis", "No service records yet")}</h3>
          <p className="mt-2 text-sm text-ink-muted">
            {vehicles.length === 0
              ? t("Tambahkan kendaraan terlebih dahulu sebelum mencatat servis.", "Add a vehicle before logging service records.")
              : t("Mulai catat servis kendaraanmu untuk melacak pengeluaran perawatan.", "Start logging services to track maintenance costs.")}
          </p>
          {vehicles.length > 0 && (
            <Button className="mt-6" onClick={openAddModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {t("Tambah Servis Pertama", "Add First Service")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              date={formatServiceDate(service.date, locale)}
              cost={formatRupiah(service.cost, locale)}
              vehicle={service.vehicleName}
              location={service.location}
              actions={
                <>
                  <button
                    type="button"
                    onClick={() => openEditModal(service)}
                    disabled={saving || deletingId === service.id}
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
                    onClick={() => handleDeleteService(service)}
                    disabled={saving || deletingId === service.id}
                    aria-label={deletingId === service.id ? t("Menghapus...", "Deleting...") : t("Hapus", "Delete")}
                    title={t("Hapus", "Delete")}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === service.id ? (
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
                </>
              }
            />
          ))}
        </div>
      )}

      <Modal
        open={isModalOpen}
        title={editingServiceId ? t("Edit Catatan Servis", "Edit Service Record") : t("Tambah Catatan Servis", "Add Service Record")}
        onClose={() => {
          setIsModalOpen(false);
          setEditingServiceId(null);
          setNewService(defaultServiceState);
        }}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveService();
          }}
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="serviceVehicle">
              {t("Kendaraan", "Vehicle")}
            </label>
            <select
              id="serviceVehicle"
              className="h-11 w-full rounded-xl border border-surface-border bg-white px-4 text-sm text-ink transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              value={newService.vehicleId}
              onChange={(e) => setNewService({ ...newService, vehicleId: e.target.value })}
              required
            >
              <option value="">{t("Pilih kendaraan", "Select vehicle")}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="serviceTitle">
              {t("Judul Servis", "Service Title")}
            </label>
            <Input
              id="serviceTitle"
              placeholder={t("Contoh: Ganti Oli Mesin", "Example: Engine Oil Change")}
              value={newService.title}
              onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="serviceDate">
                {t("Tanggal", "Date")}
              </label>
              <Input
                id="serviceDate"
                type="date"
                value={newService.date}
                onChange={(e) => setNewService({ ...newService, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="serviceCost">
                {t("Biaya (Rp)", "Cost (IDR)")}
              </label>
              <Input
                id="serviceCost"
                type="number"
                placeholder="150000"
                min={0}
                value={newService.cost || ""}
                onChange={(e) => setNewService({ ...newService, cost: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="serviceLocation">
              {t("Lokasi Bengkel", "Workshop Location")}
            </label>
            <Input
              id="serviceLocation"
              placeholder={t("Contoh: AHASS Menteng", "Example: AHASS Menteng")}
              value={newService.location}
              onChange={(e) => setNewService({ ...newService, location: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="serviceOdometer">
              Odometer (KM)
            </label>
            <Input
              id="serviceOdometer"
              type="number"
              placeholder={t("Contoh: 15000", "Example: 15000")}
              min={0}
              value={newService.odometer || ""}
              onChange={(e) => setNewService({ ...newService, odometer: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-ink-muted">{t("KM saat ini akan di-update dan menjadi dasar pengingat servis berikutnya", "Current KM will be updated and used for the next service reminder")}</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="serviceDescription">
              {t("Catatan (Opsional)", "Notes (Optional)")}
            </label>
            <textarea
              id="serviceDescription"
              className="w-full rounded-xl border border-surface-border bg-white px-4 py-3 text-sm text-ink transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              rows={3}
              placeholder={t("Detail tambahan...", "Additional details...")}
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsModalOpen(false);
                setEditingServiceId(null);
                setNewService(defaultServiceState);
              }}
              disabled={saving}
            >
              {t("Batal", "Cancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving
                ? editingServiceId
                  ? t("Menyimpan Perubahan...", "Saving Changes...")
                  : t("Menyimpan...", "Saving...")
                : editingServiceId
                ? t("Simpan Perubahan", "Save Changes")
                : t("Simpan", "Save")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
