import nodemailer from "nodemailer";
import { getAdminDb } from "./firebaseAdmin";

type MailTransport = {
  sendMail(params: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<unknown>;
};

type AppLocale = "id" | "en";

type UserProfileDoc = {
  uid: string;
  email: string;
  displayName?: string;
  locale?: AppLocale;
};

type VehicleDoc = {
  id: string;
  userId: string;
  name: string;
  odometer?: number;
  serviceInterval?: number;
  lastServiceOdometer?: number;
  fuelConsumption?: number;
};

type ServiceDoc = {
  userId: string;
  vehicleId?: string;
  date?: string;
  cost?: number;
  odometer?: number;
  intervalKm?: number;
};

type FuelDoc = {
  userId: string;
  vehicleId: string;
  date?: string;
  liter?: number;
  cost?: number;
  odometer?: number;
};

type VehicleSummary = {
  name: string;
  kmRemaining: number | null;
  fuelConsumption: number | null;
  latestFuelCost: number;
  urgency: "ok" | "soon" | "overdue";
};

type UserSummary = {
  user: UserProfileDoc;
  locale: AppLocale;
  totalFuelMonth: number;
  totalServiceMonth: number;
  totalFuelToday: number;
  totalServiceToday: number;
  vehicleSummaries: VehicleSummary[];
};

export type DailySummaryResult = {
  dryRun: boolean;
  processedUsers: number;
  sentEmails: number;
  simulatedEmails: number;
  failedEmails: number;
  skippedUsers: number;
  failures: Array<{ email: string; reason: string }>;
};

export type DailySummaryOptions = {
  dryRun?: boolean;
  maxUsers?: number;
};

async function sendWithSmtp(params: {
  transporter: MailTransport;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  await params.transporter.sendMail({
    from: params.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}

function createSmtpTransport() {
  const host = process.env.SMTP_HOST || "";
  const user = process.env.SMTP_USER || "";
  const password = process.env.SMTP_PASSWORD || "";
  const rawPort = Number(process.env.SMTP_PORT || "587");
  const secure = (process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  if (!host) {
    throw new Error("SMTP_HOST is missing");
  }

  if (!Number.isFinite(rawPort) || rawPort <= 0) {
    throw new Error("SMTP_PORT must be a valid positive number");
  }

  if (!user) {
    throw new Error("SMTP_USER is missing");
  }

  if (!password) {
    throw new Error("SMTP_PASSWORD is missing");
  }

  return nodemailer.createTransport({
    host,
    port: rawPort,
    secure,
    auth: {
      user,
      pass: password,
    },
  });
}

function toAppLocale(value: string | undefined): AppLocale {
  return value === "en" ? "en" : "id";
}

function formatCurrency(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID").format(value || 0);
}

function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseDateSafe(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed;
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function deriveFuelConsumption(vehicle: VehicleDoc, fuelRows: FuelDoc[]): number | null {
  if (vehicle.fuelConsumption && vehicle.fuelConsumption > 0) {
    return vehicle.fuelConsumption;
  }

  const ordered = fuelRows
    .filter((f) => Number.isFinite(f.odometer) && Number.isFinite(f.liter) && (f.liter || 0) > 0)
    .sort((a, b) => (b.odometer || 0) - (a.odometer || 0));

  if (ordered.length < 2) return null;

  const latest = ordered[0];
  const previous = ordered[1];
  const distance = (latest.odometer || 0) - (previous.odometer || 0);
  const liters = latest.liter || 0;

  if (distance <= 0 || liters <= 0) return null;
  return Math.round((distance / liters) * 10) / 10;
}

function buildVehicleSummary(vehicle: VehicleDoc, fuelRows: FuelDoc[], serviceRows: ServiceDoc[] = []): VehicleSummary {
  const latestService = [...serviceRows]
    .filter((row) => row.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())[0];

  const serviceInterval =
    typeof latestService?.intervalKm === "number" && latestService.intervalKm > 0
      ? latestService.intervalKm
      : vehicle.serviceInterval || 0;

  const odometer = vehicle.odometer || 0;
  const lastService =
    typeof latestService?.odometer === "number" && latestService.odometer > 0
      ? latestService.odometer
      : vehicle.lastServiceOdometer || 0;

  let kmRemaining: number | null = null;
  if (serviceInterval > 0 && lastService > 0) {
    kmRemaining = lastService + serviceInterval - odometer;
  }

  let urgency: VehicleSummary["urgency"] = "ok";
  if (kmRemaining !== null && kmRemaining <= 0) {
    urgency = "overdue";
  } else if (kmRemaining !== null && kmRemaining <= 500) {
    urgency = "soon";
  }

  const sortedFuel = [...fuelRows].sort((a, b) => {
    const ad = parseDateSafe(a.date)?.getTime() || 0;
    const bd = parseDateSafe(b.date)?.getTime() || 0;
    return bd - ad;
  });

  return {
    name: vehicle.name,
    kmRemaining,
    fuelConsumption: deriveFuelConsumption(vehicle, fuelRows),
    latestFuelCost: sortedFuel[0]?.cost || 0,
    urgency,
  };
}

function t(locale: AppLocale, idText: string, enText: string): string {
  return locale === "en" ? enText : idText;
}

function createEmailSubject(summary: UserSummary): string {
  const name = summary.user.displayName || summary.user.email.split("@")[0] || "there";
  return t(
    summary.locale,
    `Ringkasan Harian AjuLaju untuk ${name}`,
    `Your AjuLaju Daily Summary, ${name}`
  );
}

function renderVehicleRows(summary: UserSummary): string {
  const locale = summary.locale;

  if (summary.vehicleSummaries.length === 0) {
    return `
      <tr>
        <td style="padding:14px 0;color:#64748b;font-size:14px;">
          ${t(locale, "Belum ada data kendaraan.", "No vehicle data yet.")}
        </td>
      </tr>
    `;
  }

  return summary.vehicleSummaries
    .map((vehicle) => {
      const kmLabel =
        vehicle.kmRemaining === null
          ? t(locale, "Interval servis belum diatur", "Service interval is not set")
          : vehicle.kmRemaining <= 0
          ? `${t(locale, "Lewat", "Overdue")} ${formatNumber(Math.abs(vehicle.kmRemaining), locale)} KM`
          : `${formatNumber(vehicle.kmRemaining, locale)} KM ${t(locale, "lagi", "left")}`;

      const badgeColor =
        vehicle.urgency === "overdue"
          ? "#ef4444"
          : vehicle.urgency === "soon"
          ? "#d97706"
          : "#059669";

      const consumption =
        vehicle.fuelConsumption === null
          ? "-"
          : `${formatNumber(vehicle.fuelConsumption, locale)} km/L`;

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
            <div style="font-weight:700;color:#0b1220;font-size:14px;">${vehicle.name}</div>
            <div style="margin-top:5px;color:#475569;font-size:13px;">${t(locale, "Sisa servis", "Service left")}: <span style="color:${badgeColor};font-weight:700;">${kmLabel}</span></div>
            <div style="margin-top:4px;color:#475569;font-size:13px;">${t(locale, "Konsumsi", "Consumption")}: <strong>${consumption}</strong></div>
            <div style="margin-top:4px;color:#475569;font-size:13px;">${t(locale, "Bensin terakhir", "Latest fuel")}: <strong>${formatCurrency(vehicle.latestFuelCost, locale)}</strong></div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderHtmlEmail(summary: UserSummary): string {
  const locale = summary.locale;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://twjdev-aju-laju.vercel.app").replace(/\/$/, "");
  const dashboardUrl = `${appUrl}/${locale}/dashboard`;
  const dateNow = new Date().toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const card = (title: string, value: string, subtitle: string, accent: string) => `
    <td style="padding:8px;vertical-align:top;">
      <div style="border:1px solid #e2e8f0;border-radius:14px;padding:14px;background:#ffffff;">
        <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">${title}</div>
        <div style="margin-top:8px;font-size:20px;font-weight:800;color:${accent};">${value}</div>
        <div style="margin-top:6px;font-size:12px;color:#64748b;">${subtitle}</div>
      </div>
    </td>
  `;

  return `
  <!doctype html>
  <html>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0b1220;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
              <tr>
                <td style="padding:24px;background:linear-gradient(135deg,#0f172a,#047857);">
                  <div style="font-size:13px;font-weight:700;color:#a7f3d0;letter-spacing:.06em;text-transform:uppercase;">AjuLaju Daily</div>
                  <h1 style="margin:10px 0 0 0;color:#ffffff;font-size:24px;line-height:1.25;">
                    ${t(locale, "Ringkasan Kendaraan Harian", "Your Daily Vehicle Summary")}
                  </h1>
                  <p style="margin:8px 0 0 0;color:#d1fae5;font-size:14px;">${dateNow}</p>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 20px 4px;">
                  <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
                    ${t(locale, "Halo", "Hello")}
                    <strong>${summary.user.displayName || summary.user.email.split("@")[0]}</strong>,
                    ${t(
                      locale,
                      "ini update harian kendaraanmu. Semoga bantu kamu ambil keputusan biaya dengan lebih cepat.",
                      "here is your daily vehicle update to help you make smarter cost decisions."
                    )}
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:12px 12px 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      ${card(
                        t(locale, "Bensin Hari Ini", "Fuel Today"),
                        formatCurrency(summary.totalFuelToday, locale),
                        t(locale, "Akumulasi harian", "Daily total"),
                        "#0284c7"
                      )}
                      ${card(
                        t(locale, "Servis Hari Ini", "Service Today"),
                        formatCurrency(summary.totalServiceToday, locale),
                        t(locale, "Akumulasi harian", "Daily total"),
                        "#ea580c"
                      )}
                    </tr>
                    <tr>
                      ${card(
                        t(locale, "Bensin Bulan Ini", "Fuel This Month"),
                        formatCurrency(summary.totalFuelMonth, locale),
                        t(locale, "Akumulasi bulanan", "Monthly total"),
                        "#0891b2"
                      )}
                      ${card(
                        t(locale, "Servis Bulan Ini", "Service This Month"),
                        formatCurrency(summary.totalServiceMonth, locale),
                        t(locale, "Akumulasi bulanan", "Monthly total"),
                        "#c2410c"
                      )}
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:18px 20px 8px;">
                  <h2 style="margin:0;color:#0b1220;font-size:18px;">${t(
                    locale,
                    "Status Kendaraan",
                    "Vehicle Status"
                  )}</h2>
                </td>
              </tr>
              <tr>
                <td style="padding:0 20px 10px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    ${renderVehicleRows(summary)}
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:8px 20px 24px;">
                  <a href="${dashboardUrl}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;font-size:14px;">
                    ${t(locale, "Buka Dashboard AjuLaju", "Open AjuLaju Dashboard")}
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding:16px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                    ${t(
                      locale,
                      "Email ini dikirim otomatis oleh sistem reminder harian AjuLaju.",
                      "This email is automatically sent by AjuLaju daily reminder system."
                    )}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

function renderTextEmail(summary: UserSummary): string {
  const locale = summary.locale;
  const vehicleLines = summary.vehicleSummaries
    .map((v) => {
      const km =
        v.kmRemaining === null
          ? t(locale, "interval servis belum diatur", "service interval not set")
          : v.kmRemaining <= 0
          ? `${t(locale, "lewat", "overdue")} ${formatNumber(Math.abs(v.kmRemaining), locale)} KM`
          : `${formatNumber(v.kmRemaining, locale)} KM ${t(locale, "lagi", "left")}`;
      const fc = v.fuelConsumption === null ? "-" : `${formatNumber(v.fuelConsumption, locale)} km/L`;
      return `- ${v.name}: ${t(locale, "sisa servis", "service left")} ${km}, ${t(locale, "konsumsi", "consumption")} ${fc}`;
    })
    .join("\n");

  return [
    t(locale, "Ringkasan Harian AjuLaju", "AjuLaju Daily Summary"),
    `${t(locale, "Bensin hari ini", "Fuel today")}: ${formatCurrency(summary.totalFuelToday, locale)}`,
    `${t(locale, "Servis hari ini", "Service today")}: ${formatCurrency(summary.totalServiceToday, locale)}`,
    `${t(locale, "Bensin bulan ini", "Fuel this month")}: ${formatCurrency(summary.totalFuelMonth, locale)}`,
    `${t(locale, "Servis bulan ini", "Service this month")}: ${formatCurrency(summary.totalServiceMonth, locale)}`,
    "",
    t(locale, "Status kendaraan:", "Vehicle status:"),
    vehicleLines || t(locale, "Belum ada data kendaraan.", "No vehicle data yet."),
  ].join("\n");
}

async function buildSummaryForUser(user: UserProfileDoc, now: Date): Promise<UserSummary> {
  const db = getAdminDb();
  const locale = toAppLocale(user.locale);

  const [vehiclesSnap, servicesSnap, fuelsSnap] = await Promise.all([
    db.collection("vehicles").where("userId", "==", user.uid).get(),
    db.collection("services").where("userId", "==", user.uid).get(),
    db.collection("fuels").where("userId", "==", user.uid).get(),
  ]);

  const vehicles: VehicleDoc[] = vehiclesSnap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<VehicleDoc, "id">),
  }));

  const services: ServiceDoc[] = servicesSnap.docs.map((doc) => doc.data() as ServiceDoc);
  const fuels: FuelDoc[] = fuelsSnap.docs.map((doc) => doc.data() as FuelDoc);

  const startOfMonth = getStartOfMonth(now);

  let totalFuelMonth = 0;
  let totalServiceMonth = 0;
  let totalFuelToday = 0;
  let totalServiceToday = 0;

  for (const row of fuels) {
    const date = parseDateSafe(row.date);
    const cost = row.cost || 0;
    if (!date) continue;
    if (date >= startOfMonth) totalFuelMonth += cost;
    if (isSameLocalDay(date, now)) totalFuelToday += cost;
  }

  for (const row of services) {
    const date = parseDateSafe(row.date);
    const cost = row.cost || 0;
    if (!date) continue;
    if (date >= startOfMonth) totalServiceMonth += cost;
    if (isSameLocalDay(date, now)) totalServiceToday += cost;
  }

  const vehicleSummaries = vehicles
    .map((vehicle) => {
      const vehicleFuels = fuels.filter((f) => f.vehicleId === vehicle.id);
      const vehicleServices = services.filter((s) => s.vehicleId === vehicle.id);
      return buildVehicleSummary(vehicle, vehicleFuels, vehicleServices);
    })
    .sort((a, b) => {
      const rank = { overdue: 0, soon: 1, ok: 2 };
      return rank[a.urgency] - rank[b.urgency];
    });

  return {
    user,
    locale,
    totalFuelMonth,
    totalServiceMonth,
    totalFuelToday,
    totalServiceToday,
    vehicleSummaries,
  };
}

export async function sendDailySummaryEmails(options: DailySummaryOptions = {}): Promise<DailySummaryResult> {
  const dryRun = options.dryRun === true;

  let fromEmail = "";
  let transporter: MailTransport | null = null;

  if (!dryRun) {
    fromEmail = process.env.DAILY_SUMMARY_FROM_EMAIL || "";
    if (!fromEmail) {
      throw new Error("DAILY_SUMMARY_FROM_EMAIL is missing");
    }

    transporter = createSmtpTransport();
  }

  const db = getAdminDb();

  const usersSnapshot = await db.collection("users").get();
  const users: UserProfileDoc[] = usersSnapshot.docs
    .map((doc) => doc.data() as UserProfileDoc)
    .filter((user) => !!user.uid && !!user.email);

  const maxUsers = options.maxUsers && options.maxUsers > 0 ? options.maxUsers : users.length;
  const selectedUsers = users.slice(0, maxUsers);

  const result: DailySummaryResult = {
    dryRun,
    processedUsers: selectedUsers.length,
    sentEmails: 0,
    simulatedEmails: 0,
    failedEmails: 0,
    skippedUsers: 0,
    failures: [],
  };

  const now = new Date();

  for (const user of selectedUsers) {
    const isPlaceholderEmail = !user.email.includes("@");
    if (isPlaceholderEmail) {
      result.skippedUsers += 1;
      continue;
    }

    try {
      const summary = await buildSummaryForUser(user, now);
      if (dryRun) {
        result.simulatedEmails += 1;
      } else {
        const subject = createEmailSubject(summary);
        const html = renderHtmlEmail(summary);
        const text = renderTextEmail(summary);

        await sendWithSmtp({
          transporter: transporter!,
          from: fromEmail,
          to: user.email,
          subject,
          html,
          text,
        });

        result.sentEmails += 1;
      }
    } catch (error) {
      result.failedEmails += 1;
      result.failures.push({
        email: user.email,
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return result;
}
