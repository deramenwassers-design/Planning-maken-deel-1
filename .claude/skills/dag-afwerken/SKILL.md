---
name: dag-afwerken
description: '⭐ dag-afwerken (alles in 1 keer) — draait met één commando de vier taken van een gereden werkdag na elkaar in vaste volgorde: 1. klantnamen opschonen, 2. dagverwerking, 3. tijden overzetten naar Squeegee, 4. betalingen aanduiden. Eén toestemmingsblok aan het begin, één eindbericht en één mail achteraf. Gebruik deze skill wanneer Geert vraagt om "doe alles van gisteren", "de hele dag afwerken", "alles in 1 keer", "de volledige nawerking", "alles achter mekaar", of /dag-afwerken oproept.'
---

# Dag afwerken — de vier taken achter mekaar, met één commando

Je bent een automatiseringsassistent voor **De Ramenwassers**, het raamwasbedrijf van Geert
(deramenwassers@gmail.com). Deze skill voert zelf geen nieuw werk uit: ze **dirigeert de vier
bestaande skills** in de juiste volgorde voor **één werkdag**, zorgt dat Geert maar één keer moet
klikken, en levert op het einde één rapport.

Antwoord in het Nederlands zoals in België gesproken: gemoedelijk, concreet, kort, weinig vetgedrukt.

## De vier stappen — altijd in deze volgorde

| # | Stap | Welke skill | Wat ze doet |
|---|---|---|---|
| 1 | Klantnamen opschonen | `squeegee-nawerk` — **enkel bewerking A** | rommel achter de klantnamen in Squeegee weghalen |
| 2 | Dagverwerking | `dagverwerking` — **de vijf delen A t/m E** | uren vergelijken, facturenlijst, facturen, bank, ingave werk + de rapporten |
| 3 | Tijden overzetten | `squeegee-tijden` | de tijden uit `Nakijken_[datum].xlsx` in Squeegee zetten |
| 4 | Betalingen aanduiden | `squeegee-nawerk` — **enkel bewerking B** | de gefactureerde jobs als betaald registreren |

Waarom net die volgorde (niet zelf omgooien):

- **1 vóór 2**: de facturen van stap 2 dragen de klantnaam. Eerst opschonen betekent propere namen
  op de facturen in plaats van "Mieke Geuens 🧽 50€".
- **2 vóór 3**: stap 3 leest het rapport `Nakijken_[DD-MM-JJJJ].xlsx` dat stap 2 net geschreven heeft.
  Zonder stap 2 bestaat dat bestand niet.
- **2 vóór 4**: je kan een betaling pas registreren op een factuur die bestaat. Stap 2 deel C maakt
  die facturen aan.

## Hoe je de deelskills oproept

Roep elke stap **effectief op als skill** (Skill-tool: `squeegee-nawerk`, `dagverwerking`,
`squeegee-tijden`) en volg haar instructies **volledig en letterlijk**. Deze skill herhaalt hun
inhoud niet en vervangt ze niet — ze regelt enkel volgorde, gedeelde context en foutafhandeling.

Spreken deze skill en een deelskill elkaar tegen:

- over **volgorde, toestemmingen, wanneer je stopt en het eindbericht** → deze skill wint;
- over **de werkwijze bínnen een stap** (klikpaden, formules, bestandslocaties) → de deelskill wint.

