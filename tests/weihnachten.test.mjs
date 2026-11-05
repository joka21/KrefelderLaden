// Aufruf: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  BEITRAEGE_JE_BLOCK,
  heuteInKrefeld,
  istWeihnachtszeit,
  stelleBloeckeZusammen,
  WEIHNACHTEN_TEXTE,
} from "../lib/weihnachten.ts";
import { MAERKTE, naechsteMaerkte } from "../lib/weihnachtsmaerkte.ts";

const namen = (maerkte) => maerkte.map(({ name }) => name);
const beitraege = (...ids) => ids.map((id) => ({ id }));

test("Länge von Title und Description", () => {
  assert.ok(WEIHNACHTEN_TEXTE.title.length <= 60, WEIHNACHTEN_TEXTE.title);
  assert.ok(WEIHNACHTEN_TEXTE.description.length <= 155, WEIHNACHTEN_TEXTE.description);
});

test("Datum gilt nach deutscher Zeit", () => {
  assert.equal(heuteInKrefeld(new Date("2026-12-31T22:59:59Z")), "2026-12-31");
  assert.equal(heuteInKrefeld(new Date("2026-12-31T23:00:00Z")), "2027-01-01");
});

test("Saison-Schalter: bis 31.12.2026 Weihnachten, ab 01.01.2027 die bisherige Startseite", () => {
  assert.equal(istWeihnachtszeit("2026-11-05"), true);
  assert.equal(istWeihnachtszeit("2026-12-31"), true);
  assert.equal(istWeihnachtszeit("2027-01-01"), false);
});

test("nächste Märkte: höchstens 4, vergangene fehlen, laufende bleiben", () => {
  assert.deepEqual(namen(naechsteMaerkte("2026-11-05")), namen(MAERKTE.slice(0, 4)));

  const amErstenDezember = naechsteMaerkte("2026-12-01");
  assert.equal(amErstenDezember.length, 4);
  assert.ok(namen(amErstenDezember).includes("MIKS – Weihnachtsmarkt made in Krefeld"));
  assert.ok(!namen(amErstenDezember).includes("Wintermarkt An Bruckhausen"));
});

test("Markt zählt bis einschließlich zum letzten Tag, Eintagesmarkt bis zu seinem Tag", () => {
  assert.ok(namen(naechsteMaerkte("2026-11-21")).includes("Funkelnde Sterne in Oppum"));
  assert.ok(!namen(naechsteMaerkte("2026-11-22")).includes("Funkelnde Sterne in Oppum"));
  assert.ok(namen(naechsteMaerkte("2026-11-21")).includes("Wintermarkt An Bruckhausen"));
  assert.ok(!namen(naechsteMaerkte("2026-11-22")).includes("Wintermarkt An Bruckhausen"));
});

test("Nach dem letzten Markttag gibt es keine Märkte mehr", () => {
  const letzterTag = MAERKTE.map(({ start, ende }) => ende ?? start).sort().at(-1);
  assert.equal(letzterTag, "2026-12-23");
  assert.ok(naechsteMaerkte(letzterTag).length > 0);
  assert.equal(naechsteMaerkte("2026-12-24").length, 0);
});

test("Blöcke: ohne Beiträge fehlt der Block, höchstens 6 in Reihenfolge der IDs", () => {
  assert.deepEqual(stelleBloeckeZusammen([[], [], [], []], [], []), []);

  const alle = beitraege(1, 2, 3, 4, 5, 6, 7, 8);
  const [rezepte, ...rest] = stelleBloeckeZusammen([[], [], [8, 7, 6, 5, 4, 3, 2, 1], []], [], alle);
  assert.equal(rezepte.heading, "Rezepte für die kalte Jahreszeit");
  assert.deepEqual(
    rezepte.posts.map(({ id }) => id),
    [8, 7, 6, 5, 4, 3],
  );
  assert.equal(rezepte.posts.length, BEITRAEGE_JE_BLOCK);
  assert.deepEqual(rest, []);
});

test("Mehr zu Weihnachten: ohne Beiträge, die anderswo angezeigt werden, und als letzter Block", () => {
  const alle = beitraege(1, 2, 3, 4, 5, 6, 7, 8, 9);
  const bloecke = stelleBloeckeZusammen([[1, 2, 3, 4, 5, 6, 7], [], [], []], [7, 6, 9], alle);
  const mehr = bloecke.at(-1);
  assert.equal(mehr.heading, "Mehr zu Weihnachten");
  // 6 ist im ersten Block sichtbar; 7 fällt dort durch die Grenze heraus und darf hier stehen.
  assert.deepEqual(
    mehr.posts.map(({ id }) => id),
    [7, 9],
  );
});

test("Mehr zu Weihnachten fehlt, wenn alle Beiträge schon angezeigt werden", () => {
  const bloecke = stelleBloeckeZusammen([[1], [], [], []], [1], beitraege(1));
  assert.deepEqual(
    bloecke.map(({ heading }) => heading),
    ["Geschenkideen aus Krefelder Läden"],
  );
});
