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

## Filer

- `index.html` - struktur og tekst
- `styles.css` - design og responsiv layout
- `script.js` - mobilmeny og innsending av kontaktskjema
- `api/contact.js` - Vercel-funksjon som sender skjemaet til e-post
- `package.json` - forteller Vercel at prosjektet bruker `nodemailer`
- `assets/logo.svg` - enkel logo basert på Musta Digital-stilen
- `assets/favicon.svg` - ikon til nettleserfanen
- `assets/hero-devices-clean.png` - hero-bilde laget for siden
