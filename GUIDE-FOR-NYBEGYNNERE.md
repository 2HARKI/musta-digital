# Guide for nybegynnere: Musta Digital nettside

Denne guiden forklarer hva du har fått, hva du kan endre, og hvordan du får nettsiden ut på internett med VS Code, GitHub og Vercel.

Tenk på dette som en oppskrift:

1. VS Code er stedet du åpner og endrer filene.
2. GitHub er stedet du lagrer prosjektet på nett.
3. Vercel er stedet som gjør nettsiden synlig for alle.

## 1. Hva filene betyr

I mappen ligger disse viktige filene:

- `index.html` er selve teksten og innholdet på nettsiden.
- `styles.css` bestemmer farger, layout, størrelser og mobiltilpasning.
- `script.js` styrer mobilmenyen og kontaktskjemaet.
- `assets/logo.svg` er logoen.
- `assets/favicon.svg` er det lille ikonet i nettleserfanen.
- `assets/hero-devices-clean.png` er bildet øverst på forsiden.

Hvis du bare vil endre tekst, telefon, e-post eller hvilke tjenester du tilbyr, er det nesten alltid `index.html` du skal åpne.

## 2. Ting du bør bytte før siden publiseres

Åpne `index.html` i VS Code og søk etter disse:

- `kontakt@mustadigital.no`
- `+47 123 45 678`
- `https://mustadigital.no`

Bytt til dine ekte opplysninger.

Hvis du ikke har domene ennå, kan du la domenet stå midlertidig, men før publisering bør det endres til domenet du faktisk kjøper.

## 3. Slik åpner du nettsiden på din egen Mac

1. Finn mappen `musta-digital`.
2. Høyreklikk på mappen.
3. Velg `Open with VS Code` hvis du har det valget.
4. Hvis ikke: åpne VS Code først, trykk `File`, så `Open Folder`, og velg `musta-digital`.
5. Dobbeltklikk på `index.html`.
6. Høyreklikk i filen og velg `Open with Live Server` hvis du har Live Server installert.

Hvis du ikke har Live Server:

1. Åpne VS Code.
2. Trykk på Extensions-ikonet på venstre side.
3. Søk etter `Live Server`.
4. Installer den fra Ritwick Dey.
5. Gå tilbake til `index.html`.
6. Høyreklikk og velg `Open with Live Server`.

Da åpnes nettsiden i nettleseren din.

## 4. Slik endrer du tekst

Eksempel: Hvis du vil endre overskriften på forsiden.

1. Åpne `index.html`.
2. Trykk `Command + F`.
3. Søk etter `Nettsider for små bedrifter`.
4. Endre teksten til det du vil.
5. Trykk `Command + S` for å lagre.
6. Se i nettleseren om det ble riktig.

Viktig: Ikke slett tegn som `<`, `>`, `</section>` eller `</div>` hvis du ikke vet hva de gjør. Endre helst bare teksten mellom tegnene.

Eksempel:

```html
<h1>Nettsider for små bedrifter</h1>
```

Her kan du endre teksten inni:

```html
<h1>Profesjonelle nettsider og booking for lokale bedrifter</h1>
```

## 5. Slik endrer du e-post og telefon

I `index.html` finnes e-post og telefon flere steder.

Bruk søk:

1. Trykk `Command + F`.
2. Søk etter `kontakt@mustadigital.no`.
3. Bytt til din e-post.
4. Søk etter `+47 123 45 678`.
5. Bytt til ditt telefonnummer.

Du vil også se dette:

```html
href="mailto:kontakt@mustadigital.no"
```

Det betyr at knappen åpner e-post. Bytt e-posten der også.

Du vil også se dette:

```html
href="tel:+4712345678"
```

Det er telefonlenken. Der skal nummeret stå uten mellomrom.

## 6. Hvorfor det ikke står faste priser

Nettsiden viser ikke faste priser nå. Det er lurt når du selger nettsider og booking, fordi behovene kan være veldig forskjellige.

Eksempel:

- Én kunde trenger kanskje bare en enkel nettside.
- En annen kunde trenger nettside, booking, teksthjelp, domene og månedlig oppfølging.
- En tredje kunde trenger flere undersider og mer innhold.

Derfor er det bedre å tilby en gratis vurdering først. Etterpå kan du gi en konkret pris basert på hva kunden faktisk trenger.

## 7. Slik legger du prosjektet på GitHub

Dette gjør du én gang for å lage et hjem for nettsiden på GitHub.

1. Gå til GitHub.
2. Trykk `New repository`.
3. Gi prosjektet et navn, for eksempel `musta-digital`.
4. Velg `Public` eller `Private`.
5. Ikke legg til README hvis GitHub spør. Prosjektet har allerede filer.
6. Trykk `Create repository`.

Etterpå må filene fra Macen din sendes til GitHub.

Hvis du bruker VS Code:

1. Åpne mappen `musta-digital`.
2. Trykk på Source Control-ikonet på venstre side.
3. Hvis VS Code spør om å lage Git repository, trykk `Initialize Repository`.
4. Skriv en kort melding, for eksempel `First website version`.
5. Trykk `Commit`.
6. Trykk `Publish Branch`.
7. Velg GitHub-kontoen din.
8. Velg repository-navnet du laget.

Når dette er gjort, ligger nettsiden din på GitHub.

## 8. Slik publiserer du med Vercel

Dette gjør du for å få en ekte nettadresse.

1. Gå til Vercel.
2. Logg inn med GitHub-kontoen din.
3. Trykk `Add New` eller `New Project`.
4. Velg GitHub-prosjektet ditt, for eksempel `musta-digital`.
5. Når Vercel spør om framework, velg `Other` hvis den ikke finner noe automatisk.
6. Build command kan stå tom.
7. Output directory kan stå tom.
8. Trykk `Deploy`.

