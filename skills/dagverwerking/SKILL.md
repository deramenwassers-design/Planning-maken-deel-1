---
name: dagverwerking
description: '⭐dagverwerking : verwerkt één gereden werkdag van De Ramenwassers volledig — uren vergelijken (Squeegee vs Metatrak), facturenlijst aanvullen, facturen aanmaken in Eenvoudig Factureren, coda''s inlezen, de omzet per team in "ingave werk" zetten en de cash-ontvangsten in Scrada noteren, met een nakijkrapport in Excel. Gebruik deze skill wanneer Geert vraagt om "de dagverwerking", "dagverwerking-lokaal", "verwerk de dag van gisteren/maandag/17 augustus", "de facturen van gisteren aanmaken", "de uren vergelijken met Metatrak", "de bank inlezen", "de cash van gisteren in Scrada zetten", of /dagverwerking oproept.'
---

# Dagverwerking — één gereden werkdag volledig afwerken

Je bent een automatiseringsassistent voor **De Ramenwassers**, een raamwasbedrijf van Geert
(deramenwassers@gmail.com). Deze taak wordt handmatig gestart, door Geert of — tijdens zijn
vakantie — door zijn vennoot, die geen computerkennis heeft.

Ze vervangt of wijzigt NIET de taken "dagelijkse-facturatie", "dagelijkse-urencontrole" of
"squeegee-ochtendrondes". Er wordt **nooit iets in Squeegee geschreven**: correcties gaan naar een
rapport dat Geert zelf overtikt.

Zes onderdelen, altijd in deze volgorde:

| Deel | Wat | Bestand met de details |
|---|---|---|
| A | Uren vergelijken: Squeegee-tijden tegenover Metatrak-stops | `references/deel-a-uren.md` |
| B | Facturenlijst aanvullen (facturenlijst.xlsm) | `references/deel-b-facturenlijst.md` |
| C | Facturen aanmaken via de API van Eenvoudig Factureren | `references/deel-c-facturen.md` |
| D | Bankverrichtingen: D1 in Excel, D2 in Eenvoudig Factureren | `references/deel-d-bank.md` |
| E | Omzet en uren per team in ingave werk.xlsm (macro) | `references/deel-e-ingave-werk.md` |
| F | Cash-ontvangsten in Scrada (kasboek) | `references/deel-f-scrada.md` |

B heeft de output van A nodig, E heeft de voertuig↔uitvoerder-koppeling uit A nodig, en F heeft de
factuurnummers uit C nodig. De rest staat los van elkaar.

**F heeft ook iets nodig dat je in A al moet vastleggen:** de betaalstatus per job. Een job die op
Paid staat terwijl de rest van de dag nog niet betaald is, is cash betaald — en dat signaal
verdwijnt zodra de betalingen geregistreerd worden. Lees `references/deel-f-scrada.md` dus vóór je
aan A begint, niet pas na C.

## Grondregel: deze taak valt nooit stil om een bevestiging te vragen

Er zit vaak niemand aan de computer. Kom je iets tegen waar je niet zeker van bent, kies dan de
veilige optie, ga verder met de rest, en zet het in het nakijkrapport. Geef ook nooit op na één
mislukte tool-oproep: probeer opnieuw, kies desnoods een andere weg, en pas als het echt niet lukt
sla je dát ene onderdeel over en ga je verder.

De enige uitzondering is de Excel-toestemming in stap 0 (die vereist nu eenmaal een klik) — en zelfs
dan werk je gewoon door met alles wat zonder Excel kan.

Waarom dit zo streng staat: elk onderdeel dat je overslaat kost Geert handwerk, maar een verkeerde
gok in een loon- of factuurbestand kost hem geld en vertrouwen. Vandaar: doorwerken waar het veilig
kan, markeren waar het niet zeker is, nooit blijven wachten.

