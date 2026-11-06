// Aufruf: node scripts/build-troedelmaerkte.mjs
//
// Wandelt data/troedelmaerkte_krefeld_2026_2027.csv (Semikolon, Felder mit „;“ in
// Anführungszeichen) in lib/troedelmaerkte-daten.json um; gelesen von
// lib/troedelmaerkte.ts. Nach jeder Änderung der CSV neu ausführen und danach `npm test`.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const QUELLE = "data/troedelmaerkte_krefeld_2026_2027.csv";
const ZIEL = "lib/troedelmaerkte-daten.json";
/** Spalten wie in TroedelZeile (lib/troedelmaerkte.ts). */
const SPALTEN =
  "titel,kategorie,datum,beginn,ende,veranstaltungsort,strasse,plz,ort,stadtteil,veranstalter,turnus,eintritt,status,hinweise,veranstaltungs_url,quelle_url,recherchiert_am";
const root = fileURLToPath(new URL("..", import.meta.url));

/** CSV-Zeilen in Felder zerlegen (Anführungszeichen, verdoppelte "" und Zeilenumbrüche in Feldern). */
function parse(text) {
  const zeilen = [];
  let zeile = [];
  let feld = "";
  let inQuotes = false;
  const zeileFertig = () => {
    zeile.push(feld);
    if (zeile.some((wert) => wert.trim() !== "")) zeilen.push(zeile);
    zeile = [];
    feld = "";
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        feld += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        feld += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ";") {
      zeile.push(feld);
      feld = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      zeileFertig();
    } else {
      feld += c;
    }
  }
  zeileFertig();
  return zeilen;
}

const [kopf, ...daten] = parse(readFileSync(root + QUELLE, "utf8").replace(/^﻿/, ""));
const spalten = kopf.map((name) => name.trim()).join(",");
if (spalten !== SPALTEN) {
  throw new Error(`${QUELLE}: Spalten geändert, TroedelZeile in lib/troedelmaerkte.ts anpassen:\n${spalten}`);
}
const zeilen = daten.map((werte, index) => {
  if (werte.length !== kopf.length) {
    throw new Error(`${QUELLE}, Zeile ${index + 2}: ${werte.length} statt ${kopf.length} Felder`);
  }
  return Object.fromEntries(kopf.map((name, spalte) => [name.trim(), werte[spalte].trim()]));
});

writeFileSync(root + ZIEL, `${JSON.stringify(zeilen, null, 2)}\n`);
console.log(`${ZIEL}: ${zeilen.length} Zeilen`);
