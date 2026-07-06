"use client";

import { usePathname, useRouter } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "../../i18n/config";

function switchLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = nextLocale;
    return `/${segments.join("/")}`;
  }

  if (pathname === "/") {
    return `/${nextLocale}`;
  }

  return `/${nextLocale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  const currentLocale: Locale = isLocale(firstSegment) ? firstSegment : defaultLocale;

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === currentLocale) return;
    const nextPath = switchLocaleInPath(pathname, nextLocale);
    router.push(nextPath);
  }

  return (
    <div className="fixed right-4 top-4 z-[70] rounded-full border border-surface-border bg-white/90 p-1 shadow-soft backdrop-blur">
      <div className="flex items-center gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => changeLocale("id")}
          className={`rounded-full px-3 py-1.5 transition ${
            currentLocale === "id"
              ? "bg-brand-600 text-white"
              : "text-ink-muted hover:bg-slate-100 hover:text-ink"
          }`}
          aria-pressed={currentLocale === "id"}
        >
          ID
        </button>
        <button
          type="button"
          onClick={() => changeLocale("en")}
          className={`rounded-full px-3 py-1.5 transition ${
            currentLocale === "en"
              ? "bg-brand-600 text-white"
              : "text-ink-muted hover:bg-slate-100 hover:text-ink"
          }`}
          aria-pressed={currentLocale === "en"}
        >
          EN
        </button>
      </div>
    </div>
  );
}
