"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo, useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import Logo from "../../components/ui/Logo";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";
import { useT } from "../../hooks/useT";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

function localizePath(locale: "id" | "en", path: string): string {
  if (path === "/") {
    return `/${locale}`;
  }
  return `/${locale}${path}`;
}

function localizeAboutPath(locale: "id" | "en"): string {
  return localizePath(locale, locale === "en" ? "/about" : "/tentang");
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useT();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, loading, isAuthenticated } = useAuth();

  const navItems: NavItem[] = useMemo(
    () => [
      {
        href: "/dashboard",
        label: t("Dashboard", "Dashboard"),
        icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />,
      },
      {
        href: "/dashboard/vehicles",
        label: t("Kendaraan", "Vehicles"),
        icon: (
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        ),
      },
      {
        href: "/dashboard/service",
        label: t("Riwayat Servis", "Service History"),
        icon: (
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3-.6-.6Z" />
        ),
      },
      {
        href: "/dashboard/fuel",
        label: t("Riwayat Bensin", "Fuel History"),
        icon: (
          <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
        ),
      },
      {
        href: "/dashboard/profile",
        label: t("Profil", "Profile"),
        icon: (
          <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </>
        ),
      },
    ],
    [t]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(localizePath(locale, "/"));
    }
  }, [loading, isAuthenticated, router, locale]);

  useEffect(() => {
    if (loading || !isAuthenticated || !user) return;

    const hasPasswordProvider = user.providerData.some(
      (provider) => provider.providerId === "password"
    );

    if (hasPasswordProvider && !user.emailVerified) {
      if (auth) {
        signOut(auth).catch(() => {
          // Ignore sign-out failures here; redirect still enforces access guard.
        });
      }
      router.replace(localizePath(locale, "/login"));
    }
  }, [loading, isAuthenticated, user, router, locale]);

  async function handleLogout() {
    if (!auth) {
      router.push(localizePath(locale, "/"));
      return;
    }
    try {
      await signOut(auth);
    } finally {
      router.push(localizePath(locale, "/"));
    }
  }

  function openLogoutModal() {
    setProfileDropdownOpen(false);
    setLogoutModalOpen(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
          <p className="mt-4 text-sm text-ink-muted">{t("Memuat...", "Loading...")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasPasswordProvider = user?.providerData?.some(
    (provider) => provider.providerId === "password"
  );
  if (hasPasswordProvider && !user?.emailVerified) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-surface-border bg-white/90 backdrop-blur transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href={localizePath(locale, "/")} onClick={() => setSidebarOpen(false)}>
            <Logo />
          </Link>
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label={t("Tutup menu", "Close menu")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const localizedHref = localizePath(locale, item.href);
            const isActive =
              pathname === localizedHref ||
              (item.href !== "/dashboard" && pathname.startsWith(localizedHref));
            return (
              <Link
                key={item.href}
                href={localizedHref}
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
            onClick={openLogoutModal}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-slate-100 hover:text-ink"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-ink-muted">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 12H4m0 0 4-4m-4 4 4 4M9 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9" />
              </svg>
            </span>
            {t("Keluar", "Sign out")}
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
            aria-label={t("Buka menu", "Open menu")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="hidden lg:block">
            <h1 className="font-display text-lg text-ink">{t("Dashboard", "Dashboard")}</h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
              >
                <span className="hidden text-sm text-ink-muted sm:inline">
                  {t("Halo", "Hi")}, {user?.displayName || user?.email?.split("@")[0] || t("Pengguna", "User")}
                </span>
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="h-9 w-9 rounded-full object-cover border border-surface-border"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                    {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`text-ink-muted transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-surface-border bg-white py-2 shadow-card animate-fade-in">
                  <div className="border-b border-surface-border px-4 pb-3 pt-1">
                    <p className="font-medium text-ink">{user?.displayName || t("Pengguna", "User")}</p>
                    <p className="text-xs text-ink-muted truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href={localizePath(locale, "/dashboard/profile")}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-muted transition hover:bg-slate-50 hover:text-ink"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                      </svg>
                      {t("Profil Saya", "My Profile")}
                    </Link>
                    <button
                      onClick={openLogoutModal}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 12H4m0 0 4-4m-4 4 4 4M9 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9" />
                      </svg>
                      {t("Keluar", "Sign out")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>

        <footer className="border-t border-surface-border bg-white/70 px-5 py-4 text-xs text-ink-subtle sm:px-8 sm:text-sm">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p>
              © {new Date().getFullYear()} AjuLaju. {t("Seluruh hak cipta dilindungi.", "All rights reserved.")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
              <Link href={localizeAboutPath(locale)} className="transition hover:text-ink">
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

      <Modal open={logoutModalOpen} title={t("Konfirmasi Keluar", "Confirm Sign Out")} onClose={() => setLogoutModalOpen(false)}>
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 12H4m0 0 4-4m-4 4 4 4M9 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9" />
            </svg>
          </span>
          <h3 className="mt-4 text-lg font-semibold text-ink">{t("Yakin ingin keluar?", "Are you sure you want to sign out?")}</h3>
          <p className="mt-2 text-sm text-ink-muted">
            {t(
              "Kamu akan keluar dari akun dan perlu login kembali untuk mengakses dashboard.",
              "You will be signed out and need to log in again to access the dashboard."
            )}
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setLogoutModalOpen(false)}
            >
              {t("Batal", "Cancel")}
            </Button>
            <button
              onClick={handleLogout}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              {t("Ya, Keluar", "Yes, Sign out")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