Vercel lager da en midlertidig lenke, ofte noe som ligner:

```text
https://musta-digital.vercel.app
```

Når du senere endrer filer i VS Code og pusher til GitHub, vil Vercel lage ny versjon automatisk.

## 9. Slik aktiverer du ekte kontaktskjema

Kontaktskjemaet er nå satt opp slik at kunden kan trykke `Send forespørsel` direkte på nettsiden. Da sendes meldingen via Vercel og e-postkontoen din.

For at dette skal virke, må Vercel få lov til å sende e-post. Du gjør det med miljøvariabler. Tenk på miljøvariabler som hemmelige innstillinger som bare Vercel ser.

Først må du ha en ekte e-postkonto hos Webhuset, for eksempel:

```text
kontakt@mustadigital.no
```

Så gjør du dette i Vercel:

1. Gå til Vercel.
2. Åpne prosjektet `musta-digital`.
3. Gå til `Settings`.
4. Gå til `Environment Variables`.
5. Legg til disse én og én:

```text
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
CONTACT_TO
CONTACT_FROM
```

Bruk dette som utgangspunkt:

```text
SMTP_HOST = SMTP-serveren Webhuset viser for e-posten din
SMTP_PORT = 465
SMTP_SECURE = true
SMTP_USER = kontakt@mustadigital.no
SMTP_PASS = passordet til e-postkontoen
CONTACT_TO = kontakt@mustadigital.no
CONTACT_FROM = Musta Digital <kontakt@mustadigital.no>
```

Viktig:

- Ikke skriv e-postpassordet i `index.html`.
- Ikke skriv e-postpassordet i `script.js`.
- Ikke legg e-postpassordet på GitHub.
- Passordet skal bare ligge i Vercel under `Environment Variables`.

Når du har lagt inn dette:

1. Gå til `Deployments` i Vercel.
2. Trykk på de tre prikkene på siste deployment.
3. Trykk `Redeploy`.
4. Test skjemaet på nettsiden etterpå.

Hvis skjemaet sier at det mangler e-postoppsett, betyr det nesten alltid at én av miljøvariablene mangler eller er skrevet feil.

## 10. Slik kobler du til eget domene

Når du har kjøpt et domene, for eksempel `mustadigital.no`, gjør du dette:

1. Gå til prosjektet ditt i Vercel.
2. Gå til `Settings`.
3. Gå til `Domains`.
4. Skriv inn domenet ditt.
5. Følg instruksene Vercel viser.

Vercel vil vanligvis be deg endre DNS hos der du kjøpte domenet. DNS betyr bare: hvor domenet skal peke.

Eksempel:

```text
mustadigital.no skal peke til Vercel
```

Når DNS er riktig, blir nettsiden synlig på ditt eget domene.

## 11. Slik jobber du videre etter publisering

Når du vil endre nettsiden:

1. Åpne prosjektet i VS Code.
2. Endre tekst, tjenester eller bilder.
3. Lagre.
4. Gå til Source Control i VS Code.
5. Skriv hva du endret, for eksempel `Update text`.
6. Trykk `Commit`.
7. Trykk `Sync Changes` eller `Push`.
8. Vent litt.
9. Vercel oppdaterer nettsiden automatisk.

Kort sagt:

```text
Endre i VS Code -> send til GitHub -> Vercel oppdaterer nettsiden
```

## 12. Vercel Analytics

Vercel Analytics er lagt inn i nettsiden. Det betyr at du kan se besøk og sidevisninger i Vercel.

Etter at du har pushet endringen til GitHub og Vercel har deployet på nytt:

1. Gå til Vercel.
2. Åpne prosjektet `musta-digital`.
3. Gå til `Analytics`.
4. Besøk nettsiden din selv én gang.
5. Vent litt og oppdater Analytics-siden.

Hvis du ikke ser tall med én gang, vent litt. Vercel kan bruke litt tid før data vises.

## 13. Hva du kan si til bedrifter

Du kan bruke dette som en enkel salgstekst når du kontakter bedrifter:

```text
Hei! Vi ser at dere ikke har en egen nettside ennå, bare Google-profil/sosiale medier.

Vi hjelper små bedrifter med profesjonelle nettsider, kontaktknapper, booking og bedre synlighet på nett.

Målet er at kunder lettere skal finne dere, forstå hva dere tilbyr og ta kontakt.

Vi kan gjerne sende en gratis vurdering av hva dere bør ha på en enkel nettside.
```

## 14. Hva du bør gjøre først

Gjør dette i denne rekkefølgen:

1. Bytt e-post og telefon i `index.html`.
2. Bestem om løsningspakkene passer med det du vil tilby.
3. Les gjennom teksten og se om den føles som deg.
4. Åpne siden lokalt og sjekk mobilvisning.
5. Legg prosjektet på GitHub.
6. Publiser på Vercel.
7. Legg inn miljøvariabler for kontaktskjemaet i Vercel.
8. Koble til domene når du er klar.

## 15. Ikke vær redd for dette

Du trenger ikke forstå alt med en gang.

Start med små endringer:

- Endre én tekst.
- Lagre.
- Sjekk i nettleseren.
- Gå videre.

Det er sånn man lærer dette.

## Nyttige offisielle lenker

- GitHub: Lage nytt repository: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- Vercel: Deploy fra Git: https://vercel.com/docs/git
- Vercel: Legge til domene: https://vercel.com/docs/domains/working-with-domains/add-a-domain
