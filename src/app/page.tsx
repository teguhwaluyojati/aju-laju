"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Logo from "../components/ui/Logo";
import { useAuth } from "../hooks/useAuth";
import { useT } from "../hooks/useT";

function localizePath(locale: "id" | "en", path: string): string {
  if (path === "/") {
    return `/${locale}`;
  }
  return `/${locale}${path}`;
}

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { t, locale } = useT();
  const [mounted, setMounted] = useState(false);

  const features = useMemo(
    () => [
      {
        title: t("Riwayat Servis Terpusat", "Centralized Service History"),
        description: t(
          "Simpan setiap catatan servis kendaraan: tanggal, biaya, dan bengkel dalam satu daftar rapi.",
          "Store every service record: date, cost, and workshop in one neat timeline."
        ),
        icon: <path d="M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
      },
      {
        title: t("Pantau Biaya Bensin", "Track Fuel Spending"),
        description: t(
          "Ketahui total pengeluaran bensin per bulan dan konsumsi kendaraan kamu dengan mudah.",
          "Understand monthly fuel spend and your vehicle consumption at a glance."
        ),
        icon: (
          <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
        ),
      },
      {
        title: t("Data Aman di Cloud", "Secure Cloud Data"),
        description: t(
          "Ditopang Firebase, catatan kamu tetap tersimpan aman dan bisa diakses dari mana saja.",
          "Powered by Firebase, your records stay secure and available from anywhere."
        ),
        icon: <path d="M7 18a5 5 0 1 1 1.5-9.8A6 6 0 0 1 20 12a4 4 0 0 1-2 7.4" />,
      },
    ],
    [t]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(localizePath(locale, "/dashboard"));
    }
  }, [loading, isAuthenticated, router, locale]);

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
            href={localizePath(locale, "/login")}
            className="hidden rounded-xl px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-slate-100 hover:text-ink sm:inline-flex"
          >
            {t("Login", "Sign In")}
          </Link>
          <Link
            href={localizePath(locale, "/register")}
            className="inline-flex items-center rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-soft"
          >
            {t("Daftar Gratis", "Get Started Free")}
          </Link>
        </nav>
      </header>

      <main className="container-app pb-24 pt-6">
        <section className="grid animate-fade-in items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {t("Kelola kendaraan lebih mudah", "Manage vehicles with ease")}
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              {t("Catatan servis & bensin,", "Service and fuel records,")}
              <span className="block text-brand-600">{t("di satu dashboard.", "in one dashboard.")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-ink-muted sm:text-lg">
              {t(
                "AjuLaju bantu kamu mencatat pengeluaran kendaraan dengan tampilan bersih, cepat, dan nyaman dilihat kapan saja.",
                "AjuLaju helps you track vehicle expenses in a clean, fast dashboard that is easy to read anytime."
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={localizePath(locale, "/register")}
                className="inline-flex h-11 items-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
              >
                {t("Mulai Sekarang", "Start Now")}
              </Link>
              <Link
                href={localizePath(locale, "/login")}
                className="inline-flex h-11 items-center rounded-xl border border-surface-border bg-white px-5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
              >
                {t("Saya sudah punya akun", "I already have an account")}
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-subtle">
              {t("Gratis untuk 1 kendaraan. Tanpa kartu kredit.", "Free for 1 vehicle. No credit card required.")}
            </p>
          </div>

          <div className="relative animate-rise">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-brand-100 via-white to-slate-100 blur-2xl" />
            <div className="rounded-3xl border border-surface-border bg-white/80 p-5 shadow-card backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-subtle">{t("Pengeluaran Bulan Ini", "This Month Spend")}</p>
                  <p className="mt-1 font-display text-3xl text-ink">Rp 1.240.000</p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">↓ 12% MoM</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-surface-border bg-surface-muted p-4">
                  <p className="text-xs text-ink-subtle">{t("Bensin", "Fuel")}</p>
                  <p className="mt-1 text-xl font-semibold text-ink">Rp 840rb</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
                    <div className="h-full w-3/4 rounded-full bg-brand-500" />
                  </div>
                </div>
                <div className="rounded-2xl border border-surface-border bg-surface-muted p-4">
                  <p className="text-xs text-ink-subtle">{t("Servis", "Service")}</p>
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
              <p className="mt-3 text-xs text-ink-subtle">{t("Grafik 7 hari terakhir", "Last 7 days chart")}</p>
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
          <p>
            © {new Date().getFullYear()} AjuLaju. {t("Seluruh hak cipta dilindungi.", "All rights reserved.")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
            <Link href={localizePath(locale, "/tentang")} className="transition hover:text-ink">
              {t("Tentang", "About")}
            </Link>
            <a href="mailto:teguhwaluyojati14@gmail.com" className="transition hover:text-ink">
              {t("Kontak Developer", "Contact Developer")}
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
