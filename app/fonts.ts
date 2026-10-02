import localFont from "next/font/local";

/**
 * Lokale Schriften (WOFF2, auf lateinische Zeichen reduziert, siehe
 * scripts/build-fonts.py). Keine Anfrage an Google oder andere Dritte.
 * Lizenzen: app/fonts/licenses/ (SIL Open Font License 1.1).
 */

export const cantarell = localFont({
  src: [{ path: "./fonts/cantarell-bold.woff2", weight: "700", style: "normal" }],
  variable: "--font-cantarell",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const notoSans = localFont({
  src: [
    { path: "./fonts/noto-sans-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/noto-sans-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/noto-sans-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-noto-sans",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});
