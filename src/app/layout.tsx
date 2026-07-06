import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Sans, Sora } from "next/font/google";
import { ReactNode } from "react";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import PageTransitionLoader from "../components/ui/PageTransitionLoader";
import { defaultLocale, isLocale } from "../i18n/config";

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "AjuLaju — Catatan Servis & Bensin Kendaraan",
  description:
    "Pantau riwayat servis dan pengeluaran bensin kendaraan kamu dalam satu dashboard yang rapi.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const requestHeaders = await headers();
  const requestLocale = requestHeaders.get("x-locale") ?? "";
  const locale = isLocale(requestLocale) ? requestLocale : defaultLocale;

  return (
    <html lang={locale} className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="font-sans antialiased">
        <PageTransitionLoader />
        <LanguageSwitcher />
        {children}
      </body>
    </html>
  );
}
