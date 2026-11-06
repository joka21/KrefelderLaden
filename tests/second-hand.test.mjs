// Aufruf: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  BESTAETIGT,
  EINTRAEGE,
  eintrag,
  fragen,
  geprueftText,
  NUR_ANNAHME,
  OHNE_ZEITEN,
  SECOND_HAND_BESCHREIBUNG,
  SECOND_HAND_TITEL,
  secondHandSchema,
  SICHTBARE_ABSCHNITTE,
  zuordnung,
  ZEILEN,
} from "../lib/second-hand.ts";

const URL_SEITE = "https://example.org/second-hand-krefeld/";
const graph = secondHandSchema({ "@graph": [{ "@id": `${URL_SEITE}#webpage` }] }, URL_SEITE)["@graph"];
const bestaetigt = ZEILEN.filter(({ status }) => status.startsWith(BESTAETIGT));
const alleTexte = () => [
  ...EINTRAEGE.flatMap((item) => Object.values(item).filter((wert) => typeof wert === "string")),
  ...fragen().flatMap(({ frage, antwort }) => [frage, antwort]),
  JSON.stringify(graph),
];

test("Länge von Title und Description", () => {
  assert.ok(SECOND_HAND_TITEL.length <= 60, SECOND_HAND_TITEL);
  assert.ok(SECOND_HAND_BESCHREIBUNG.length < 160, SECOND_HAND_BESCHREIBUNG);
});

test("jede Art gehört zu einem Abschnitt", () => {
  for (const zeile of ZEILEN) {
    assert.ok(zuordnung(zeile.art), `${zeile.name}: unbekannte Art „${zeile.art}“`);
  }
});

test("nur Einträge mit Status „Vom Laden bestätigt …“ erscheinen", () => {
  assert.equal(EINTRAEGE.length, bestaetigt.length);
  assert.deepEqual(
    EINTRAEGE.map(({ name }) => name),
    bestaetigt.map(({ name }) => name),
  );
  const ausgeblendet = ZEILEN.filter(({ status }) => !status.startsWith(BESTAETIGT));
  assert.ok(ausgeblendet.length > 0);
  const texte = alleTexte().join("\n");
  for (const zeile of ausgeblendet) {
    // Namen, die Teil eines angezeigten Namens sind, gibt es nicht; daher reicht der Textvergleich.
    assert.ok(!texte.includes(zeile.name), `${zeile.name} (${zeile.status}) erscheint`);
  }
  // Im JSON-LD je angezeigtem Eintrag genau ein Store.
  const liste = graph.find((node) => node["@type"] === "ItemList");
  assert.equal(liste.itemListElement.length, EINTRAEGE.length);
  assert.ok(liste.itemListElement.every(({ item }) => item["@type"] === "Store" && item.name && item.address));
  assert.ok(liste.itemListElement.every(({ item }) => !("openingHours" in item)));
});

test("Spalte „hinweise“ erscheint nirgends", () => {
  const texte = alleTexte();
  for (const zeile of ZEILEN.filter(({ hinweise }) => hinweise)) {
    assert.ok(!texte.some((text) => text.includes(zeile.hinweise)), `Hinweis von ${zeile.name}`);
    // Auch kein längeres Stück (erster Teil bis zum Semikolon).
    const stueck = zeile.hinweise.split(";")[0].trim();
    if (stueck.length >= 25) {
      assert.ok(!texte.some((text) => text.includes(stueck)), `Hinweis-Teil von ${zeile.name}: ${stueck}`);
    }
  }
  assert.ok(EINTRAEGE.every((item) => !("hinweise" in item) && !("status" in item)));
});

test("geprueft_am wird angezeigt, wenn gefüllt", () => {
  assert.equal(geprueftText(""), "");
  assert.equal(geprueftText("2026-11-12"), "telefonisch geprüft am 12.11.2026");
  const [zeile] = bestaetigt;
  assert.equal(eintrag({ ...zeile, geprueft_am: "2026-11-12" }).geprueft, "telefonisch geprüft am 12.11.2026");
  assert.equal(eintrag({ ...zeile, geprueft_am: "" }).geprueft, "");
  for (const item of EINTRAEGE) {
    const quelle = ZEILEN.find(({ name }) => name === item.name);
    assert.equal(item.geprueft, geprueftText(quelle.geprueft_am), item.name);
  }
});

test("leere Öffnungszeiten, Zugang und Annahmestellen", () => {
  for (const item of EINTRAEGE) {
    const quelle = ZEILEN.find(({ name }) => name === item.name);
    assert.equal(item.oeffnungszeiten, quelle.oeffnungszeiten || OHNE_ZEITEN, item.name);
    if (item.art === "Kleiderkammer") {
      assert.ok(["offen für alle", "für Bedürftige", "bitte vorher erkundigen"].includes(item.zugang), item.name);
    } else {
      assert.equal(item.zugang, "", item.name);
    }
  }
  const annahme = EINTRAEGE.filter(({ nurAnnahme }) => nurAnnahme);
  assert.ok(annahme.length > 0);
  assert.ok(annahme.every(({ abschnitt }) => abschnitt === "kleider"));
  assert.equal(NUR_ANNAHME, "nur Annahme, kein Verkauf");
});

test("leere Abschnitte sind ausgeblendet", () => {
  assert.ok(SICHTBARE_ABSCHNITTE.every(({ eintraege }) => eintraege.length > 0));
  assert.equal(
    SICHTBARE_ABSCHNITTE.reduce((summe, { eintraege }) => summe + eintraege.length, 0),
    EINTRAEGE.length,
  );
  assert.ok(!fragen([]).some(({ antwort }) => antwort.includes("undefined")));
});

test("FAQ-Antworten nennen nur angezeigte Einträge", () => {
  const angezeigt = new Set(EINTRAEGE.map(({ name }) => name));
  const texte = fragen().map(({ antwort }) => antwort).join("\n");
  for (const zeile of ZEILEN.filter(({ name }) => !angezeigt.has(name))) {
    assert.ok(!texte.includes(zeile.name), zeile.name);
  }
  const antwort = (anfang) => fragen().find(({ frage }) => frage.startsWith(anfang)).antwort;

  for (const item of EINTRAEGE.filter(({ art }) => art === "Sozialkaufhaus")) {
    assert.ok(antwort("Welche Sozialkaufhäuser").includes(item.name), item.name);
  }
  const verkaufen = antwort("Wo kann ich in Krefeld gebrauchte");
  for (const item of EINTRAEGE) {
    assert.equal(verkaufen.includes(item.name), item.ankauf, `${item.name}: Ankauf ${item.ankauf}`);
  }
  const spenden = antwort("Wo kann ich in Krefeld Kleidung");
  for (const item of EINTRAEGE) {
    assert.equal(spenden.includes(item.name), item.nurAnnahme, item.name);
  }
  assert.ok(antwort("Wo gibt es").includes(`${EINTRAEGE.length} Adressen`));
  // Mit weniger Einträgen ändern sich die Antworten mit.
  const ohneAnkauf = EINTRAEGE.filter((item) => !item.ankauf);
  assert.equal(
    fragen(ohneAnkauf).find(({ frage }) => frage.startsWith("Wo kann ich in Krefeld gebrauchte")).antwort,
    "Zurzeit haben wir keine Adresse mit Ankauf in der Liste.",
  );
});

test("JSON-LD: FAQPage und eindeutige @id", () => {
  const faq = graph.find((node) => node["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, fragen().length);
  const ids = graph.map((node) => node["@id"]).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(graph[0].dateModified, "2026-11-06");
});
