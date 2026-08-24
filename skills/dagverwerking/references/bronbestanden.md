# Bronbestanden — waar staat wat

Basismap ("de cowork-map"):
`C:\Users\Geert\OneDrive - De Ramenwassers\Documenten\De Ramenwassers\cowork\`

Locaties gecontroleerd op 31/07/2026 en opnieuw gebruikt op 17/08/2026.

## Overzicht

| Wat | Waar | Voor |
|---|---|---|
| Squeegee-facturatierapport (.csv) | `rapporten Squeegee facturatie\` | A, B, C, E |
| Metatrak-rapport | `rapporten metatrak\` of `C:\Users\Geert\Downloads` | A, E |
| Coda-bestanden | `uittreksels 2026\` (dubbele t), `COD_JJJJMMDD_068934364550.CD2` | D1 (terugval), D2 |
| Belfius-transactie-export | `C:\Users\Geert\Downloads`, `BE86 0689 3436 4550 *.csv` | D1 (voorkeur) |
| Facturenregister | `facturatie\gefactureerde_dagen.json` | C |
| API-sleutel | `facturatie\api-sleutel.txt` | C, D2 |
| facturenlijst.xlsm | `facturatie\facturenlijst.xlsm`, blad "Data Squeegee" | B |
| ingave werk.xlsm | cowork-map (root), blad "ingave" | E |
| stortingen vs kosten - nieuw.xlsx | cowork-map (root), blad "Import bank" | D1 |
| Urenrapport (uitvoer) | `aan te passen rapport\` | A |
| Nakijkrapport (uitvoer) | `rapport te bekjken - aanpassingen\` | rapport |
| Dagverwerkingsrapport (uitvoer) | cowork-map (root) | rapport |

Nooit gebruiken: de kopie van "stortingen vs kosten" in Downloads, en
`stortingen vs kosten_oud.xlsx`.

De mapnaam **`rapport te bekjken - aanpassingen`** bevat een typfout. Neem ze exact zo over, anders
maak je een tweede map aan en vindt Geert zijn rapport niet.

## Squeegee-facturatierapport

Naam `Ramen_Wasser_Facturen_*.csv`, lezen met Read. Let op: op 17/08/2026 heette het bruikbare
bestand gewoon `report.csv` terwijl het nieuwste `Ramen_Wasser_Facturen_*.csv` een oudere periode
dekte. Kijk dus altijd naar de **datums in het bestand**, niet naar de bestandsnaam, en zoek met
`rapporten Squeegee facturatie\*` als je twijfelt.

Kolommen die je nodig hebt: klant referentie (CUS…), klantnaam, adres, datum voltooid, subtotaal
(excl. btw), belasting, totaal (incl. btw), opgenomen tijd, uitvoerder, uitgevoerde taken, ronde.

## Metatrak — vier mogelijke vormen, zoek in deze volgorde

Zoek **altijd in zowel `rapporten metatrak` als `C:\Users\Geert\Downloads`**, en controleer bij elke
vorm de datums in de tijdkolommen: **de datum in de bestandsnaam is de downloaddag, niet de gedekte
werkdag.** Een bestand dat op 30/07 om 07u23 gedownload is, dekt werkdag 29/07.

**1. `rapporten metatrak\Metatrak_JJJJ-MM-DD_detail.csv`** — van de nachttaak
"metatrak-rapport-ophalen". Lezen met Read. Beste geval.

**2. `_opt_xena_out_<uuid>.csv`** — de CSV-export die Geert zelf downloadt. Dit is een **volwaardig
detailrapport** en de op één na beste bron. (Herzien 31/07/2026: eerder stond hier dat dit "meestal
enkel een dagsamenvatting zonder stopdetails" was — dat was fout. Het bestand van 30/07/2026 bevatte
139 regels met alle stops, ritten, adressen en tijdstippen per voertuig, en was meteen leesbaar met
Read.)

Opbouw: puntkomma-gescheiden, kolommen
`Tracker name;Total movement time;Total stop time;Total mileage;Itemization begin time;Itemization end time;Starting address;Ending address;Maximum speed`.
Per voertuig één kopregel met de naam ingevuld (Toyota / Sprinter / Gele Master / Vivaro / Witte
Master) en daaronder de detailregels met een lege eerste kolom; de laatste regel is
`Total mileage:`. Tijdstippen staan als `30.07.2026 08:05:22`. Een regel met "Total stop time"
gevuld = STOP, met "Total movement time" gevuld = RIT. De eerste regel per voertuig zonder adressen
is de nachtperiode. Het is zeker geen Belfius-bestand.

**3. `Rapport over beweging_JJJJ-MM-DD_UU-MM-SS.xls`** — dezelfde inhoud als binair Excel-bestand.
De Read-tool **weigert** dit bestand, dus zonder Excel is het onbruikbaar. Heb je Excel: open het en
sla het meteen op als `rapporten metatrak\Metatrak_JJJJ-MM-DD_detail.csv` (Opslaan als → "CSV UTF-8
(door komma's gescheiden)", met de **gedekte werkdag** in de naam) en lees daarna dat CSV met Read.
Bij het openen verschijnt "bestandsindeling en -extensie komen niet overeen" — kies gewoon "Ja". De
gedekte periode staat bovenaan het blad bij "Period: Start / Finish": lees die altijd vóór je verder
werkt. Is er ook een `_opt_xena_out_*.csv` van dezelfde dag, gebruik dan altijd díé.

**4. Niets gevonden** — haal het rapport zelf op via Claude-in-Chrome op
`https://fleet.metatrak.it/reports/index`. Geert blijft daar permanent ingelogd; log nooit zelf in
en typ nooit een wachtwoord — zie je een inlogscherm, stop dan en meld het.

