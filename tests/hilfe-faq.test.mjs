// Aufruf: npm test (Node 22, --experimental-strip-types für den TypeScript-Import)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { FAQ, faqText } from "../lib/hilfe-faq.ts";

/** Vorlage der Redaktion, Wort für Wort. */
const VORLAGE = {
  uebersicht: [
    ["Kostet die Hilfe etwas?", "Die meisten Beratungsstellen der Wohlfahrtsverbände und der Stadt beraten kostenlos. Bei Pflegeheimen, Tagespflege und Pflege-Wohngemeinschaften fallen Kosten an – wie viel davon die Pflegekasse übernimmt, hängt vom Pflegegrad ab."],
    ["Ich weiß nicht, welche Stelle die richtige ist. Wo fange ich an?", "Sucht euch die Einrichtung in eurem Stadtbezirk aus dem passenden Bereich. Wenn ihr unsicher seid: Allgemeine Sozialberatung bieten zum Beispiel die Caritas, die Diakonie, der SKM und der SkF. Dort hilft man euch auch weiter, wenn ihr woanders besser aufgehoben seid."],
    ["Woher stammen die Angaben?", "Alle Einrichtungen stammen aus den offenen Daten der Stadt Krefeld. Wir gleichen sie regelmäßig ab. Öffnungszeiten und Termine erfahrt ihr am besten direkt bei der Einrichtung."],
  ],
  "pflege-senioren": [
    ["Wo bekomme ich eine unabhängige Pflegeberatung?", "Wer Leistungen der Pflegeversicherung bekommt oder beantragt, hat Anspruch auf eine kostenlose Pflegeberatung. In Krefeld helfen euch der Pflegestützpunkt und die Pflegeberatung und Altenhilfe der Stadt. Sie beraten auch Angehörige."],
    ["Was ist der Unterschied zwischen Pflegeheim, Tagespflege und Pflege-WG?", "Im Pflegeheim lebt man dauerhaft mit Pflege rund um die Uhr. In der Tagespflege wird man tagsüber betreut und ist abends wieder zu Hause – das entlastet pflegende Angehörige. In einer Pflege-Wohngemeinschaft leben wenige Menschen zusammen und werden von einem Pflegedienst versorgt; einige sind auf Intensivpflege oder Demenz ausgerichtet."],
    ["Was ist, wenn Rente und Pflegekasse für das Pflegeheim nicht reichen?", "Dann könnt ihr beim Sozialamt „Hilfe zur Pflege“ beantragen. Die Pflegeberatung hilft euch beim Antrag."],
    ["Kostet ein Hospiz etwas?", "Für die Gäste eines stationären Hospizes entstehen keine Kosten für den Aufenthalt. Die Kranken- und Pflegekasse tragen den Großteil, den Rest finanziert das Hospiz über Spenden."],
  ],
  beratung: [
    ["Ist die Beratung kostenlos und vertraulich?", "Bei den meisten Beratungsstellen ja. Die Beraterinnen und Berater unterliegen der Schweigepflicht. Fragt im Zweifel beim ersten Kontakt nach."],
    ["Wo bekomme ich Hilfe bei Schulden?", "Schuldner- und Insolvenzberatung bieten in Krefeld unter anderem der SKM, der SkF und das Diakonische Werk."],
    ["Wo finde ich Beratung rund um Schwangerschaft und Familie?", "Schwangerschaftsberatung gibt es bei Pro Familia und beim SkF. Erziehungs- und Familienberatung bieten unter anderem die Caritas, das Diakonische Werk, der Kinderschutzbund und die Familienberatungsstelle der Stadt."],
  ],
  "kinder-jugend": [
    ["Was ist ein Jugendzentrum oder Jugendtreff?", "Ein offener Ort für Kinder und Jugendliche: Freunde treffen, spielen, Musik machen, Hausaufgaben – mit Ansprechpartnern vor Ort. Die meisten Angebote sind kostenlos und ohne Anmeldung."],
    ["Was sind Wohneinrichtungen für Kinder und Jugendliche?", "Kinder und Jugendliche, die vorübergehend oder dauerhaft nicht in ihrer Familie leben können, finden dort ein Zuhause. Ein Platz wird in der Regel über das Jugendamt vermittelt. Ansprechpartner ist der Fachbereich Jugendhilfe der Stadt Krefeld."],
  ],
  "soziale-dienste-vereine": [
    ["Wo bekomme ich günstig Lebensmittel, Möbel oder Kleidung?", "Die Tafel Krefeld gibt Lebensmittel an Bedürftige aus – wer berechtigt ist, erfahrt ihr direkt bei der Tafel. Gebrauchte Möbel und Waren aus zweiter Hand gibt es bei fairKauf (Caritas-Service)."],
    ["Ich möchte mich ehrenamtlich engagieren. Wo finde ich passende Angebote?", "Das Freiwilligenzentrum Krefeld vermittelt Ehrenamtliche an Vereine und Einrichtungen in der Stadt."],
    ["Wo finden wohnungslose Menschen Hilfe?", "Es gibt einen Tagesaufenthalt für Wohnungslose der Diakonie, die Bahnhofsmission am Hauptbahnhof und Notschlafstellen. Die Wohnungsnotfallhilfen des Diakonischen Werks beraten auch, wenn der Verlust der Wohnung droht."],
  ],
};

test("Fragen und Antworten entsprechen der Vorlage 1:1", () => {
  assert.deepEqual(Object.keys(FAQ), Object.keys(VORLAGE));
  for (const [seite, eintraege] of Object.entries(VORLAGE)) {
    assert.deepEqual(
      FAQ[seite].map((eintrag) => [eintrag.frage, faqText(eintrag.antwort)]),
      eintraege,
      seite,
    );
  }
});

/** Slug wie beim Import (KL Core): Umlaute ausgeschrieben, sonst a–z, 0–9 und „-“. */
function slug(name) {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

test("jeder Link zeigt auf eine Einrichtung aus den Daten", () => {
  const csv = readFileSync(new URL("../data/hilfe/soziale-einrichtungen-krefeld.csv", import.meta.url), "utf8");
  const slugs = new Set(csv.split(/\r?\n/).slice(1).filter(Boolean).map((zeile) => slug(zeile.split(";")[0])));
  for (const eintraege of Object.values(FAQ)) {
    for (const { antwort } of eintraege) {
      for (const teil of antwort) {
        if (typeof teil !== "string") assert.ok(slugs.has(teil.slug), teil.slug);
      }
    }
  }
});
