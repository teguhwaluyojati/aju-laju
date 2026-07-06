type AppLocale = "id" | "en";

function toIntlLocale(locale: AppLocale): string {
  return locale === "en" ? "en-US" : "id-ID";
}

export function formatRupiah(value: number, locale: AppLocale = "id"): string {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatServiceDate(dateInput: Date | string, locale: AppLocale = "id"): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    dateStyle: "medium",
  }).format(date);
}
