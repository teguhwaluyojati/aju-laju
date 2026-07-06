"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";

type Vehicle = {
  id: string;
  name: string;
  plateNumber: string;
  type: "car" | "motorcycle";
  brand: string;
  year: number;
  totalService: number;
  totalFuel: number;
};

export default function VehiclesPage() {
  const [vehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    plateNumber: "",
    type: "motorcycle" as "car" | "motorcycle",
    brand: "",
    year: new Date().getFullYear(),
  });

  function handleAddVehicle() {
    // TODO: Simpan ke Firestore
    console.log("Adding vehicle:", newVehicle);
    setIsModalOpen(false);
    setNewVehicle({
      name: "",
      plateNumber: "",
      type: "motorcycle",
      brand: "",
      year: new Date().getFullYear(),
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Kendaraan Saya</h1>
          <p className="mt-1 text-sm text-ink-muted">Kelola semua kendaraan yang kamu miliki.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah Kendaraan
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
          <h3 className="mt-4 font-semibold text-ink">Belum ada kendaraan</h3>
          <p className="mt-1 text-sm text-ink-muted">Tambahkan kendaraan pertamamu untuk mulai mencatat.</p>
          <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
            Tambah Kendaraan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/dashboard/vehicles/${vehicle.id}`}
              className="group rounded-2xl border border-surface-border bg-white p-5 shadow-soft transition hover:shadow-card"
            >
              <div className="flex items-start justify-between">
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-ink-subtle transition group-hover:translate-x-1 group-hover:text-brand-600"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>

              <h3 className="mt-4 font-semibold text-ink group-hover:text-brand-700">{vehicle.name}</h3>
              <p className="text-sm text-ink-muted">{vehicle.brand}</p>
              <p className="mt-1 text-xs text-ink-subtle">{vehicle.plateNumber} • {vehicle.year}</p>

              <div className="mt-4 flex gap-4 border-t border-surface-border pt-4 text-xs text-ink-muted">
                <span>{vehicle.totalService} servis</span>
                <span>{vehicle.totalFuel} isi bensin</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal open={isModalOpen} title="Tambah Kendaraan Baru" onClose={() => setIsModalOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddVehicle();
          }}
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="vehicleName">
              Nama Kendaraan
            </label>
            <Input
              id="vehicleName"
              placeholder="Contoh: Vario Hitam"
              value={newVehicle.name}
              onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="vehiclePlate">
              Plat Nomor
            </label>
            <Input
              id="vehiclePlate"
              placeholder="Contoh: B 1234 ABC"
              value={newVehicle.plateNumber}
              onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink">Tipe Kendaraan</label>
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
                Motor
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
                Mobil
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="vehicleBrand">
              Merek & Tipe
            </label>
            <Input
              id="vehicleBrand"
              placeholder="Contoh: Honda Vario 160"
              value={newVehicle.brand}
              onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink" htmlFor="vehicleYear">
              Tahun
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

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
