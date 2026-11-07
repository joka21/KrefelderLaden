// Aufruf: node scripts/build-troedelmaerkte.mjs
//
// Wandelt data/troedelmaerkte_krefeld_2026_2027.csv in lib/troedelmaerkte-daten.json und
// data/troedelmaerkte_verkaeufer.csv (Angaben für Verkäufer, eine Zeile je Markt) in
// lib/troedelmaerkte-verkaeufer.json um; gelesen von lib/troedelmaerkte.ts. Nach jeder
// Änderung einer der beiden CSV neu ausführen und danach `npm test`.
import { csvNachJson } from "./csv.mjs";

csvNachJson({
  quelle: "data/troedelmaerkte_krefeld_2026_2027.csv",
  ziel: "lib/troedelmaerkte-daten.json",
  spalten:
    "titel,kategorie,datum,beginn,ende,veranstaltungsort,strasse,plz,ort,stadtteil,veranstalter,turnus,eintritt,status,hinweise,veranstaltungs_url,quelle_url,recherchiert_am",
  typ: "TroedelZeile in lib/troedelmaerkte.ts",
});

csvNachJson({
  quelle: "data/troedelmaerkte_verkaeufer.csv",
  ziel: "lib/troedelmaerkte-verkaeufer.json",
  spalten: "markt,standplatz_url,standgebuehr,aufbau_ab,gelaende,ueberdacht",
  typ: "VerkaeuferZeile in lib/troedelmaerkte.ts",
});