**Geert kan geen .md-bestanden openen.** Alles wat voor hém bedoeld is, is .xlsx (in noodgeval .csv,
want dat opent ook in Excel). Zie `references/rapporten.md`.

## Stap 0 — bepaal eerst waar je draait

De werkwijze verschilt sterk naargelang de omgeving. Lees **`references/omgeving.md`** vóór je iets
anders doet; daar staat per omgeving welke tools werken, hoe je Excel-toegang vraagt en welke
valkuilen er zijn.

Kort:

- **Lokaal (Claude Code of de lokale Cowork-taak op Geerts pc)** — geen sandbox: bash, Python en
  openpyxl draaien niet. Excel bedien je via computer-use, API-calls via Claude-in-Chrome. Vraag
  METEEN als allereerste `request_access` voor `["Excel"]` met clipboardRead en clipboardWrite.
- **Cowork in de cloud** — bash en Python werken hier wél. Bestanden lees je met
  `device_stage_files` en schrijf je terug met `device_commit_files`; Excel-macro's draai je via de
  computer-use-tools op zijn toestel. Rekenwerk, coda-parsing en het bouwen van .xlsx doe je hier
  gewoon in Python (openpyxl) — dat is sneller en betrouwbaarder dan klikken.

**Tijdsregistratie:** noteer als allereerste het kloktijdstip en opnieuw vlak vóór het
afrondingsbericht. Vermeld de TOTALE DUUR altijd als eerste punt, ook bij een afgebroken run.
Lokaal lees je de klok uit met `javascript_tool` (`new Date().toString()`) in een browsertab; in de
cloud met `date` in bash.

## Welke werkdag verwerk je?

Neem NIET aan dat het "gisteren" is. Bepaal de werkdag uit de datums die effectief in het
Squeegee-rapport en de Metatrak-gegevens staan. Bij meerdere datums: de meest recente **volledige**
werkdag die in beide voorkomt. Vermeld expliciet welke datum je verwerkt.

Rijen met een "datum voltooid" van een vroegere dag horen niet bij de werkdag — laat ze overal
buiten (A, B, C en E).

- **Geen Squeegee-rapport met een recente werkdag?** Dan kan je de werkdag niet bepalen en zijn A,
  B, C en E onmogelijk. Voer enkel D1 en D2 uit, schrijf een kort rapport met de melding dat het
  Squeegee-rapport nog gedownload moet worden, en stop netjes. Blijf niet wachten.
- **Geen Metatrak-rapport?** Dan zijn A en E onmogelijk (je kent de voertuig↔uitvoerder-koppeling
  niet en kan start- en einduur niet bepalen). Voer B, C, D1 en D2 wel uit, en vraag in het
  afrondingsbericht expliciet om de CSV-export. Verzin nooit tijden of teams — het is een
  loonbestand. Vul deel B dan met de ongecorrigeerde Squeegee-tijden en zet in het nakijkrapport de
  exacte celverwijzingen (bv. `M10556`) die nadien nog aangepast moeten worden. Komt het rapport
  alsnog binnen tijdens dezelfde sessie, werk die cellen dan meteen bij.

## Bestaat er al een rapport voor die dag?

Dat betekent niet dat alles gedaan is — een vorige run kan halverwege afgebroken zijn. Stop dus niet
blindelings, maar controleer per onderdeel of het al gebeurd is:

| Deel | Controle |
|---|---|
| A | Bestaat "Aan te passen rapport [datum].xlsx/.csv" al? |
| B | Staan er in "Data Squeegee" al rijen met die datum voltooid? |
| C | Staat de werkdag in `gefactureerde_dagen.json`? |
| D1 | Loopt "Import bank" al tot en met die datum? |
| D2 | Staan de verrichtingen al in Eenvoudig Factureren? |
| E | Staat de werkdag al op het tabblad van de werknemers? |
| F | Staat de werkdag in `facturatie\scrada_cash.json` op "voltooid"? |

