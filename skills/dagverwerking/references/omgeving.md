# Omgeving — waar draai je, en wat werkt daar?

Lees dit als eerste. De rest van de skill gaat ervan uit dat je weet welke gereedschapskist je hebt.

## Inhoud

- [Twee omgevingen](#twee-omgevingen)
- [Stap 0 lokaal — toegang tot Excel](#stap-0-lokaal--toegang-tot-excel)
- [Stap 0 in Cowork — toegang tot de mappen](#stap-0-in-cowork--toegang-tot-de-mappen)
- [Excel-bestanden: laat ze GESLOTEN staan](#excel-bestanden-laat-ze-gesloten-staan)
- [Zoeken naar bestanden (Glob-valkuil)](#zoeken-naar-bestanden-glob-valkuil)
- [Browserverbinding en API-calls](#browserverbinding-en-api-calls)
- [Werken met Excel via computer-use](#werken-met-excel-via-computer-use)

## Twee omgevingen

| | Lokaal (Claude Code / lokale Cowork-taak op de pc van Geert) | Cowork in de cloud |
|---|---|---|
| bash, Python, openpyxl | **Werken niet** ("not supported on this device") | Werken wél |
| Platte tekst / CSV / JSON lezen | Read-tool, **enkel binnen de cowork-map** | Eerst `device_stage_files`, dan Read |
| .xls / .xlsx / .xlsm lezen | Alleen via Excel (Read weigert binaire bestanden) | Stagen en met openpyxl/pandas lezen |
| PDF lezen | Niet mogelijk | Wel (pdf-skill) |
| Bestanden schrijven | Write-tool (CSV/JSON/MD) of Excel via computer-use | Lokaal bouwen, dan `device_commit_files` |
| Bestanden verplaatsen of verwijderen | **Niet mogelijk** | Verwijderen kan niet; schrijven wel |
| Excel bedienen | computer-use na `request_access(["Excel"])` | computer-use via de remote-devices-tools op zijn toestel |
| API-calls | `javascript_tool` (`fetch`) vanuit een tab op eenvoudigfactureren.be | gewoon met bash/Python (of dezelfde browserweg) |

**Vuistregel in de cloud:** doe al het reken-, parseer- en bouwwerk in Python (coda's parseren,
tijden matchen, de .xlsx-rapporten bouwen met openpyxl) en gebruik computer-use enkel voor wat écht
in Excel moet gebeuren: de macro `TeamToevoegen` van deel E en het plakken in de live werkboeken
(facturenlijst.xlsm, stortingen vs kosten).

**Vuistregel lokaal:** alles wat met .xlsx/.xlsm te maken heeft gaat via Excel en het klembord.
Moet je iets rekenen of parseren, doe dat in `javascript_tool` — dat is geen sandbox en werkt wél.

Kan je een bestand niet verplaatsen of verwijderen: schrijf het meteen op de juiste plaats. Ging het
toch mis, schrijf het dan opnieuw op de juiste plek en vraag Geert het oude weg te gooien.

## Stap 0 lokaal — toegang tot Excel

Roep **meteen** `request_access` aan voor `["Excel"]` met clipboardRead en clipboardWrite.

Krijg je "can't be approved during a scheduled run": dat is normaal bij een Run now. Er verschijnt
dan géén venster bij de gebruiker. Schrijf dan als eerste regel in het gesprek, in gewone taal:

> "Typ even 'ok' in het gesprek en klik daarna op Toestaan — anders kan ik Excel niet openen."

Ga daarna gewoon verder met de delen die Excel niet nodig hebben (C en D2). Stuurt de gebruiker
intussen een bericht, roep `request_access` dan opnieuw aan — dan werkt het wél (getest 30/07 en
31/07/2026, opnieuw bevestigd 17/08/2026) — en werk de Excel-delen alsnog af.

Blijft er niets komen: schrijf alles wat je hebt als CSV en sla B, D1 en E over met een duidelijke
melding. Probeer `request_access` nooit meer dan tweemaal. Blijf nooit wachten. Vraag toegang tot
"Verkenner" enkel als je echt een map visueel moet controleren.

## Stap 0 in Cowork — toegang tot de mappen

Vraag met `device_request_folder_access` in één keer:

- `C:\Users\Geert\OneDrive - De Ramenwassers\Documenten\De Ramenwassers\cowork`
- `C:\Users\Geert\Downloads` (voor de Metatrak- en Belfius-exports)

Voor de Excel-delen heb je daarnaast computer-use op zijn toestel nodig: eerst
`computer_resolve_access` met de app-namen, daarna `computer_request_access` met exact die
teruggegeven entries. Wordt dat niet goedgekeurd, werk dan verder met alles wat zonder Excel kan
(A-rapport, C, D2) en meld het — dezelfde grondregel als lokaal.

## Excel-bestanden: laat ze GESLOTEN staan

Anders dan de browser mogen de Excel-bestanden niet openstaan. Een bestand dat in Excel geopend is,
is vergrendeld: terugschrijven mislukt, en openpyxl leest enkel de laatst opgeslagen versie — niet
wat er op dat moment op het scherm staat. Openhouden helpt hier dus niet, het breekt de taak.

Controleer daarom voor elk bestand of er een lockfile bestaat: in dezelfde map hetzelfde bestand met
`~$` ervoor (bv. `~$Nakijken_17-08-2026.xlsx`).

- Lockfile gevonden en je moet enkel LEZEN: ga verder, maar meld in je eindbericht dat je de laatst
  opgeslagen versie gelezen hebt.
- Lockfile gevonden en je moet TERUGSCHRIJVEN: schrijf niet en maak nooit een kopie onder een andere
  naam. Mail Geert (onderwerp "CLAUDE WACHT: sluit <bestandsnaam>"), wacht zijn antwoord af en
  probeer daarna opnieuw.

**Alle toestemmingen in één keer, helemaal aan het begin.**

Vraag alle mappen samen in één `device_request_folder_access`-oproep en, indien nodig, de
computer-use apps meteen daarna — nog vóór je Squeegee of Excel aanraakt. Zo krijgt Geert al zijn
klikken in één blok aan het begin en kan hij daarna wegstappen. Kom nooit halverwege terug met een
tweede toegangsvraag als je die ook vooraf kon stellen.

## Zoeken naar bestanden (Glob-valkuil)

Glob kapt af op 100 resultaten en toont ze van OUD naar NIEUW — net de nieuwste bestanden vallen dan
weg. Daarom:

- Zoek altijd met een **smal patroon** (`*.csv`, `Rapport over beweging*`, `COD_*`), nooit met `*`
  of `**/*`.
- Concludeer nooit dat een bestand ontbreekt op basis van een afgekapte lijst.
- Zoek met **meerdere patronen** in dezelfde map voor je besluit dat er niets is: op 31/07/2026 gaf
  `Metatrak_*.csv` niets terwijl het bruikbare bestand `_opt_xena_out_*.csv` er wél stond.
- Zoek hoofdletterongevoelig. De coda's heten `.CD2` in HOOFDLETTERS; een zoektocht op `*.cd2` gaf
  nul resultaten en leidde tot de foute conclusie dat er geen coda's waren.

## Browserverbinding en API-calls

Alle API-calls doe je lokaal met `javascript_tool` (`fetch`) vanuit een tab op
eenvoudigfactureren.be.

- Gebruik altijd de **volledige URL** (`https://eenvoudigfactureren.be/api/v1/...`).
- Geef bij elke call `Accept: application/json` mee. Zonder die header kan de API XML terugsturen,
  waardoor `r.json()` faalt met `SyntaxError: Unexpected token '<'` (gebeurde 31/07/2026). Lees de
  body bij voorkeur met `await r.text()` en parse zelf met `JSON.parse`.
- Geef bij fetch-resultaten nooit de volledige body terug (wordt geblokkeerd met "BLOCKED:
  Cookie/query string data") — geef status, lengte en enkele velden.
- **Browserverbinding kwijt?** Krijg je "Browser connection is unavailable", een CDP-timeout, of
  blijft een `javascript_tool`-oproep falen: roep `tabs_context_mcp` met `createIfEmpty: true` aan,
  navigeer de nieuwe tab naar `https://eenvoudigfactureren.be/login` en voer je fetch dáár uit. Dat
  lost het op (getest 30/07/2026). Een verse tab lost ook vastgelopen pagina's op. Dit is nooit een
  reden om deel C of D2 te laten vallen.
- De sleutel werkt ook als de browser **uitgelogd** is — een inlogscherm is dus geen reden om deel C
  over te slaan. Log nooit zelf in en typ nooit een wachtwoord.

## Werken met Excel via computer-use

Deze regels zijn stuk voor stuk uit een misgelopen run gegroeid. Ze kosten enkele seconden en
besparen een hersteloperatie in een financieel bestand.

**Vooraf en navigeren**

- Weet vóór je klikt wat je gaat doen: lezen = 1× klikken en niet typen; schrijven = via
  clipboard-paste.
- Een bestand open je het betrouwbaarst via Ctrl+O en dan het bestand in de "Recent"-lijst. Klik
  precies op de bestandsNAAM, wacht lang genoeg (grote bestanden nemen 20-40 s) en controleer in de
  titelbalk dat het juiste bestand open staat — de lijst herschikt zich. Maximaliseer het venster
  (dubbelklik op de titelbalk) vóór je met coördinaten werkt.
- `open_application "Excel"` opent vaak een nieuw leeg venster (Map1) in plaats van terug te keren
  naar het geopende bestand. Merk je dat: maximaliseer, open het bestand opnieuw via Ctrl+O, en
  controleer of je vorige wijziging bewaard is.
- Krijg je "The desktop shell is frontmost" bij een klik: roep `open_application "Excel"` aan en
  klik opnieuw.
- **Navigeer altijd met Ctrl+G, nooit door op de Naam-box te klikken** — een gemiste klik typt je
  celverwijzing als tekst in de geselecteerde cel. Verifieer na het navigeren met een zoom op de
  Naam-box.
- Bij samengevoegde cellen of tekstterugloop kan het rijnummer op het scherm afwijken — zoom eerst
  in op de rij zelf.

**Vóór elke plakactie**

Controleer niet alleen de cel maar ook het **blad**. Een klik op een tabblad pakt niet altijd, en
Ctrl+G brengt je dan naar de juiste cel op het verkeerde blad. Neem een schermafbeelding en herken
het blad aan zijn titel. Op 30/07/2026 belandde een blok van 97 rijen daardoor in het blad "Regels".

**Typen**

De `type`-actie gebruikt voor tekst **met spaties** het klembord in plaats van echte toetsaanslagen,
en plakt soms de vórige klembordinhoud. Op 31/07/2026 belandde daardoor een hele tabel in het
hernoemveld van een tabblad, waardoor er vier extra bladen ontstonden. **Zet daarom vóór elke
`type`-actie met spaties de gewenste tekst eerst met `write_clipboard` op het klembord.** Korte
teksten zonder spaties ("40", "7:30") worden wel letterlijk getypt en zijn veilig.

**Opmaak**

- De knop "Opmaak" in het lint (groep Cellen) reageert **niet** op een klik. Gebruik voor
  kolombreedte en rijhoogte altijd de rechtermuisknop op de kolom- of rijKOP → "Kolombreedte..." /
  "Rijhoogte...". Het menu-item staat ongeveer 36 px rechts en 142 px onder de klik. Werk bij
  kolommen van RECHTS naar LINKS, dan verschuiven de kolommen die je nog moet doen niet.
- "Rijhoogte AutoAanpassen" is niet beschikbaar. Zet na het aanzetten van tekstterugloop een vaste
  rijhoogte (75 is ruim genoeg voor lange teksten).
- Een tabblad hernoem je met rechtsklik op de tab → "Naam wijzigen" → Ctrl+A → Ctrl+V (naam vooraf
  op het klembord) → Enter. Dubbelklikken op de tab is onbetrouwbaar.
- Opvulkleur en randen: knoppen op het Start-tabblad. Het verfemmertje "Opvulkleur" staat rond
  x=187 y=61 (klik op het pijltje ernaast, ~x=196, voor het palet); de randen-knop rond x=165 y=61
  (pijltje ~x=172). Neem na het openen van een palet altijd een screenshot en zoom in vóór je een
  kleur aanklikt — de paletposities verschuiven met de vensterbreedte.
- Opslaan onder een nieuwe naam: Ctrl+S → "Meer opties..." → in de linkerkolom "Bladeren" → in het
  klassieke dialoog het volledige pad in het veld Bestandsnaam plakken en Enter. Het volledige pad
  in het vereenvoudigde opslagvenster typen werkt NIET ("Deze naam is niet geldig").

**Na elke schrijfactie**

- Selecteer 1 cel en lees de formulebalk af via zoom. Bij iets onverwachts eerst een verse
  screenshot nemen.
- Ging er iets mis: Ctrl+Z herhalen tot álles weg is, daarna expliciet controleren dat het
  oorspronkelijke einde van het blad hersteld is (Ctrl+End), en dit **altijd** melden — ook als het
  hersteld is.
- Sluit een bestand bewust af ("Niet opslaan" bij twijfel).

**Twee dingen om nooit te vergeten**

- **Decimalen: dit werkboek gebruikt de komma.** Typ bedragen altijd als "522,08", nooit "522.08".
  Een punt geeft een ×100-fout in een loon- of omzetveld.
- Is Geert zelf in een bestand aan het werken (je ziet zijn selectie of een filter bewegen): neem de
  muis niet over. Meld het en werk verder aan iets anders. Werkt hij in een ánder programma
  (browser, Squeegee), dan mag je gewoon in Excel doorwerken.
