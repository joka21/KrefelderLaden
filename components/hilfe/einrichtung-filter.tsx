"use client";

import { useId, useState, useSyncExternalStore } from "react";

import { EinrichtungKacheln } from "@/components/hilfe/einrichtung-kacheln";
import { EinrichtungListe, type ListEintrag } from "@/components/hilfe/einrichtung-liste";

interface Option {
  slug: string;
  name: string;
  count: number;
}

interface Auswahl {
  thema: string;
  bezirk: string;
  kategorie: string;
}

const ALLE = "";
const LEER: Auswahl = { thema: ALLE, bezirk: ALLE, kategorie: ALLE };

/* Filter in der URL (?thema=…&stadtteil=…): die Query ist der Zustand. */
const URL_EVENT = "einrichtung-filter";
const QUERY = { thema: "thema", bezirk: "stadtteil" } as const;

function subscribe(callback: () => void): () => void {
  window.addEventListener("popstate", callback);
  window.addEventListener(URL_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(URL_EVENT, callback);
  };
}

/** Wert nur, wenn es ihn als Option gibt; sonst „Alle“. */
function gueltig(value: string | null, options: Option[]): string {
  return value && options.some((option) => option.slug === value) ? value : ALLE;
}

/**
 * Auswahl im Zustand der Komponente oder – mit inUrl – in der Query. Auf dem
 * Server und ohne JavaScript gilt „Alle“.
 */
function useAuswahl(inUrl: boolean, bereiche: Option[], bezirke: Option[]): [Auswahl, (next: Auswahl) => void] {
  const [lokal, setLokal] = useState(LEER);
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );

  if (!inUrl) {
    return [lokal, setLokal];
  }

  const params = new URLSearchParams(search);
  const auswahl = {
    thema: gueltig(params.get(QUERY.thema), bereiche),
    bezirk: gueltig(params.get(QUERY.bezirk), bezirke),
    kategorie: ALLE,
  };
  const setAuswahl = (next: Auswahl) => {
    const url = new URL(window.location.href);
    for (const key of ["thema", "bezirk"] as const) {
      if (next[key]) {
        url.searchParams.set(QUERY[key], next[key]);
      } else {
        url.searchParams.delete(QUERY[key]);
      }
    }
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(URL_EVENT));
  };
  return [auswahl, setAuswahl];
}

/**
 * Liste mit Filter nach Stadtbezirk und Kategorie. Der Server liefert alle
 * Einträge im HTML; ohne JavaScript bleibt die ungefilterte Liste sichtbar.
 *
 * Variante „verzeichnis“ (Übersicht „Hilfe finden“): Filter nach Thema
 * (Bereich) und Stadtteil, Auswahl in der URL (teilbar), Einträge als Kacheln,
 * Filter mobil untereinander.
 */
export function EinrichtungFilter({
  eintraege,
  bezirke,
  kategorien,
  bereiche = [],
  variante = "liste",
  headingLevel = 2,
}: {
  eintraege: ListEintrag[];
  bezirke: Option[];
  kategorien: Option[];
  bereiche?: Option[];
  variante?: "liste" | "verzeichnis";
  /** Überschriften-Ebene der Listeneinträge (Variante „liste“); Kacheln sind immer H3. */
  headingLevel?: 2 | 3;
}) {
  const verzeichnis = variante === "verzeichnis";
  const [auswahl, setAuswahl] = useAuswahl(verzeichnis, bereiche, bezirke);
  const { thema, bezirk, kategorie } = auswahl;
  const id = useId();

  const sichtbar = eintraege.filter(
    (eintrag) =>
      (thema === ALLE || eintrag.bereich.slug === thema) &&
      (bezirk === ALLE || eintrag.bezirk.slug === bezirk) &&
      (kategorie === ALLE || eintrag.kategorie?.slug === kategorie),
  );
  const gefiltert = thema !== ALLE || bezirk !== ALLE || kategorie !== ALLE;

  const selectClass = "mt-1 block min-h-11 w-full rounded-md border border-line bg-white px-3 py-2 sm:w-64";
  const feldClass = verzeichnis ? "w-full sm:w-auto" : undefined;

  return (
    <>
      <form
        role="search"
        aria-label="Einrichtungen filtern"
        className={
          verzeichnis
            ? "mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
            : "mb-6 flex flex-wrap items-end gap-4"
        }
        onSubmit={(event) => event.preventDefault()}
      >
        {verzeichnis ? (
          <div className={feldClass}>
            <label htmlFor={`${id}-thema`} className="font-bold">
              Thema
            </label>
            <select
              id={`${id}-thema`}
              value={thema}
              onChange={(event) => setAuswahl({ ...auswahl, thema: event.target.value })}
              className={selectClass}
            >
              <option value={ALLE}>Alle Themen</option>
              {bereiche.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name} ({option.count})
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className={feldClass}>
          <label htmlFor={`${id}-bezirk`} className="font-bold">
            {verzeichnis ? "Stadtteil" : "Stadtbezirk"}
          </label>
          <select
            id={`${id}-bezirk`}
            value={bezirk}
            onChange={(event) => setAuswahl({ ...auswahl, bezirk: event.target.value })}
            className={selectClass}
          >
            <option value={ALLE}>{verzeichnis ? "Alle Stadtteile" : "Alle Stadtbezirke"}</option>
            {bezirke.map((option) => (
              <option key={option.slug} value={option.slug}>
                Krefeld-{option.name} ({option.count})
              </option>
            ))}
          </select>
        </div>
        {kategorien.length > 1 ? (
          <div>
            <label htmlFor={`${id}-kategorie`} className="font-bold">
              Kategorie
            </label>
            <select
              id={`${id}-kategorie`}
              value={kategorie}
              onChange={(event) => setAuswahl({ ...auswahl, kategorie: event.target.value })}
              className={selectClass}
            >
              <option value={ALLE}>Alle Kategorien</option>
              {kategorien.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name} ({option.count})
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {gefiltert ? (
          <button
            type="button"
            onClick={() => setAuswahl(LEER)}
            className="min-h-11 rounded-md border border-line px-4 font-bold hover:border-green hover:text-green"
          >
            Filter zurücksetzen
          </button>
        ) : null}
      </form>

      <p role="status" className="mb-6 text-muted">
        {sichtbar.length === 1 ? "1 Einrichtung" : `${sichtbar.length} Einrichtungen`}
        {gefiltert ? ` von ${eintraege.length}` : ""}
      </p>

      {sichtbar.length === 0 ? (
        <p>Keine Einrichtungen für diese Auswahl.</p>
      ) : verzeichnis ? (
        <EinrichtungKacheln eintraege={sichtbar} />
      ) : (
        <EinrichtungListe eintraege={sichtbar} headingLevel={headingLevel} />
      )}
    </>
  );
}
