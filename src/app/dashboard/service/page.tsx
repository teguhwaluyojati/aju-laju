"use client";

import { useState, useEffect } from "react";
import ServiceCard from "../../../components/dashboard/ServiceCard";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { formatRupiah, formatServiceDate } from "../../../utils/formatter";
import { useAuth } from "../../../hooks/useAuth";
import { getServiceRecords, getVehicles, createServiceRecord } from "../../../lib/firestore";
import type { ServiceRecord, Vehicle } from "../../../types";

type ServiceWithVehicle = ServiceRecord & { vehicleName: string };

export default function ServiceHistoryPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceWithVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    vehicleId: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    cost: 0,
    location: "",
    description: "",
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [serviceList, vehicleList] = await Promise.all([
          getServiceRecords(user.uid),
          getVehicles(user.uid),
        ]);
        
        setVehicles(vehicleList);
        setServices(
          serviceList.map((s) => ({
            ...s,
            vehicleName: vehicleList.find((v) => v.id === s.vehicleId)?.name || "Kendaraan Dihapus",
          }))
        );
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  async function handleAddService() {
    if (!user || !newService.vehicleId) return;
    setSaving(true);
    try {
      await createServiceRecord(user.uid, {
        vehicleId: newService.vehicleId,
        title: newService.title,
        date: newService.date,
        cost: newService.cost,
        location: newService.location,
        description: newService.description,
      });
      
      // Refresh list
      const serviceList = await getServiceRecords(user.uid);
      setServices(
        serviceList.map((s) => ({
          ...s,
          vehicleName: vehicles.find((v) => v.id === s.vehicleId)?.name || "Kendaraan Dihapus",
        }))
      );
      
      setIsModalOpen(false);
      setNewService({
        vehicleId: "",
        title: "",
        date: new Date().toISOString().split("T")[0],
        cost: 0,
        location: "",
        description: "",
      });
    } catch (error) {
      console.error("Error adding service:", error);
      alert("Gagal menambahkan servis. Silakan coba lagi.");
    } finally {
      setSaving(false);
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
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Riwayat Servis</h1>
          <p className="mt-1 text-sm text-ink-muted">Daftar semua catatan servis kendaraan kamu.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} disabled={vehicles.length === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah Servis
        </Button>
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
          <p className="mt-2 font-display text-2xl text-ink">
            {lastService ? formatServiceDate(lastService.date) : "-"}
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
          <h3 className="mt-4 font-semibold text-ink">Belum ada catatan servis</h3>
          <p className="mt-2 text-sm text-ink-muted">
            {vehicles.length === 0 
              ? "Tambahkan kendaraan terlebih dahulu sebelum mencatat servis."
              : "Mulai catat servis kendaraanmu untuk melacak pengeluaran perawatan."}
          </p>
          {vehicles.length > 0 && (
            <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Tambah Servis Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              date={service.date}
              cost={formatRupiah(service.cost)}
              vehicle={service.vehicleName}
              location={service.location}
            />
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      <Modal open={isModalOpen} title="Tambah Catatan Servis" onClose={() => setIsModalOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddService();
          }}
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="serviceVehicle">
              Kendaraan
            </label>
            <select
              id="serviceVehicle"
              className="h-11 w-full rounded-xl border border-surface-border bg-white px-4 text-sm text-ink transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              value={newService.vehicleId}
              onChange={(e) => setNewService({ ...newService, vehicleId: e.target.value })}
              required
            >
              <option value="">Pilih kendaraan</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="serviceTitle">
              Judul Servis
            </label>
            <Input
              id="serviceTitle"
              placeholder="Contoh: Ganti Oli Mesin"
              value={newService.title}
              onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="serviceDate">
                Tanggal
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
                Biaya (Rp)
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
              Lokasi Bengkel
            </label>
            <Input
              id="serviceLocation"
              placeholder="Contoh: AHASS Menteng"
              value={newService.location}
              onChange={(e) => setNewService({ ...newService, location: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="serviceDescription">
              Catatan (Opsional)
            </label>
            <textarea
              id="serviceDescription"
              className="w-full rounded-xl border border-surface-border bg-white px-4 py-3 text-sm text-ink transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              rows={3}
              placeholder="Detail tambahan..."
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
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
