const dateFormat = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

/** „24. September 2026“ */
export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}
