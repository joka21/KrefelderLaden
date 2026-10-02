/**
 * Feste Texte des Frontends an einer Stelle.
 *
 * PLATZHALTER: Alle mit [Platzhalter] markierten Texte sind vorläufig und werden
 * später redaktionell ersetzt. Sobald in WordPress eine Startseite (front_page)
 * veröffentlicht ist, kommen Title, Description und Schema der Startseite von dort.
 */
export const TEXTS = {
  home: {
    /** Kurzer Satz unter der Krähe. */
    intro: "[Platzhalter] Krefelder Laden zeigt, wo man in Krefeld regional einkaufen, Hilfe finden und die Stadt entdecken kann.",
    /** Description der Startseite, solange keine front_page gesetzt ist. */
    description: "[Platzhalter] Regional einkaufen, Hilfe finden und Krefeld entdecken – der Krefelder Laden.",
    sectionsHeading: "Bereiche",
    latestHeading: "Neueste Beiträge",
    allPosts: "Alle Beiträge im Ratgeber",
  },
  ratgeber: {
    title: "Ratgeber",
    description: "[Platzhalter] Alle Beiträge des Krefelder Ladens, die neuesten zuerst.",
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