Doe enkel wat nog ontbreekt, overschrijf de bestaande rapporten met een bijgewerkte versie, en zet
bovenaan dat het om een herstart ging.

## Waar staat wat

Alle bestandslocaties, de vier mogelijke vormen van het Metatrak-rapport en de zoekvalkuilen staan
in **`references/bronbestanden.md`**. Lees dat voor je begint te zoeken — meer dan één run is
misgelopen door een afgekapte zoeklijst of een verkeerd verondersteld bestandsformaat.

## De zes delen

Werk ze in volgorde af en lees telkens het bijbehorende referentiebestand vóór je aan dat deel
begint. Elk bestand bevat niet alleen de stappen maar ook de fouten die eerdere runs gemaakt hebben
— die staan er niet voor de sier.

1. **Deel A — uren** (`references/deel-a-uren.md`): koppel elk voertuig aan een uitvoerder, vergelijk
   de Squeegee-tijden met de Metatrak-stops, en schrijf "Aan te passen rapport [DD-MM-JJJJ].xlsx".
2. **Deel B — facturenlijst** (`references/deel-b-facturenlijst.md`): de rijen van de werkdag in blad
   "Data Squeegee", met de gecorrigeerde tijden uit deel A.
3. **Deel C — facturen** (`references/deel-c-facturen.md`): duplicaatcontrole via het register, dan
   aanmaken via de API. Volledig automatisch, geen login, geen bevestiging.
4. **Deel D — bank** (`references/deel-d-bank.md`): D1 vult "Import bank" aan in
   "stortingen vs kosten - nieuw.xlsx", D2 leest de coda's in bij Eenvoudig Factureren. Ze gebruiken
   dezelfde coda's maar staan los van elkaar — doe ze allebei.
5. **Deel E — ingave werk** (`references/deel-e-ingave-werk.md`): per gereden voertuig één
   teamregistratie via de macro "TeamToevoegen". Dit is een loonbestand: nooit twee keer draaien,
   nooit een verdeling verzinnen.
6. **Deel F — Scrada** (`references/deel-f-scrada.md`): de cash ontvangen betalingen in het kasboek
   zetten, met factuurnummer en klantnaam. Kan pas na C. Twijfel je over een bedrag, een
   factuurnummer of over de vraag óf iets cash was: niet boeken, wel melden.

## Rapporten

Er zijn er **twee** en je schrijft ze allebei. De volledige opmaak, kolombreedtes en kleurregels
staan in **`references/rapporten.md`**.

1. **Nakijkrapport** — `Nakijken_[DD-MM-JJJJ].xlsx` in de map `rapport te bekjken - aanpassingen`
   (mét die typfout in de mapnaam). Dit is wat Geert effectief leest: een actielijst en een
   overtiklijst met de tijden voor Squeegee. Altijd .xlsx, nooit .md.
2. **Dagverwerkingsrapport** — `Dagverwerking_[DD-MM-JJJJ].md` in de cowork-map. Dit is je eigen
   verslag voor een volgende run en mag .md blijven. Meld daarin altijd wat er misging of bijna
   misging, ook als het hersteld is.

Zet nooit een API-sleutel in een van beide rapporten.

## Afronding

Kort bericht — Geert houdt niet van lange uitleg — met als allereerste punt de **totale duur**.
Daarna: welke werkdag, uren-rapport (ja/nee + aantallen per status + bestandsnaam), facturen (aantal
+ nummerreeks + afgeronde regels + nieuwe klanten + eventueel gat in de nummering + bevestiging dat
alles geverifieerd is, of "al gefactureerd volgens het register — overgeslagen"), status Import bank
(bron: Belfius-export of coda's), aantal coda's in D2 (+ banktransaction_count), aantal teams in
ingave werk, aantal cash-ontvangsten in Scrada (+ totaalbedrag, en wat er niet geboekt raakte).

Deel het **nakijkrapport (.xlsx)** met de gebruiker: lokaal met `present_files`, in Cowork met
`SendUserFile`.
