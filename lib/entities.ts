/**
 * Dekodiert HTML-Entities in reinem Text, z. B. Begriffsnamen aus WordPress
 * („Kinder &amp; Jugend“ → „Kinder & Jugend“). Ein Durchlauf: „&amp;lt;“ wird
 * zu „&lt;“, nicht zu „<“. Unbekannte Entities bleiben stehen.
 */
const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === "#") {
      const point = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isInteger(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    }
    return NAMED[code.toLowerCase()] ?? entity;
  });
}