Geef bij het oproepen altijd expliciet mee: **welke datum** en **welke bewerking** (bv. "van
19-08-2026 enkel bewerking A, klantnamen opschonen — geen betalingen").

## Grondregel: deze taak valt nooit stil om een bevestiging te vragen

Er zit vaak niemand aan de computer, en deze run duurt lang. Dus:

- Vraag **nooit** tussen twee stappen "zal ik verdergaan?". Alle vier de stappen zijn vooraf
  goedgekeurd; je gaat automatisch door naar de volgende.
- Loopt een stap vast of mislukt hij? **Sla die stap af, noteer waarom, en ga naar de volgende.**
  Eén mislukte stap mag de andere drie nooit tegenhouden.
- Geef nooit op na één mislukte tool-oproep: opnieuw proberen, desnoods langs een andere weg, en pas
  dan overslaan.
- Stuur **geen tussentijdse mails** per stap. Eén mail op het einde (zie Afronding). De enige
  uitzondering is een `CLAUDE WACHT`-mail wanneer een deelskill die verplicht (bv. een Excel-bestand
  dat openstaat en dat Geert moet sluiten) — die stuur je meteen, en je werkt daarna gewoon verder
  met de rest.

## Stap 0 — eerst dit, in deze volgorde

Doe dit vóór je stap 1 opent. Doel: Geert klikt alles in één blok aan het begin weg en kan daarna
wegstappen.

1. **Noteer het kloktijdstip** (lokaal: `javascript_tool` met `new Date().toString()`; in de cloud:
   `date` in bash). Je hebt het nodig voor de totale duur.
2. **Bepaal de werkdag — één keer, voor alle vier de stappen.**
   - Geeft Geert een dag mee ("doe alles van maandag" / "van 19 augustus"), neem die.
   - Zo niet: neem NIET automatisch "gisteren", maar bepaal de meest recente **volledige** werkdag
     zoals `dagverwerking` het voorschrijft (uit de datums in het Squeegee-rapport én de
     Metatrak-gegevens).
   - Vermeld in je eerste zin welke datum je verwerkt, in het formaat `DD-MM-JJJJ`, en gebruik
     exact diezelfde datum in alle vier de stappen. Nooit halverwege van dag wisselen.
3. **Vraag alle toegang in één blok**, nog vóór je Squeegee of Excel aanraakt:
   - lokaal: `request_access` voor `["Excel"]` met clipboardRead en clipboardWrite;
   - in Cowork: één `device_request_folder_access` met **alle** mappen die de vier stappen samen
     nodig hebben (de cowork-map, `C:\Users\Geert\Downloads` én `C:\Users\Geert\squeegee-automation`),
     daarna `computer_resolve_access` + `computer_request_access` voor Excel.
   - Krijg je "can't be approved during a scheduled run": schrijf in gewone taal in het gesprek dat
     hij even "ok" moet typen en dan op Toestaan klikken, en werk intussen door met alles wat zonder
     Excel kan. Probeer `request_access` nooit meer dan twee keer. Blijf nooit wachten.
4. **Chrome klaarzetten**: laad de browsertools in één ToolSearch-oproep, kijk met `tabs_context_mcp`
   of er al een `sqgee.com`-tab openstaat en hergebruik die (nooit blind een nieuwe tab openen — een
   verse tab kost 30-60 s cloudsync), en zet meteen de **wake lock** zoals in `squeegee-nawerk`
   stap 0B. Je zet die één keer, in stap 0, en niet opnieuw bij elke deelskill.
5. **Controleer het venster**: `JSON.stringify({b:window.innerWidth,z:document.visibilityState})`.
   Smaller dan ~1300 px of niet "visible" → vraag hem het Chrome-venster te maximaliseren en zo te
   laten staan. Bij een smal venster valt de drie-puntjesknop van de klantkaart buiten beeld en zijn
   stap 1, 3 en 4 onmogelijk.
6. **Excel-bestanden moeten GESLOTEN staan** (browser net wél open). Controleer op lockfiles (`~$`
   ervoor). Enkel lezen mag met een lockfile; terugschrijven niet — dan mail je
   `CLAUDE WACHT: sluit <bestandsnaam>` en ga je verder met de rest.

7. **Kijk na wat er van deze dag al gebeurd is.** Er kan al iets gedaan zijn — door jou in een
   vorige run, of door Geert met de losse knoppen. Doe daarom nooit blind alles opnieuw. Elke stap
   heeft een eigen controle; gebruik ze, en zet in het eindbericht wat je overgeslagen hebt.

| Stap | Waar je kijkt of het al gebeurd is | Wat je doet als het er al staat |
|---|---|---|
| 1 namen | de naam in de dagplanning zelf: staat er enkel naam + haakjes + de drie emoji's? | die klant niet openen |
| 2 dagverwerking | **per deel**, volgens de herstarttabel in `dagverwerking` (deel A t/m E hebben elk hun eigen controle) | enkel de delen doen die nog ontbreken |
| 3 tijden | kolom "In Squeegee gezet" in `Nakijken_[datum].xlsx` | die rij overslaan |
| 4 betalingen | de job staat in Squeegee al op "Paid" | die job overslaan |

Het gevaarlijkste onderdeel is **deel E van de dagverwerking** (`ingave werk.xlsm`): dat is een
loonbestand, en een tweede registratie betekent dubbel loon. Controleer daar altijd eerst of de
werkdag al op het tabblad van de werknemers staat, en draai de macro niet opnieuw als ze er staat.
Ook deel B (rijen in de facturenlijst) en D1 (rijen in "Import bank") mogen niet twee keer.

Houd vanaf hier een **lopende samenvatting** bij (per stap: gelukt / deels / overgeslagen + reden).
Die heb je op het einde nodig; je gaat de stappen niet opnieuw doorlopen om het te reconstrueren.

## Stap 1 — klantnamen opschonen

Roep `squeegee-nawerk` op voor de gekozen datum, **enkel bewerking A**. Uitdrukkelijk géén
betalingen: die komen pas in stap 4, als de facturen bestaan.

Doorgeven naar de volgende stappen: de lijst **"van → naar"** van elke opgeschoonde klant, en de
klanten die bij "zelf bekijken" belandden.

**Bruggetje naar stap 2 (belangrijk):** het Squeegee-facturatierapport (de .csv) is meestal
geëxporteerd *vóór* deze opschoning en bevat dus nog de oude namen. Kom je in stap 2 een klantnaam
tegen die in jouw "van → naar"-lijst staat, gebruik dan de **opgeschoonde** variant voor de
facturenlijst en de factuur. Gebruik enkel je eigen lijst uit stap 1 — ga in stap 2 geen namen
opschonen die je in stap 1 niet beoordeeld hebt.

Mislukt stap 1 helemaal (geen browser, venster te smal, Squeegee niet bereikbaar)? Noteer het, en ga
gewoon naar stap 2 — die heeft de opschoning niet nodig, de facturen dragen dan alleen de oude namen.

## Stap 2 — dagverwerking

Roep `dagverwerking` op voor dezelfde datum en laat die skill haar volledige werk doen: delen A t/m
E plus de twee rapporten.

- Toestemmingen heb je in stap 0 al gevraagd — vraag ze **niet** opnieuw.
- Bestaat er al een rapport voor die dag, dan volg je haar herstartlogica (per deel nakijken wat al
  gebeurd is), niet blindelings overdoen. `ingave werk.xlsm` (deel E) is een loonbestand: nooit twee
  keer dezelfde dag toevoegen.
- Deze stap neemt Excel over met de muis. Laat Geert weten dat hij intussen best van de pc blijft;
  ziet de skill zijn selectie of filter bewegen, dan neemt ze de muis niet over en meldt ze dat.

**Bruggetje naar stap 3 (belangrijk bij een herstart):** bestaat `Nakijken_[DD-MM-JJJJ].xlsx` al en
staan er in het tabblad "Tijden voor Squeegee" rijen met "aangepast in Squeegee" in de kolom
"In Squeegee gezet"? Noteer die rijen dan **vóór** de dagverwerking het rapport overschrijft, en zet
die markeringen daarna in het nieuwe rapport terug. Doe je dat niet, dan lijkt in stap 3 alles nog
open en tik je tijden over die er al in staan.

Onthoud voor de volgende stappen:

- het **pad en de naam van het nakijkrapport** (`Nakijken_[DD-MM-JJJJ].xlsx`) → nodig voor stap 3;
- of **deel C (facturen)** gelukt is en welke jobs gefactureerd zijn → nodig voor stap 4.

## Stap 3 — tijden overzetten

Roep `squeegee-tijden` op voor dezelfde datum, met het rapport uit stap 2 als bron.

- Is `Nakijken_[DD-MM-JJJJ].xlsx` er niet (deel A van stap 2 mislukt, of geen Metatrak-rapport)? Dan
  **kan** stap 3 niet: sla ze over, zet in het eindbericht dat de Metatrak-export ontbreekt, en ga
  door naar stap 4.
- Staat het rapport al vol met "aangepast in Squeegee" (herstart), dan slaat de skill die rijen zelf
  over — dubbel werk is uitgesloten.
- Deze stap schrijft achteraf terug naar het rapport. Staat dat bestand intussen open in Excel, dan
  wordt er niet geforceerd: bestand afleveren in het gesprek en melden.

## Stap 4 — betalingen aanduiden

Roep `squeegee-nawerk` op voor dezelfde datum, **enkel bewerking B**. Uitdrukkelijk géén tweede
naamopschoning — die is in stap 1 gebeurd.

- Is deel C van stap 2 niet gelukt (geen facturen aangemaakt, API-sleutel geweigerd)? Dan is er niets
  om te betalen: sla stap 4 over en meld het. Registreer **nooit** een betaling op een job die niet
  gefactureerd is.
- Hou de tijdslimiet van ~10 minuten aan uit de deelskill. Jobs die niet lukken: overslaan en
  vermelden als "nog manueel te registreren" — dat blokkeert niets en veroorzaakt geen dubbele
  facturatie.

## Wat als een stap faalt — samengevat

| Gefaalde stap | Gevolg voor de rest |
|---|---|
| 1 (namen) | 2, 3 en 4 lopen gewoon door; facturen dragen de oude namen |
| 2 volledig | 3 kan niet (geen rapport) en 4 kan niet (geen facturen) → beide overslaan en melden |
| 2 deel A of Metatrak ontbreekt | 3 overslaan; 4 loopt wel door als deel C gelukt is |
| 2 deel C (facturen) | 4 overslaan; 3 loopt wel door |
| 3 (tijden) | 4 loopt gewoon door |
| 4 (betalingen) | niets meer na; gewoon vermelden |

Kortom: **er is geen enkele reden om de hele run af te breken.** Ga altijd door tot en met stap 4.

## Twee keer draaien op dezelfde dag

Dat mag en is veilig: geen enkele stap begint met wissen of overschrijven van werk dat al gedaan is,
en elke deelskill herkent haar eigen werk (zie de tabel in stap 0). Een opgeschoonde naam ziet er
proper uit en wordt niet meer geopend, `gefactureerde_dagen.json` blokkeert een tweede factuur voor
dezelfde dag, een coda die al ingelezen is wordt niet nog eens ingelezen, een rij met "aangepast in
Squeegee" wordt overgeslagen, en een job die op "Paid" staat krijgt geen tweede betaling.

Wat je daarbij niet mag doen:

- **de controle overslaan omdat "het toch snel gaat"** — bij deel B, D1 en E kost een tweede
  doorloop geld, geen tijd;
- **een deel opnieuw draaien omdat je niet zeker bent** — ben je niet zeker of het al gebeurd is,
  ga dan kijken; kan je het niet vaststellen, sla het over en zet het in het eindbericht bij
  "zelf nakijken". Bij een loon- of bankbestand is niets doen altijd beter dan het dubbel doen.

Zeg in je eindbericht kort wat je overgeslagen hebt omdat het al gebeurd was. Dat is geen ruis:
zo weet Geert dat de knop tweemaal indrukken niets kapotmaakt.

## Afronding — één bericht, één mail

Zet pas op het einde alles samen. Kort, in het Nederlands, geen opsomming van alles wat al klopte:

1. **Totale duur** (kloktijd nu min de kloktijd uit stap 0) en **welke werkdag** je verwerkt hebt.
2. Per stap één blokje van enkele regels:
   - **namen**: hoeveel jobs beoordeeld, de lijst "van → naar", wie hij zelf moet bekijken;
   - **dagverwerking**: uren-rapport (aantallen per status), facturen (aantal + nummerreeks + nieuwe
     klanten), Import bank, aantal coda's, aantal teams in ingave werk;
   - **tijden**: per ingevulde job "klant — was — wordt", plus wat niet lukte;
   - **betalingen**: hoeveel geregistreerd, welke nog manueel moeten.
3. Wat je **overgeslagen** hebt omdat het al gebeurd was, en wat **niet** gelukt is — met de reden
   en wat hij daarvoor zelf moet doen.
4. Deel het **nakijkrapport (.xlsx)** met hem: lokaal met `present_files`, in Cowork met
   `SendUserFile`. Geert kan geen .md-bestanden openen.
5. **Mail** (verplicht — pushmeldingen komen bij hem niet aan, enkel e-mail geeft geluid op zijn gsm):
   `mcp__Gmail__send_message` met onderwerp `CLAUDE KLAAR: dag <DD-MM-JJJJ> volledig afgewerkt` en
   dezelfde samenvatting in het kort. Nooit naar de gekoppelde mailbox zelf: is
   `deramenwassers@gmail.com` gekoppeld, mail dan naar `geertensanne@gmail.com`, en omgekeerd.
   Label die mail daarna met "Claude wacht" + `IMPORTANT`; lukt het labelen niet, laat het en ga verder.

Zet nooit een API-sleutel in een rapport, een bericht of een mail.
