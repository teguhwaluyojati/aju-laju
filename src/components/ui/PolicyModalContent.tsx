type PolicyModalContentProps = {
  locale: "id" | "en";
  type: "terms" | "privacy";
};

type PolicyPoint = {
  heading: string;
  body: string;
};

const termsId: PolicyPoint[] = [
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
];

const termsEn: PolicyPoint[] = [
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

const privacyId: PolicyPoint[] = [
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
    body: "Kebijakan privasi dapat diperbarui sewaktu-waktu. Tanggal pembaruan terbaru akan ditampilkan di bagian ini.",
  },
];

const privacyEn: PolicyPoint[] = [
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
    body: "This policy may be updated at any time. The latest update date will be shown in this section.",
  },
];

export default function PolicyModalContent({ locale, type }: PolicyModalContentProps) {
  const isId = locale === "id";
  const points =
    type === "terms"
      ? isId
        ? termsId
        : termsEn
      : isId
      ? privacyId
      : privacyEn;

  return (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
      {points.map((point, index) => (
        <section key={point.heading} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <h3 className="text-sm font-semibold text-ink">
            {index + 1}. {point.heading}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{point.body}</p>
        </section>
      ))}
    </div>
  );
}
