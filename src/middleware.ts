import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, type Locale } from "./i18n/config";

const LOCALE_COOKIE = "locale";

function getLocalizedAboutPath(locale: Locale): "/about" | "/tentang" {
  return locale === "en" ? "/about" : "/tentang";
}

function getPreferredLocale(request: NextRequest): Locale {
  const cookieValue = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieValue && isLocale(cookieValue)) {
    return cookieValue;
  }

  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.toLowerCase().includes("en")) {
    return "en";
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0] || "";

  if (isLocale(maybeLocale)) {
    const strippedPath = `/${segments.slice(1).join("/")}`;

    if (strippedPath === "/about" || strippedPath === "/tentang") {
      const canonicalPath = getLocalizedAboutPath(maybeLocale);
      if (strippedPath !== canonicalPath) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/${maybeLocale}${canonicalPath}`;
        return NextResponse.redirect(redirectUrl);
      }
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = strippedPath === "/" ? "/" : strippedPath;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", maybeLocale);

    const response = NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    });

    response.cookies.set(LOCALE_COOKIE, maybeLocale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  }

  const locale = getPreferredLocale(request);

  if (pathname === "/about" || pathname === "/tentang") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}${getLocalizedAboutPath(locale)}`;
    return NextResponse.redirect(redirectUrl);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
