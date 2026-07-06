import Link from "next/link";
import { headers } from "next/headers";
import { defaultLocale, isLocale } from "../../i18n/config";

export default async function PrivacyPage() {
  const requestHeaders = await headers();
  const requestLocale = requestHeaders.get("x-locale") ?? "";
  const locale = isLocale(requestLocale) ? requestLocale : defaultLocale;
  const isId = locale === "id";

  const title = isId ? "Kebijakan Privasi" : "Privacy Policy";
  const subtitle = isId
    ? "Menjelaskan bagaimana AjuLaju mengumpulkan dan memproses data Anda."
    : "Explains how AjuLaju collects and processes your data.";

  const points = isId
    ? [
        {
          heading: "Data yang Dikumpulkan",
          body: "Kami dapat mengumpulkan data akun (nama, email) serta data kendaraan, servis, dan bahan bakar yang Anda input.",
        },
        {
          heading: "Tujuan Penggunaan Data",
          body: "Data digunakan untuk autentikasi, sinkronisasi catatan, analitik dasar, dan peningkatan fitur aplikasi.",
        },
        {
          heading: "Penyimpanan dan Keamanan",
          body: "Data disimpan pada infrastruktur cloud yang aman dengan pembatasan akses dan praktik keamanan yang wajar.",
        },
        {
          heading: "Berbagi Data",
          body: "Kami tidak menjual data pribadi Anda. Data hanya dibagikan jika diwajibkan hukum atau untuk operasional layanan inti.",
        },
        {
          heading: "Hak Pengguna",
          body: "Anda dapat meminta akses, koreksi, atau penghapusan data sesuai peraturan yang berlaku.",
        },
        {
          heading: "Retensi Data",
          body: "Data disimpan selama akun aktif atau selama diperlukan untuk memenuhi tujuan layanan dan kewajiban hukum.",
        },
        {
          heading: "Cookie dan Preferensi",
          body: "Kami menggunakan cookie untuk sesi login, preferensi bahasa, dan keamanan aplikasi.",
        },
        {
          heading: "Perubahan Kebijakan",
          body: "Kebijakan privasi dapat diperbarui sewaktu-waktu. Tanggal pembaruan terbaru akan ditampilkan di halaman ini.",
        },
      ]
    : [
        {
          heading: "Data We Collect",
          body: "We may collect account data (name, email) and vehicle, service, and fuel data that you provide.",
        },
        {
          heading: "How We Use Data",
          body: "Data is used for authentication, record synchronization, basic analytics, and product improvements.",
        },
        {
          heading: "Storage and Security",
          body: "Data is stored on secure cloud infrastructure with access controls and reasonable security practices.",
        },
        {
          heading: "Data Sharing",
          body: "We do not sell your personal data. Data is shared only when legally required or needed for core service operations.",
        },
        {
          heading: "Your Rights",
          body: "You may request access, correction, or deletion of your data in accordance with applicable regulations.",
        },
        {
          heading: "Data Retention",
          body: "Data is retained while your account is active or as needed to fulfill service purposes and legal obligations.",
        },
        {
          heading: "Cookies and Preferences",
          body: "We use cookies for login sessions, language preferences, and application security.",
        },
        {
          heading: "Policy Changes",
          body: "This policy may be updated at any time. The latest update date will be shown on this page.",
        },
      ];

  return (
    <main className="container-app py-12 sm:py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-surface-border bg-white/90 p-6 shadow-card backdrop-blur sm:p-10">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-ink-muted sm:text-base">{subtitle}</p>

        <ol className="mt-8 space-y-5">
          {points.map((point, index) => (
            <li key={point.heading} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <h2 className="text-base font-semibold text-ink sm:text-lg">
                {index + 1}. {point.heading}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base">{point.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
          <p className="text-xs text-ink-subtle sm:text-sm">
            {isId ? "Terakhir diperbarui: 7 Juli 2026" : "Last updated: July 7, 2026"}
          </p>
          <Link href={isId ? "/id/login" : "/en/login"} className="text-sm font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-800">
            {isId ? "Kembali ke Login" : "Back to Login"}
          </Link>
        </div>
      </div>
    </main>
  );
}
