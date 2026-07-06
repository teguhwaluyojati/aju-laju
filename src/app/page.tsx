"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "../components/ui/Logo";
import { useAuth } from "../hooks/useAuth";

const features = [
  {
    title: "Riwayat Servis Terpusat",
    description:
      "Simpan setiap catatan servis kendaraan: tanggal, biaya, dan bengkel dalam satu daftar rapi.",
    icon: (
      <path d="M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    ),
  },
  {
    title: "Pantau Biaya Bensin",
    description:
      "Ketahui total pengeluaran bensin per bulan dan konsumsi kendaraan kamu dengan mudah.",
    icon: (
      <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
    ),
  },
  {
    title: "Data Aman di Cloud",
    description:
      "Ditopang Firebase, catatan kamu tetap tersimpan aman dan bisa diakses dari mana saja.",
    icon: (
      <path d="M7 18a5 5 0 1 1 1.5-9.8A6 6 0 0 1 20 12a4 4 0 0 1-2 7.4" />
    ),
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  // Show loading while checking auth
  if (!mounted || loading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="container-app flex items-center justify-between py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-slate-100 hover:text-ink sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-soft"
          >
            Daftar Gratis
          </Link>
        </nav>
      </header>

      <main className="container-app pb-24 pt-6">
        <section className="grid animate-fade-in items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Kelola kendaraan lebih mudah
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              Catatan servis & bensin,
              <span className="block text-brand-600">di satu dashboard.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-ink-muted sm:text-lg">
              AjuLaju bantu kamu mencatat pengeluaran kendaraan dengan tampilan bersih, cepat, dan
              nyaman dilihat kapan saja.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-11 items-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
              >
                Mulai Sekarang
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-xl border border-surface-border bg-white px-5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
              >
                Saya sudah punya akun
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-subtle">Gratis untuk 1 kendaraan. Tanpa kartu kredit.</p>
          </div>

          <div className="relative animate-rise">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-brand-100 via-white to-slate-100 blur-2xl" />
            <div className="rounded-3xl border border-surface-border bg-white/80 p-5 shadow-card backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-subtle">Pengeluaran Bulan Ini</p>
                  <p className="mt-1 font-display text-3xl text-ink">Rp 1.240.000</p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  ↓ 12% MoM
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-surface-border bg-surface-muted p-4">
                  <p className="text-xs text-ink-subtle">Bensin</p>
                  <p className="mt-1 text-xl font-semibold text-ink">Rp 840rb</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
                    <div className="h-full w-3/4 rounded-full bg-brand-500" />
                  </div>
                </div>
                <div className="rounded-2xl border border-surface-border bg-surface-muted p-4">
                  <p className="text-xs text-ink-subtle">Servis</p>
                  <p className="mt-1 text-xl font-semibold text-ink">Rp 400rb</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
                    <div className="h-full w-1/2 rounded-full bg-amber-400" />
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-end gap-2">
                {[40, 62, 28, 78, 55, 90, 47].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-brand-500/30 to-brand-500"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-subtle">Grafik 7 hari terakhir</p>
            </div>
          </div>
        </section>

        <section className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-rise rounded-2xl border border-surface-border bg-white/80 p-5 shadow-soft backdrop-blur"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {feature.icon}
                </svg>
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-surface-border bg-white/60 backdrop-blur">
        <div className="container-app flex flex-col items-center justify-between gap-4 py-6 text-sm text-ink-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} AjuLaju. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
            <Link href="/tentang" className="transition hover:text-ink">
              Tentang
            </Link>
            <a href="mailto:teguhwaluyojati14@gmail.com" className="transition hover:text-ink">
              Kontak Developer
            </a>
            <a href="https://teguhwaluyojati.github.io" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 transition hover:text-brand-800">
              TWJ Dev
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
