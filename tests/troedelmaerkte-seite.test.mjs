// Aufruf: npm test – Antwort zuerst, Stand je Termin, Angaben für Verkäufer.
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  antwortZeile,
  antwortZuerst,
  datumLang,
  GELAENDE,
  kommendeTermine,
  TERMINE,
  VERKAEUFER_ZEILEN,
  verkaeuferInfo,
  ZEILEN,
  zeitraum,
} from "../lib/troedelmaerkte.ts";

const tageMit = (anzahl) => {
  const proTag = Map.groupBy(TERMINE, ({ datum }) => datum);
  return [...proTag.entries()].filter(([, termine]) => termine.length === anzahl).map(([datum]) => datum);
};

test("Antwort zuerst: genau ein Markt heute", () => {
  const [tag] = tageMit(1);
  assert.ok(tag, "Testdaten: ein Tag mit genau einem Markt");
  const [termin] = TERMINE.filter(({ datum }) => datum === tag);
  const { satz, liste } = antwortZuerst(tag);
  assert.equal(liste.length, 0);
  assert.ok(satz.startsWith(`Heute, ${datumLang(tag)}, findet in Krefeld ${termin.markt} statt`), satz);
  if (termin.beginn && termin.ende && termin.art !== "uhrzeitOffen") {
    assert.ok(satz.includes(`, von ${Number(termin.beginn.slice(0, 2))}`), satz);
  }
});

test("Antwort zuerst: mehrere Märkte heute als Liste", () => {
  const { satz, liste } = antwortZuerst("2026-11-07");
  assert.equal(satz, "Heute, Samstag, 7. November 2026, finden in Krefeld 2 Trödelmärkte statt:");
  assert.deepEqual(
    liste.map(antwortZeile),
    ["Samstags-Trödelmarkt Grotenburg, von 7 bis 14 Uhr", "Bücherbasar Freunde der Linner Museen, von 11 bis 17 Uhr"],
  );
});

test("Antwort zuerst: heute keiner, dann der nächste", () => {
  const { satz, liste } = antwortZuerst("2026-11-06");
  assert.equal(liste.length, 0);
  assert.equal(
    satz,
    "Heute findet in Krefeld kein Trödelmarkt statt. Der nächste ist am Samstag, 7. November 2026: Samstags-Trödelmarkt Grotenburg und Bücherbasar Freunde der Linner Museen.",
  );
  const nachLetztem = antwortZuerst("2099-01-01");
  assert.match(nachLetztem.satz, /^Heute findet in Krefeld kein Trödelmarkt statt\. Neue Termine/);
});

test("zeitraum: von–bis, ab oder leer", () => {
  assert.equal(zeitraum({ beginn: "07:00", ende: "14:00", art: "normal" }), "von 7 bis 14 Uhr");
  assert.equal(zeitraum({ beginn: "13:00", ende: "", art: "normal" }), "ab 13 Uhr");
  assert.equal(zeitraum({ beginn: "13:00", ende: "18:00", art: "uhrzeitOffen" }), "ab 13 Uhr");
  assert.equal(zeitraum({ beginn: "", ende: "", art: "normal" }), "");
});

test("Stand je Termin aus recherchiert_am, Quelle aus quelle_url", () => {
  for (const termin of kommendeTermine("2026-11-06")) {
    const zeile = ZEILEN[termin.zeile - 2];
    assert.equal(termin.geprueftAm, zeile.recherchiert_am, termin.markt);
    assert.equal(termin.quelle, zeile.quelle_url, termin.markt);
  }
});

test("Verkäufer-CSV: jeder Markt genau einmal, gültige Werte", () => {
  const maerkte = new Set(ZEILEN.map(({ titel }) => titel));
  const namen = VERKAEUFER_ZEILEN.map(({ markt }) => markt);
  assert.equal(new Set(namen).size, namen.length, "doppelte Märkte");
  for (const zeile of VERKAEUFER_ZEILEN) {
    assert.ok(maerkte.has(zeile.markt), `unbekannter Markt: ${zeile.markt}`);
    assert.ok(zeile.gelaende === "" || GELAENDE.includes(zeile.gelaende), `${zeile.markt}: Gelände „${zeile.gelaende}“`);
    assert.ok(["", "ja", "nein"].includes(zeile.ueberdacht), `${zeile.markt}: überdacht „${zeile.ueberdacht}“`);
    assert.ok(zeile.standplatz_url === "" || zeile.standplatz_url.startsWith("https://"), `${zeile.markt}: Standplatz-URL`);
  }
});

test("Für Verkäufer nur mit Werten", () => {
  const leer = { markt: "X", standplatz_url: "", standgebuehr: "", aufbau_ab: "", gelaende: "", ueberdacht: "" };
  assert.equal(verkaeuferInfo("X", [leer]), null);
  assert.equal(verkaeuferInfo("Y", [leer]), null);
  assert.deepEqual(verkaeuferInfo("X", [{ ...leer, ueberdacht: "nein" }]), {
    standplatzUrl: "",
    standgebuehr: "",
    aufbauAb: "",
    gelaende: "",
    ueberdacht: false,
  });
  assert.equal(verkaeuferInfo("X", [{ ...leer, standgebuehr: "15 Euro" }]).standgebuehr, "15 Euro");
});