Route: Verslagen → Nieuw rapport → "Rapport In beweging" → alle voertuigen → periode "Vorige dag" →
Aanvraag → wachten tot het statusicoon groen is → rij aanklikken → "Rapport tonen" → tabeldata
uitlezen. Schrijf de twee CSV's daarna weg in `rapporten metatrak`.

De volledige, uitgeteste JavaScript-fragmenten voor élke stap staan in de taak
**"metatrak-rapport-ophalen"** (`C:\Users\Geert\Claude\Scheduled\metatrak-rapport-ophalen\SKILL.md`)
— lees dat bestand en volg het; de site gebruikt een custom grid waarop gewone coördinaat-klikken
niets doen. Loopt de pagina vast: begin opnieuw in een verse browsertab. Gok nooit op andere
adressen: metatrak.be, portal.metatrak.be en metafleet.be bestaan niet of geven een 404 (nagekeken
31/07/2026).

**Ontbreekt Metatrak helemaal?** Zie de hoofdskill: A en E vervallen, B/C/D lopen wel door. Vraag in
het afrondingsbericht om de **CSV**-export, niet om het .xls. Controleer ook of de nachttaak
"metatrak-rapport-ophalen" nog draait: die hoort elke nacht om 03u00 het rapport klaar te zetten, en
`lastRunAt` in `list_scheduled_tasks` verraadt of ze stilgevallen is.

## Coda en Belfius — twee verschillende bestanden

- **Coda** (`COD_JJJJMMDD_068934364550.CD2`, hoofdletters) staat in `uittreksels 2026`. Gebruikt door
  D2, en als terugval voor D1.
- **Belfius-transactie-export** heet `BE86 0689 3436 4550 JJJJ-MM-DD UU-MM-SS n.csv` en staat in
  `C:\Users\Geert\Downloads`. De naam bevat nergens het woord "belfius". Het is een .csv, geen
  .xlsx. Dit is de voorkeursbron voor D1.

## API-sleutel Eenvoudig Factureren

De sleutel staat in `facturatie\api-sleutel.txt` (één regel). Lees hem daar, gebruik hem als header
`X-API-Key`, en zet hem **nooit** in een rapport, een bericht of een logregel.

Ontbreekt het bestand of geeft de API 401/403: meld dat Geert een nieuwe sleutel moet aanmaken via
Toegangsbeheer, sla C en D2 over, en ga gewoon verder met de rest. Vraag er nooit naar in het
gesprek — er zit vaak niemand aan de computer.
