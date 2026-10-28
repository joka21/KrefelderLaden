/**
 * „Gut zu wissen“ auf /hilfe-finden/ und den Bereichsseiten. Texte unverändert aus
 * der redaktionellen Vorlage; Teile mit `slug` werden zum Link auf die
 * Detailseite der Einrichtung (nur, wenn sie veröffentlicht ist).
 */

export type FaqTeil = string | { text: string; slug: string };

export interface FaqEintrag {
  frage: string;
  antwort: FaqTeil[];
}

const link = (text: string, slug: string): FaqTeil => ({ text, slug });

/** Schlüssel: „uebersicht“ für /hilfe-finden/, sonst der Slug des Bereichs. */
export const FAQ: Record<string, FaqEintrag[]> = {
  uebersicht: [
    {
      frage: "Kostet die Hilfe etwas?",
      antwort: [
        "Die meisten Beratungsstellen der Wohlfahrtsverbände und der Stadt beraten kostenlos. Bei Pflegeheimen, Tagespflege und Pflege-Wohngemeinschaften fallen Kosten an – wie viel davon die Pflegekasse übernimmt, hängt vom Pflegegrad ab.",
      ],
    },
    {
      frage: "Ich weiß nicht, welche Stelle die richtige ist. Wo fange ich an?",
      antwort: [
        "Sucht euch die Einrichtung in eurem Stadtbezirk aus dem passenden Bereich. Wenn ihr unsicher seid: Allgemeine Sozialberatung bieten zum Beispiel die ",
        link("Caritas", "caritasverband-fuer-die-region-krefeld-e-v"),
        ", die ",
        link("Diakonie", "diakonie-krefeld-viersen"),
        ", der ",
        link("SKM", "beratungsstelle-skm-krefeld-e-v"),
        " und der ",
        link("SkF", "sozialdienst-katholischer-frauen-e-v-krefeld-skf"),
        ". Dort hilft man euch auch weiter, wenn ihr woanders besser aufgehoben seid.",
      ],
    },
    {
      frage: "Woher stammen die Angaben?",
      antwort: [
        "Alle Einrichtungen stammen aus den offenen Daten der Stadt Krefeld. Wir gleichen sie regelmäßig ab. Öffnungszeiten und Termine erfahrt ihr am besten direkt bei der Einrichtung.",
      ],
    },
  ],

  "pflege-senioren": [
    {
      frage: "Wo bekomme ich eine unabhängige Pflegeberatung?",
      antwort: [
        "Wer Leistungen der Pflegeversicherung bekommt oder beantragt, hat Anspruch auf eine kostenlose Pflegeberatung. In Krefeld helfen euch der ",
        link("Pflegestützpunkt", "pflegestuetzpunkt-stadt-krefeld"),
        " und die ",
        link("Pflegeberatung und Altenhilfe der Stadt", "pflegeberatung-und-altenhilfe-stadt-krefeld"),
        ". Sie beraten auch Angehörige.",
      ],
    },
    {
      frage: "Was ist der Unterschied zwischen Pflegeheim, Tagespflege und Pflege-WG?",
      antwort: [
        "Im Pflegeheim lebt man dauerhaft mit Pflege rund um die Uhr. In der Tagespflege wird man tagsüber betreut und ist abends wieder zu Hause – das entlastet pflegende Angehörige. In einer Pflege-Wohngemeinschaft leben wenige Menschen zusammen und werden von einem Pflegedienst versorgt; einige sind auf Intensivpflege oder Demenz ausgerichtet.",
      ],
    },
    {
      frage: "Was ist, wenn Rente und Pflegekasse für das Pflegeheim nicht reichen?",
      antwort: ["Dann könnt ihr beim Sozialamt „Hilfe zur Pflege“ beantragen. Die Pflegeberatung hilft euch beim Antrag."],
    },
    {
      frage: "Kostet ein Hospiz etwas?",
      antwort: [
        "Für die Gäste eines stationären Hospizes entstehen keine Kosten für den Aufenthalt. Die Kranken- und Pflegekasse tragen den Großteil, den Rest finanziert das Hospiz über Spenden.",
      ],
    },
  ],

  beratung: [
    {
      frage: "Ist die Beratung kostenlos und vertraulich?",
      antwort: [
        "Bei den meisten Beratungsstellen ja. Die Beraterinnen und Berater unterliegen der Schweigepflicht. Fragt im Zweifel beim ersten Kontakt nach.",
      ],
    },
    {
      frage: "Wo bekomme ich Hilfe bei Schulden?",
      antwort: [
        "Schuldner- und Insolvenzberatung bieten in Krefeld unter anderem der ",
        link("SKM", "beratungsstelle-skm-krefeld-e-v"),
        ", der ",
        link("SkF", "beratungsstelle-skf-krefeld-e-v"),
        " und das ",
        link("Diakonische Werk", "familienberatung-diakonisches-werk"),
        ".",
      ],
    },
    {
      frage: "Wo finde ich Beratung rund um Schwangerschaft und Familie?",
      antwort: [
        "Schwangerschaftsberatung gibt es bei ",
        link("Pro Familia", "pro-familia-krefeld"),
        " und beim ",
        link("SkF", "beratungsstelle-skf-krefeld-e-v"),
        ". Erziehungs- und Familienberatung bieten unter anderem die ",
        link("Caritas", "familienberatung-caritas"),
        ", das ",
        link("Diakonische Werk", "familienberatung-diakonisches-werk"),
        ", der ",
        link("Kinderschutzbund", "familienberatung-kinderschutzbund"),
        " und die ",
        link("Familienberatungsstelle der Stadt", "familienberatungsstelle-stadt-krefeld"),
        ".",
      ],
    },
  ],

  "kinder-jugend": [
    {
      frage: "Was ist ein Jugendzentrum oder Jugendtreff?",
      antwort: [
        "Ein offener Ort für Kinder und Jugendliche: Freunde treffen, spielen, Musik machen, Hausaufgaben – mit Ansprechpartnern vor Ort. Die meisten Angebote sind kostenlos und ohne Anmeldung.",
      ],
    },
    {
      frage: "Was sind Wohneinrichtungen für Kinder und Jugendliche?",
      antwort: [
        "Kinder und Jugendliche, die vorübergehend oder dauerhaft nicht in ihrer Familie leben können, finden dort ein Zuhause. Ein Platz wird in der Regel über das Jugendamt vermittelt. Ansprechpartner ist der Fachbereich Jugendhilfe der Stadt Krefeld.",
      ],
    },
  ],

  "soziale-dienste-vereine": [
    {
      frage: "Wo bekomme ich günstig Lebensmittel, Möbel oder Kleidung?",
      antwort: [
        "Die ",
        link("Tafel Krefeld", "tafel-krefeld-e-v"),
        " gibt Lebensmittel an Bedürftige aus – wer berechtigt ist, erfahrt ihr direkt bei der Tafel. Gebrauchte Möbel und Waren aus zweiter Hand gibt es bei ",
        link("fairKauf (Caritas-Service)", "fairkauf-moebel-laden-caritas-service"),
        ".",
      ],
    },
    {
      frage: "Ich möchte mich ehrenamtlich engagieren. Wo finde ich passende Angebote?",
      antwort: [
        "Das ",
        link("Freiwilligenzentrum Krefeld", "freiwilligenzentrum-krefeld-caritasverband-fuer-die-region-krefeld-e-v"),
        " vermittelt Ehrenamtliche an Vereine und Einrichtungen in der Stadt.",
      ],
    },
    {
      frage: "Wo finden wohnungslose Menschen Hilfe?",
      antwort: [
        "Es gibt einen ",
        link("Tagesaufenthalt für Wohnungslose der Diakonie", "tagesaufenthalt-fuer-wohnungslose-diakonie-krefeld-viersen"),
        ", die ",
        link("Bahnhofsmission am Hauptbahnhof", "bahnhofsmission-am-krefelder-hauptbahnhof-diakonisches-werk-krefeld-viersen"),
        " und Notschlafstellen. Die ",
        link("Wohnungsnotfallhilfen des Diakonischen Werks", "wohnungsnotfallhilfen-diakonisches-werk"),
        " beraten auch, wenn der Verlust der Wohnung droht.",
      ],
    },
  ],
};

/** Antwort als reiner Text (für Tests und Vergleiche). */
export function faqText(antwort: FaqTeil[]): string {
  return antwort.map((teil) => (typeof teil === "string" ? teil : teil.text)).join("");
}
