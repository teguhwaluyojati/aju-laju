"use client";

import Link from "next/link";
import Logo from "../../components/ui/Logo";
import { useMemo } from "react";
import { useT } from "../../hooks/useT";

function localizePath(locale: "id" | "en", path: string): string {
  if (path === "/") {
    return `/${locale}`;
  }
  return `/${locale}${path}`;
}

export default function TentangPage() {
  const { t, locale } = useT();

  const techStack = useMemo(
    () => [
      { name: "Next.js 15", color: "bg-slate-900 text-white" },
      { name: "React 19", color: "bg-sky-500 text-white" },
      { name: "TypeScript", color: "bg-blue-600 text-white" },
      { name: "Tailwind CSS", color: "bg-cyan-500 text-white" },
      { name: "Firebase", color: "bg-amber-500 text-white" },
    ],
    []
  );

  const highlights = useMemo(
    () => [
      {
        title: t("Catat Lebih Mudah", "Faster Recording"),
        description: t(
          "Input data servis dan bensin dalam hitungan detik dengan form yang simpel.",
          "Add service and fuel records in seconds with simple forms."
        ),
        icon: <path d="M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
      },
      {
        title: t("Dashboard Visual", "Visual Dashboard"),
        description: t(
          "Lihat ringkasan pengeluaran dalam grafik yang enak dibaca setiap saat.",
          "See expense summaries in charts that are easy to read anytime."
        ),
        icon: <path d="M3 3v18h18M8 17V9m5 8v-5m5 5V6" />,
      },
      {
        title: t("Data Aman", "Secure Data"),
        description: t(
          "Tersimpan di cloud Firebase, bisa diakses dari device mana saja.",
          "Stored safely in Firebase cloud and accessible from any device."
        ),
        icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
      },
    ],
    [t]
  );

  return (
    <div className="min-h-screen">
      <header className="container-app flex items-center justify-between py-6">
        <Link href={localizePath(locale, "/")}>
          <Logo />
        </Link>
        <Link
          href={localizePath(locale, "/")}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-muted"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {t("Kembali", "Back")}
        </Link>
      </header>

      <main className="container-app pb-20 pt-6">
        <section className="mx-auto max-w-3xl animate-fade-in text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {t("Tentang Kami", "About Us")}
          </span>
          <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
            {t("Kenapa", "Why")} <span className="text-brand-600">AjuLaju</span>?
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-muted sm:text-lg">
            {t(
              "AjuLaju hadir untuk membantu pemilik kendaraan mencatat pengeluaran servis dan bensin secara digital — lebih rapi, cepat, dan bisa dipantau kapan saja.",
              "AjuLaju helps vehicle owners track service and fuel expenses digitally with a cleaner and faster workflow."
            )}
          </p>
        </section>

        <section className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          {highlights.map((item, index) => (
            <div
              key={item.title}
              className="animate-rise rounded-2xl border border-surface-border bg-white p-5 shadow-soft transition hover:shadow-card"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                </svg>
              </span>
              <h3 className="mt-4 font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-20 max-w-2xl text-center">
          <h2 className="font-display text-2xl text-ink">{t("Dibangun dengan Teknologi Modern", "Built with Modern Technology")}</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {t("Performa cepat, UI responsif, dan pengalaman pengguna yang lancar.", "Fast performance, responsive UI, and smooth user experience.")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {techStack.map((tech) => (
              <span
                key={tech.name}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-soft ${tech.color}`}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-xl">
          <div className="rounded-2xl border border-surface-border bg-gradient-to-br from-white to-surface-muted p-6 text-center shadow-card sm:p-8">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-2xl font-bold text-white shadow-soft">
              T
            </span>
            <h3 className="mt-4 font-display text-xl text-ink">Teguh Waluyojati</h3>
            <p className="mt-1 text-sm text-ink-muted">Developer & Creator</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              {t(
                "Fullstack developer yang passionate membangun produk digital bermanfaat. AjuLaju adalah salah satu project pribadi untuk membantu pencatatan kendaraan sehari-hari.",
                "A fullstack developer passionate about building useful digital products. AjuLaju is a personal project to make daily vehicle record keeping easier."
              )}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:teguhwaluyojati14@gmail.com"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-surface-border bg-white px-4 text-sm font-medium text-ink transition hover:bg-surface-muted"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 5L2 7" />
                </svg>
                Email
              </a>
              <a
                href="https://teguhwaluyojati.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10" />
                </svg>
                TWJ Dev
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-surface-border bg-white/60 backdrop-blur">
        <div className="container-app flex flex-col items-center justify-between gap-4 py-6 text-sm text-ink-subtle sm:flex-row">
          <p>
            © {new Date().getFullYear()} AjuLaju. {t("Seluruh hak cipta dilindungi.", "All rights reserved.")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
            <Link href={localizePath(locale, "/")} className="transition hover:text-ink">
              {t("Beranda", "Home")}
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
