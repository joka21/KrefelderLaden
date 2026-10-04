# Krefelder Laden – Frontend

Next.js-Frontend (App Router, TypeScript, Tailwind CSS) für den Krefelder Laden. Die Inhalte kommen aus
einem WordPress-Headless-Hub über die REST-API `kls/v1` des Plugins **KL Setup** (ab 3.1.0). Maßgeblich
für alle Endpunkte ist der Abschnitt „API-Vertrag“ in der `readme.txt` von KL Setup.

- Datenabruf ausschließlich serverseitig (`lib/kls.ts`); API-Key und Secrets erreichen nie den Browser.
- `output: "standalone"`, keine Vercel-spezifischen Dienste – läuft unverändert auf einem eigenen Server.
- Schriften lokal (WOFF2, latin), keine Anfragen an Dritte.

## Lokal einrichten

Voraussetzung: Node.js 20.9 oder neuer (getestet mit 22).

```bash
npm install
cp .env.example .env.local   # Werte eintragen (siehe unten)
npm run dev                  # http://localhost:3000
```

Weitere Befehle:

```bash
npm run lint                 # ESLint
npm run build                # Produktions-Build (braucht eine erreichbare API)
npm run start                # Produktions-Server nach dem Build
node .next/standalone/server.js   # Standalone-Server (vorher public/ und .next/static kopieren, s. u.)
```

Schriften neu erzeugen (nur nötig, wenn sich das Schriften-ZIP ändert):

```bash
pip install fonttools brotli
python scripts/build-fonts.py   # liest material/schriften/*.zip, schreibt app/fonts/
```

## Umgebungsvariablen

| Name | Pflicht | Beschreibung |
|---|---|---|
| `KLS_WP_URL` | ja | Adresse von WordPress ohne Pfad, z. B. `https://krefelder-laden.de`. Steht nur hier, nirgends im Code. |
| `KLS_SITE` | ja | Site-Slug im Hub: `krefelder-laden` |
| `KLS_API_KEY` | ja | Wert von `KLS_KREFELDER_LADEN_API_KEY` aus der `wp-config.php` (Header `X-KLS-Key`) |
| `KLS_REVALIDATE_SECRET` | ja | Wert von `KLS_KREFELDER_LADEN_REVALIDATE_SECRET` (für `/api/revalidate`) |
| `KLS_PREVIEW_SECRET` | ja | Wert von `KLS_KREFELDER_LADEN_PREVIEW_SECRET` (für `/api/preview`) |
| `SITE_URL` | ja | Endgültige Domain: `https://krefelder-laden.de`. Basis für Canonical, Sitemap, Open Graph – auch auf der Testadresse. |
| `SITE_INDEXABLE` | nein | Nur `true` erlaubt Suchmaschinen. Sonst (Standard): `noindex, nofollow` im HTML und im Header `X-Robots-Tag`, robots.txt mit `Disallow: /`. Auch mit `true` erhalten andere Hosts als der aus `SITE_URL` den Header `X-Robots-Tag: noindex`. Der Build schreibt den gesehenen Wert ins Log, z. B. `SITE_INDEXABLE: true (indexierbar)`. |
| `NEXT_PUBLIC_MATOMO_URL` | nein | Matomo-Adresse, z. B. `https://statistik.example.de/`. Leer = kein Tracking-Code. |
| `NEXT_PUBLIC_MATOMO_SITE_ID` | nein | Matomo-Site-ID. Leer = kein Tracking-Code. |

Keine Werte committen: `.env.local` steht in `.gitignore`.

**Wichtig:** `KLS_WP_URL` (Bild-Rewrite), `SITE_URL` und `SITE_INDEXABLE` werden beim Build in Konfiguration
und vorgerenderte Seiten übernommen. Nach einer Änderung neu bauen bzw. auf Vercel neu deployen.

## Aufbau

| Pfad | Zweck |
|---|---|
| `lib/kls.ts` | Alle API-Aufrufe, typisiert nach dem API-Vertrag; Cache-Tags |
| `lib/env.ts` | Umgebungsvariablen (nur Server) |
| `lib/seo.ts` | Metadaten aus dem SEO-Block der API, Robots-Schutz, Standardwerte für Seiten ohne WordPress-Inhalt |
| `lib/html.ts`, `lib/urls.ts` | Upload-URLs der WordPress-Domain → `/wp-content/uploads/…` (HTML-Parser), Bilder `loading="lazy"` |
| `lib/consent.ts` | Zentrale Stelle für spätere einwilligungspflichtige Skripte (noch ohne Funktion) |
| `lib/texts.ts` | Feste Texte (Title, Description, H1 und Einleitung der Startseite, Ratgeber-Übersicht) |
| `lib/sections.ts` | Bereiche und Navigation |
| `app/page.tsx` | Startseite: Krähe, Kacheln, neueste 6 Beiträge (`/posts`) |
| `app/[...slug]/page.tsx` | Inhaltsseiten und Beiträge (`/content`) |
| `app/ratgeber/` | Übersicht aller Beiträge, 12 pro Seite (`/ratgeber/`, `/ratgeber/seite/2/` …) |
| `app/api/revalidate` | Revalidation durch WordPress (POST, Secret) |
| `app/api/preview` | Vorschau über den Draft Mode (`/api/preview/exit/` beendet sie) |
| `app/api/redirects` | Weiterleitungsliste für `proxy.ts` |
| `proxy.ts` | `X-Robots-Tag`, Schrägstrich-Weiterleitung, Weiterleitungen aus WordPress |
| `app/sitemap.ts`, `app/robots.ts` | Sitemap aus `/paths` + `/` + `/ratgeber/`; robots.txt |

