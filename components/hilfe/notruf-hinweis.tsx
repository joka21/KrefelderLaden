/*
 * Notruf-Kasten (Detailseiten mit notruf_hinweis und Seiten des Bereichs
 * „Beratung“). Beere mit weißer Schrift (7,58:1); die Nummern sind tel:-Links.
 */
export function NotrufHinweis({ className = "" }: { className?: string }) {
  const link = "font-bold underline underline-offset-4 hover:no-underline";

  return (
    <aside aria-label="Notruf" className={`rounded-lg bg-berry px-5 py-4 text-lg leading-relaxed text-white sm:px-6 ${className}`}>
      <p>
        <strong>In einer akuten Notlage:</strong> Notruf{" "}
        <a href="tel:112" className={link}>
          112
        </a>{" "}
        · Telefonseelsorge{" "}
        <a href="tel:+498001110111" className={`${link} whitespace-nowrap`}>
          0800 111 0 111
        </a>{" "}
        (rund um die Uhr, kostenlos)
      </p>
    </aside>
  );
}
