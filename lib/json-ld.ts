/**
 * JSON für ein <script type="application/ld+json">. Jedes „<“ wird als
 * Unicode-Escape (Backslash, u003c) maskiert, damit Inhalte (z. B. ein Titel
 * mit „</script>“) das Script-Element nicht beenden können; JSON.parse liefert
 * dieselben Daten zurück.
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`);
}
