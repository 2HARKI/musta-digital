# Musta Digital nettside

Dette er en komplett førsteversjon for Musta Digital.

Åpne `index.html` i nettleseren for å se siden. Kontaktskjemaet bruker en Vercel-funksjon og fungerer først når siden ligger på Vercel med e-postinnstillinger lagt inn.

Hvis du er ny med nettsider, start med `GUIDE-FOR-NYBEGYNNERE.md`. Den forklarer steg for steg hvordan du åpner, endrer, legger på GitHub og publiserer med Vercel.

## Innhold som bør byttes før publisering

- Telefonnummer: `+47 123 45 678`
- E-post: `kontakt@mustadigital.no`
- Domene i structured data: `https://mustadigital.no`
- Løsningspakkene hvis du vil endre hva du tilbyr
- Eventuelle ekte referanser/kundeeksempler når du får dine første kunder

## Kontaktskjema

Skjemaet sender til `/api/contact` og bruker SMTP fra e-postleverandøren din. Legg disse inn i Vercel under `Settings` -> `Environment Variables`:

- `SMTP_HOST` - SMTP-serveren fra Webhuset
- `SMTP_PORT` - vanligvis `465`
- `SMTP_SECURE` - vanligvis `true`
- `SMTP_USER` - for eksempel `kontakt@mustadigital.no`
- `SMTP_PASS` - passordet til e-postkontoen
- `CONTACT_TO` - for eksempel `kontakt@mustadigital.no`
- `CONTACT_FROM` - for eksempel `Musta Digital <kontakt@mustadigital.no>`

Ikke legg passordet inn i GitHub eller kodefilene.

## Kundepanel og database

Kontaktskjemaet kan også lagre henvendelser i Supabase, slik at du kan søke i kunder, firmaer og tidligere henvendelser.

1. Opprett et Supabase-prosjekt.
2. Gå til SQL Editor i Supabase.
3. Kjør innholdet i `database/supabase-schema.sql`.
4. Legg disse inn i Vercel under `Settings` -> `Environment Variables`:

- `SUPABASE_URL` - prosjekt-URL fra Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - service role key fra Supabase, aldri legg denne i frontend
- `ADMIN_TOKEN` - et langt hemmelig passord for adminpanelet

Kundepanelet ligger på `/admin/`. Det har egen innlogging, er satt til `noindex`, og API-et krever `ADMIN_TOKEN`.

Direkte e-post til `kontakt@mustadigital.no` lagres ikke automatisk i kundepanelet ennå. Starten er kontaktskjema -> database. Direkte e-post kan kobles på senere med videresending, IMAP eller en e-postintegrasjon.

## Personvern

Siden har en personvernerklæring på `/personvern/`. Oppdater den hvis systemer, leverandører eller måten du behandler kundeopplysninger på endres.

## Filer

- `index.html` - struktur og tekst
- `styles.css` - design og responsiv layout
- `script.js` - mobilmeny og innsending av kontaktskjema
- `api/contact.js` - Vercel-funksjon som sender skjemaet til e-post
- `api/leads.js` - privat API for å søke i kunder og henvendelser
- `api/_crm.js` - felles databasehjelpere for kundepanelet
- `admin/` - privat kundepanel med innlogging og søk
- `database/supabase-schema.sql` - databaseoppsett for Supabase
- `package.json` - forteller Vercel at prosjektet bruker `nodemailer`
- Vercel Analytics er lagt inn i `index.html`
- `assets/logo.svg` - enkel logo basert på Musta Digital-stilen
- `assets/favicon.svg` - ikon til nettleserfanen
- `assets/hero-devices-clean.png` - hero-bilde laget for siden
