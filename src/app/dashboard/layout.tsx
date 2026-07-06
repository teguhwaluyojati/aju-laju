"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { signOut } from "firebase/auth";
import Logo from "../../components/ui/Logo";
import { auth } from "../../lib/firebase";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
    ),
  },
  {
    href: "/dashboard/vehicles",
    label: "Kendaraan",
    icon: (
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    ),
  },
  {
    href: "/dashboard/service",
    label: "Riwayat Servis",
    icon: (
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3-.6-.6Z" />
    ),
  },
  {
    href: "/dashboard/fuel",
    label: "Riwayat Bensin",
    icon: (
      <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
    ),
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    if (!auth) {
      router.push("/login");
      return;
    }
    try {
      await signOut(auth);
    } finally {
      router.push("/login");
    }
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-surface-border bg-white/90 backdrop-blur transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" onClick={() => setSidebarOpen(false)}>
            <Logo />
          </Link>
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-800"
                    : "text-ink-muted hover:bg-slate-100 hover:text-ink"
                }`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${
                    isActive ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-ink-muted"
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-3 bottom-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-slate-100 hover:text-ink"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-ink-muted">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 12H4m0 0 4-4m-4 4 4 4M9 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9" />
              </svg>
            </span>
            Keluar
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-surface-border bg-white/80 px-5 backdrop-blur sm:px-8">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="hidden lg:block">
            <h1 className="font-display text-lg text-ink">Dashboard</h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-ink-muted sm:inline">Halo, pengguna</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              A
            </span>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>

        <footer className="border-t border-surface-border bg-white/70 px-5 py-4 text-xs text-ink-subtle sm:px-8 sm:text-sm">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
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
    </div>
  );
}
