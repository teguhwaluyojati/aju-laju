"use client";

import { useLocale } from "./useLocale";

export function useT() {
  const locale = useLocale();

  function t(id: string, en: string): string {
    return locale === "en" ? en : id;
  }

  return { t, locale };
}
