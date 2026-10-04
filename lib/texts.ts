/**
 * Feste Texte des Frontends an einer Stelle.
 *
 * Sobald in WordPress eine Startseite (front_page) veröffentlicht ist, kommen
 * Title, Description, H1 und Schema der Startseite von dort.
 */
export const TEXTS = {
  home: {
    /** Title (auch og:title) der Startseite, solange keine front_page gesetzt ist. */
    title: "Krefelder Laden – Einkaufen, Hilfe & Tipps für Krefeld",
    /** Description (auch og:description) der Startseite, solange keine front_page gesetzt ist. */
    description:
      "Märkte, Läden, Termine und Anlaufstellen in Krefeld: Krefelder Laden zeigt, wo Sie einkaufen, Hilfe finden und die Stadt entdecken. Vor Ort recherchiert.",
    /** H1 der Startseite, solange keine front_page gesetzt ist. */
    heading: "Krefelder Laden: einkaufen, Hilfe finden, Krefeld entdecken",
    /** Einleitung neben der Krähe. */
    intro:
      "Wo gibt es in Krefeld was? Krefelder Laden sammelt Märkte, Läden, Termine und Anlaufstellen in der Stadt. Alles wird vor Ort recherchiert und laufend ergänzt.",
    sectionsHeading: "Bereiche",
    latestHeading: "Neueste Beiträge",
    allPosts: "Alle Beiträge im Ratgeber",
  },
  ratgeber: {
    /** H1 der Übersicht. */
    title: "Ratgeber",
    /** Title ohne Site-Namen (auch og:title); „ – Krefelder Laden“ hängt pageTitle() an. */
    metaTitle: "Ratgeber für Krefeld",
    description:
      "Tipps, Termine und Hintergründe aus Krefeld: Märkte, Einkaufen, Ausflüge und Stadtgeschichte im Ratgeber von Krefelder Laden.",
    empty: "Noch keine Beiträge veröffentlicht.",
  },
  notFound: {
    title: "Seite nicht gefunden",
    text: "Unter dieser Adresse gibt es keine Seite. Vielleicht hilft der Weg zurück zur Startseite.",
    back: "Zur Startseite",
  },
  preview: {
    notice: "Vorschau – diese Fassung ist nicht veröffentlicht.",
    exit: "Vorschau beenden",
  },
  passwordProtected: "Dieser Inhalt ist geschützt und kann hier nicht angezeigt werden.",
} as const;