Navigationspunkte und Kacheln erscheinen nur, wenn ihr Zielpfad in `/paths` veröffentlicht ist; der
Ratgeber, sobald es mindestens einen Beitrag gibt. Impressum und Datenschutz in der Fußzeile werden über
`/content` geprüft (auch mit noindex sichtbar).

## Deployment auf Vercel (Region Frankfurt)

1. Repository zu GitHub (oder GitLab/Bitbucket) pushen.
2. Auf [vercel.com](https://vercel.com) → **Add New… → Project** → Repository importieren.
   Framework „Next.js“ wird erkannt; Build- und Output-Einstellungen unverändert lassen.
3. Vor dem ersten Deploy unter **Environment Variables** alle Variablen aus der Tabelle eintragen
   (Umgebungen „Production“ und „Preview“). Für die Testphase:
   - `SITE_URL=https://krefelder-laden.de` (endgültige Domain, nicht die Testadresse)
   - `SITE_INDEXABLE` leer lassen oder `false`
4. **Deploy** klicken.
5. Region einstellen: **Project → Settings → Functions → Function Region** → `Frankfurt, Germany (West) – fra1`
   wählen und speichern. Danach **Deployments → … → Redeploy**, damit die Region greift.
6. Testadresse prüfen (z. B. `https://<projekt>.vercel.app/`):
   - `/robots.txt` zeigt `Disallow: /`
   - Quelltext enthält `<meta name="robots" content="noindex, nofollow">`, Antwort-Header `X-Robots-Tag: noindex, nofollow`
   - Canonical zeigt auf `https://krefelder-laden.de/…`
7. Revalidation in WordPress auf die Testadresse zeigen lassen: In `config/project.php` von KL Setup ist
   `revalidate_url` auf die endgültige Domain gesetzt. Für die Testphase dort vorübergehend
   `https://<projekt>.vercel.app/api/revalidate` eintragen (Plugin-Konfiguration, nicht Teil dieses Projekts)
   und auf der Statusseite „Gesamte Site neu validieren“ ausführen → HTTP 200.
8. Deployment Protection: Soll die Testadresse nicht öffentlich sein, unter **Settings → Deployment Protection**
   schützen. Achtung: Dann erreichen auch die Revalidation von WordPress und der Vorschau-Link die Seite
   nicht ohne „Protection Bypass“. Der Schutz vor Indexierung funktioniert auch ohne.

Jeder Push auf den Hauptzweig löst ein neues Production-Deployment aus.

### Eigener Server (ohne Vercel)

```bash
npm ci && npm run build
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
cd .next/standalone && PORT=3000 node server.js
```

Umgebungsvariablen müssen beim Build **und** beim Start gesetzt sein. Der Next.js-Cache liegt dann im
Dateisystem unter `.next/` – bei mehreren Instanzen einen gemeinsamen Cache-Handler einrichten.

## Checkliste: Umschalten der Domain

Vorher:

- [ ] WordPress ist auf die Subdomain umgezogen und dort erreichbar (z. B. `https://cms.krefelder-laden.de`).
- [ ] In Vercel `KLS_WP_URL` auf die neue WordPress-Adresse setzen.
- [ ] Redeploy und auf der Testadresse prüfen: Seiten laden, Bilder unter `/wp-content/uploads/…` laden.
- [ ] Statusseite von KL Setup: Domain-Konflikt aufgelöst (nicht mehr „Ausgesetzt“).

Umschalten:

- [ ] In Vercel **Settings → Domains** `krefelder-laden.de` (und `www.krefelder-laden.de` mit Weiterleitung) hinzufügen.
- [ ] DNS beim Domain-Anbieter auf Vercel umstellen (Werte zeigt Vercel an). Vorher TTL senken.
- [ ] Warten, bis Vercel das Zertifikat ausgestellt hat.
- [ ] `SITE_INDEXABLE=true` setzen und **Redeploy**.
- [ ] In KL Setup `revalidate_url` wieder auf `https://krefelder-laden.de/api/revalidate` setzen,
      „Gesamte Site neu validieren“ → HTTP 200.

Danach prüfen:

- [ ] `https://krefelder-laden.de/robots.txt` erlaubt alles und nennt die Sitemap.
- [ ] Kein `noindex` im Quelltext und kein `X-Robots-Tag` im Header.
- [ ] `/sitemap.xml` enthält nur URLs auf `https://krefelder-laden.de`.
- [ ] Alte WordPress-URLs leiten mit 301 auf die neuen Pfade weiter.
- [ ] Vorschau-Button in WordPress öffnet die Vorschau.
- [ ] Die Vercel-Testadresse antwortet weiterhin mit `X-Robots-Tag: noindex, nofollow` (proxy.ts setzt den
      Header für jeden Host außer dem aus `SITE_URL`). Optional in Vercel die `.vercel.app`-Domain auf die
      Hauptdomain weiterleiten.
- [ ] Google Search Console: Domain bestätigen (Code in KL Setup → Verifizierung), Sitemap einreichen.

## Lizenzen

Schriften: Cantarell und Noto Sans, SIL Open Font License 1.1 (`app/fonts/licenses/`).
