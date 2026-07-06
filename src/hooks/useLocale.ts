"use client";

import { usePathname } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "../i18n/config";

export function useLocale(): Locale {
  const pathname = usePathname();
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";

  if (isLocale(firstSegment)) {
    return firstSegment;
  }

  return defaultLocale;
}
