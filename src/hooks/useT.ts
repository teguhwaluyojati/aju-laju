"use client";

import { useCallback, useMemo } from "react";
import { useLocale } from "./useLocale";

export function useT() {
  const locale = useLocale();

  const t = useCallback(
    (id: string, en: string): string => {
      return locale === "en" ? en : id;
    },
    [locale]
  );

  return useMemo(
    () => ({ t, locale }),
    [t, locale]
  );
}
