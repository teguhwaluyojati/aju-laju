import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { ReactNode } from "react";

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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
