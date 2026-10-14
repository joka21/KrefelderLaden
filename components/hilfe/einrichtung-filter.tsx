"use client";

import { useId, useState } from "react";

import { EinrichtungListe, type ListEintrag } from "@/components/hilfe/einrichtung-liste";

interface Option {
  slug: string;
  name: string;
  count: number;
}

const ALLE = "";

/**
 * Liste mit Filter nach Stadtbezirk und Kategorie. Der Server liefert alle
 * Einträge im HTML; ohne JavaScript bleibt die ungefilterte Liste sichtbar.
 */
export function EinrichtungFilter({
  eintraege,
  bezirke,
  kategorien,
}: {
  eintraege: ListEintrag[];
  bezirke: Option[];
  kategorien: Option[];
}) {
  const [bezirk, setBezirk] = useState(ALLE);
  const [kategorie, setKategorie] = useState(ALLE);
  const id = useId();

  const sichtbar = eintraege.filter(
    (eintrag) =>
      (bezirk === ALLE || eintrag.bezirk.slug === bezirk) &&
      (kategorie === ALLE || eintrag.kategorie?.slug === kategorie),
  );
  const gefiltert = bezirk !== ALLE || kategorie !== ALLE;

  const selectClass = "mt-1 block min-h-11 w-full rounded-md border border-line bg-white px-3 py-2 sm:w-64";

  return (
    <>
      <form role="search" aria-label="Einrichtungen filtern" className="mb-6 flex flex-wrap items-end gap-4" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor={`${id}-bezirk`} className="font-bold">
            Stadtbezirk
          </label>
          <select id={`${id}-bezirk`} value={bezirk} onChange={(event) => setBezirk(event.target.value)} className={selectClass}>
            <option value={ALLE}>Alle Stadtbezirke</option>
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
              onChange={(event) => setKategorie(event.target.value)}
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
            onClick={() => {
              setBezirk(ALLE);
              setKategorie(ALLE);
            }}
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

      {sichtbar.length > 0 ? <EinrichtungListe eintraege={sichtbar} /> : <p>Keine Einrichtungen für diese Auswahl.</p>}
    </>
  );
}
