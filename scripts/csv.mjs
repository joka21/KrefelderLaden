// CSV der Redaktion (Semikolon, Felder mit „;“ in Anführungszeichen) → JSON-Datei in lib/.
// Gemeinsam genutzt von scripts/build-troedelmaerkte.mjs und scripts/build-second-hand.mjs.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

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

/**
 * Liest `quelle`, prüft die Spalten gegen `spalten` (kommagetrennt, wie im Interface
 * in `typ`) und schreibt die Zeilen als JSON nach `ziel`. Pfade relativ zum Projekt.
 */
export function csvNachJson({ quelle, ziel, spalten, typ }) {
  const [kopf, ...daten] = parse(readFileSync(root + quelle, "utf8").replace(/^﻿/, ""));
  const gelesen = kopf.map((name) => name.trim()).join(",");
  if (gelesen !== spalten) {
    throw new Error(`${quelle}: Spalten geändert, ${typ} anpassen:\n${gelesen}`);
  }
  const zeilen = daten.map((werte, index) => {
    if (werte.length !== kopf.length) {
      throw new Error(`${quelle}, Zeile ${index + 2}: ${werte.length} statt ${kopf.length} Felder`);
    }
    return Object.fromEntries(kopf.map((name, spalte) => [name.trim(), werte[spalte].trim()]));
  });
  writeFileSync(root + ziel, `${JSON.stringify(zeilen, null, 2)}\n`);
  console.log(`${ziel}: ${zeilen.length} Zeilen`);
}
