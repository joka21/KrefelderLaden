// Aufruf: node scripts/build-second-hand.mjs
//
// Wandelt data/second_hand_krefeld_2026.csv in lib/second-hand-daten.json um;
// gelesen von lib/second-hand.ts. Nach jeder Änderung der CSV neu ausführen und danach `npm test`.
import { csvNachJson } from "./csv.mjs";

csvNachJson({
  quelle: "data/second_hand_krefeld_2026.csv",
  ziel: "lib/second-hand-daten.json",
  spalten:
    "name,art,strasse,plz,stadtteil,oeffnungszeiten,sortiment,ankauf,traeger,website,quelle_url,status,hinweise,recherchiert_am,geprueft_am,zugang",
  typ: "SecondHandZeile in lib/second-hand.ts",
});
