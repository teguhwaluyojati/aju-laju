"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "../../../../components/ui/Button";

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  
  // TODO: Fetch vehicle from Firestore based on vehicleId
  // For now, show not found since we don't have data yet

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
          <h2 className="mt-6 text-xl font-semibold text-ink">Kendaraan tidak ditemukan</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Kendaraan dengan ID &quot;{vehicleId}&quot; tidak ada dalam database.
          </p>
          <Link href="/dashboard/vehicles">
            <Button className="mt-6" variant="secondary">
              Kembali ke Daftar Kendaraan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
