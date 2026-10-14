import { HILFE_TEXTS } from "@/lib/hilfe";

/** Quellenangabe unten auf jeder Seite von „Hilfe finden“. */
export function HilfeQuelle() {
  return (
    <p className="mx-auto mt-16 max-w-6xl border-t border-line px-5 pt-6 text-sm text-muted sm:px-8">{HILFE_TEXTS.quelle}</p>
  );
}
