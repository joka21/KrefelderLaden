import type { Metadata } from "next";
import Link from "next/link";

import { TEXTS } from "@/lib/texts";

export const metadata: Metadata = {
  title: { absolute: `${TEXTS.notFound.title} – Krefelder Laden` },
  robots: { index: false, follow: false },
};

/** 404-Seite (HTTP-Status 404). */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-14 sm:px-8">
      <h1 className="text-4xl">{TEXTS.notFound.title}</h1>
      <p className="mt-5 text-lg">{TEXTS.notFound.text}</p>
      <p className="mt-8">
        <Link href="/" className="font-bold text-green underline underline-offset-4 hover:text-green-dark">
          {TEXTS.notFound.back}
        </Link>
      </p>
    </div>
  );
}
