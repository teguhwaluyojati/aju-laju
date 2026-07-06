"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const START_EVENT = "app:navigation-start";
const MIN_VISIBLE_MS = 320;
const FAILSAFE_HIDE_MS = 8000;

function isInternalNavigatingLink(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  const anchor = target.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href") ?? "";
  if (!href || href.startsWith("#")) return false;

  const destination = new URL(anchor.href, window.location.href);
  if (destination.origin !== window.location.origin) return false;

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const nextPath = `${destination.pathname}${destination.search}`;
  return currentPath !== nextPath;
}

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const startedAtRef = useRef<number>(0);
  const hideTimerRef = useRef<number | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    if (isLoadingRef.current) return;
    clearHideTimer();
    startedAtRef.current = Date.now();
    isLoadingRef.current = true;
    setIsLoading(true);

    hideTimerRef.current = window.setTimeout(() => {
      isLoadingRef.current = false;
      setIsLoading(false);
      hideTimerRef.current = null;
    }, FAILSAFE_HIDE_MS);
  }, [clearHideTimer]);

  const stopLoading = useCallback(() => {
    if (!isLoadingRef.current) return;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    clearHideTimer();

    hideTimerRef.current = window.setTimeout(() => {
      isLoadingRef.current = false;
      setIsLoading(false);
      hideTimerRef.current = null;
    }, remaining);
  }, [clearHideTimer]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (isInternalNavigatingLink(event.target)) {
        startLoading();
      }
    };

    const onPopState = () => startLoading();
    const onNavigationStart = () => startLoading();

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", onPopState);
    window.addEventListener(START_EVENT, onNavigationStart);

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener(START_EVENT, onNavigationStart);
      clearHideTimer();
    };
  }, [clearHideTimer, startLoading]);

  useEffect(() => {
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 top-0 z-[70] h-1 overflow-hidden bg-transparent"
    >
      <div
        className={`route-loader-bar h-full w-full origin-left bg-gradient-to-r from-brand-500 via-sky-500 to-brand-400 transition-opacity duration-200 ${
          isLoading ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
