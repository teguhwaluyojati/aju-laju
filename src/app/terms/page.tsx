import Link from "next/link";
import { headers } from "next/headers";
import { defaultLocale, isLocale } from "../../i18n/config";

export default async function TermsPage() {
  const requestHeaders = await headers();
  const requestLocale = requestHeaders.get("x-locale") ?? "";
  const locale = isLocale(requestLocale) ? requestLocale : defaultLocale;
  const isId = locale === "id";

  const title = isId ? "Syarat & Ketentuan" : "Terms & Conditions";
  const subtitle = isId
    ? "Berlaku untuk penggunaan aplikasi AjuLaju."
    : "Applicable for the use of the AjuLaju application.";

  const points = isId
    ? [
        {
          heading: "Ruang Lingkup Layanan",
          body: "AjuLaju membantu pencatatan kendaraan, servis, dan pengeluaran bahan bakar dalam satu dashboard.",
        },
        {
          heading: "Akun Pengguna",
          body: "Anda bertanggung jawab atas keamanan akun dan keakuratan data yang Anda masukkan.",
        },
        {
          heading: "Penggunaan yang Dilarang",
          body: "Dilarang menyalahgunakan layanan, melakukan akses tidak sah, atau memasukkan data yang melanggar hukum.",
        },
        {
          heading: "Ketersediaan Layanan",
          body: "Layanan diupayakan selalu tersedia, namun dapat mengalami gangguan sementara atau pemeliharaan berkala.",
        },
        {
          heading: "Batas Tanggung Jawab",
          body: "AjuLaju tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan aplikasi.",
        },
        {
          heading: "Perubahan Syarat",
          body: "Kami dapat memperbarui syarat sewaktu-waktu. Versi terbaru berlaku sejak dipublikasikan.",
        },
        {
          heading: "Kontak",
          body: "Untuk pertanyaan terkait syarat penggunaan, hubungi tim AjuLaju melalui kanal dukungan resmi.",
        },
      ]
    : [
        {
          heading: "Service Scope",
          body: "AjuLaju helps you manage vehicle records, service history, and fuel expenses in one dashboard.",
        },
        {
          heading: "User Account",
          body: "You are responsible for your account security and the accuracy of the data you submit.",
        },
        {
          heading: "Prohibited Use",
          body: "You must not misuse the service, perform unauthorized access, or submit unlawful content.",
        },
        {
          heading: "Service Availability",
          body: "We strive to keep the service available, but temporary downtime and maintenance may occur.",
        },
        {
          heading: "Limitation of Liability",
          body: "AjuLaju is not liable for indirect losses arising from the use of the application.",
        },
        {
          heading: "Terms Changes",
          body: "We may update these terms at any time. The latest published version will apply.",
        },
        {
          heading: "Contact",
          body: "For questions regarding these terms, please contact AjuLaju support through official channels.",
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
