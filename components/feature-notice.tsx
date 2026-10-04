import Link from "next/link";

import type { FEATURE } from "@/lib/sections";

/*
 * Hinweis auf das Schwerpunktthema (lib/sections.ts). Beere mit weißer Schrift
 * (7,58:1, WCAG AA auch für kleinen Text). Die ganze Fläche ist der Link.
 */
export function FeatureNotice({ feature }: { feature: typeof FEATURE }) {
  return (
    <section aria-labelledby="schwerpunkt" className="mx-auto max-w-6xl px-5 pt-12 sm:px-8">
      <Link href={feature.path} className="group block rounded-lg bg-berry p-6 text-white sm:p-8">
        <h2 id="schwerpunkt" className="text-2xl underline-offset-4 group-hover:underline sm:text-3xl">
          {feature.heading}
        </h2>
        <p className="mt-3 max-w-prose text-lg leading-relaxed">{feature.text}</p>
      </Link>
    </section>
  );
}
