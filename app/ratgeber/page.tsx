import type { Metadata } from "next";

import { RatgeberPage, ratgeberMetadata } from "@/app/ratgeber/ratgeber-page";

export const revalidate = 3600;

export function generateMetadata(): Promise<Metadata> {
  return ratgeberMetadata(1);
}

export default function Ratgeber() {
  return <RatgeberPage page={1} />;
}
