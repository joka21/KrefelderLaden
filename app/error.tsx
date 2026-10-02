"use client";

/** Fehlerseite, z. B. wenn die API vorübergehend nicht erreichbar ist. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-14 sm:px-8">
      <h1 className="text-4xl">Etwas ist schiefgelaufen</h1>
      <p className="mt-5 text-lg">
        Die Seite konnte gerade nicht geladen werden. Bitte versuchen Sie es gleich noch einmal.
      </p>
      <p className="mt-8">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-md bg-green px-5 font-bold text-white hover:bg-green-dark"
        >
          Erneut versuchen
        </button>
      </p>
    </div>
  );
}
