/** Höchstlänge eines Seitentitels (Zeichen), ab der Suchmaschinen kürzen. */
export const MAX_TITLE_LENGTH = 60;

/**
 * Seitentitel mit höchstens MAX_TITLE_LENGTH Zeichen: der volle Titel
 * („Name – Krefelder Laden“), sonst der Name allein, sonst der Name am
 * Wortende gekürzt. Eine beim Kürzen offen gebliebene Klammer fällt samt
 * Inhalt weg, ebenso Satzzeichen am Ende.
 */
export function fitTitle(full: string, name: string, max = MAX_TITLE_LENGTH): string {
  if (full.length <= max) {
    return full;
  }
  if (name.length <= max) {
    return name;
  }

  const head = name.slice(0, max + 1);
  const space = head.lastIndexOf(" ");
  let short = space > 0 ? head.slice(0, space) : name.slice(0, max);

  const open = short.lastIndexOf("(");
  if (open > 0 && !short.slice(open).includes(")")) {
    short = short.slice(0, open);
  }
  return short.replace(/[\s,;:/&(–-]+$/u, "");
}
