"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { defaultLocale, isLocale, type Locale } from "../i18n/config";

export function useLocale(): Locale {
  const pathname = usePathname();

  return useMemo(() => {
    const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
    if (isLocale(firstSegment)) {
      return firstSegment;
    }

    if (typeof document !== "undefined") {
      const htmlLang = document.documentElement.lang;
      if (isLocale(htmlLang)) {
        return htmlLang;
      }

      const cookieMatch = document.cookie
        .split(";")
        .map((item) => item.trim())
        .find((item) => item.startsWith("locale="));
      const cookieLocale = cookieMatch?.split("=")[1] ?? "";
      if (isLocale(cookieLocale)) {
        return cookieLocale;
      }
    }

    return defaultLocale;
  }, [pathname]);
}
