# Planning maken deel 1 — automatisering bevestigingen

De wekelijkse bevestigingen van klanten automatisch opvolgen, zodat Geert in één oogopslag ziet
wie bevestigd heeft, wie nog actie vraagt en wie afgemeld heeft.

Gebouwd naar de blauwdruk `Blauwdruk planning maken deel 1.md` uit de Google Drive-map
"Claude opdrachten".

## Drie losse skills

Bewust drie aparte skills, geen geheel. Elk onderdeel heeft zijn eigen moment en zijn eigen
planning, en zo blijven de andere twee gewoon draaien als er ergens iets hapert — bijvoorbeeld een
weggevallen sms-koppeling.

Het ritme van het bedrijf bepaalt de momenten. **Op vrijdag stuurt Geert vanuit Squeegee zelf de
bevestigingsvragen in bulk**, voor de week die tien dagen later begint — op vrijdag 21 augustus
gingen zo de vragen buiten voor de week van maandag 31 augustus. Dat eerste bericht maakt geen
deel uit van deze skills; alles hier hangt erachter.

| Skill | Wanneer | Wat |
|---|---|---|
| [`bevestigingen-lijst`](.claude/skills/bevestigingen-lijst/SKILL.md) | vrijdagnacht, na de bulk | Trekt de klanten van de week die tien dagen later begint uit Squeegee en zet ze als Excel in Drive. Iedereen op ❓. |
| [`bevestigingen-opvolgen`](.claude/skills/bevestigingen-opvolgen/SKILL.md) | elk uur, vanaf diezelfde vrijdag | Vergelijkt de lijst met de antwoorden in Gmail en sms, zet de tekens, houdt een overzicht in de mailbox. |
| [`bevestigingen-herinnering`](.claude/skills/bevestigingen-herinnering/SKILL.md) | maandag 8u30 | Stuurt een tweede mail naar wie nog niet geantwoord heeft. |

Ze praten niet rechtstreeks met elkaar. Ze delen één ding: het weeklijstbestand. Dat contract staat
in [`docs/lijstbestand.md`](docs/lijstbestand.md) — wijzigt daar iets, dan moeten alle drie de
skills mee.

```
bevestigingen-lijst  ──schrijft──▶  Bevestigingen_2026-W35.xlsx  ◀──leest/schrijft──  bevestigingen-opvolgen
                                              ▲
                                              └──leest/schrijft──  bevestigingen-herinnering
```

## De tekens in de lijst

| Teken | Betekenis | Gevolg |
|---|---|---|
| `✅` | klant bevestigt, verder niets te doen | gewoon inplannen |
| `❌` | klant wil niet gewassen worden | niet inplannen |
| `❎` | klant bevestigt, maar er is actie nodig van Geert | Geert bekijkt het antwoord |
| `❓` | klant heeft nog niet geantwoord | krijgt een herinnering |

Hetzelfde teken staat achter de klantnaam in Squeegee, zodat het in de werkplanner zichtbaar is.
Het antwoord zelf komt in de notitie van de job.

## Installeren

De skills staan in `.claude/skills/`, dus in een Claude Code-sessie in deze map werken ze meteen.
Om ze overal beschikbaar te maken (ook in Cowork en in de geplande taken), zet je ze bij de andere
persoonlijke skills:

```bash
cp -r .claude/skills/bevestigingen-* ~/.claude/skills/
```

Of, als je met de gesynchroniseerde skills werkt, langs dezelfde weg als `dagverwerking` en
`squeegee-tijden`, zodat ze mee opgepikt worden in `~/.claude/skills/synced/`.

## Manueel starten

In een gesprek: `/bevestigingen-lijst`, `/bevestigingen-opvolgen`, `/bevestigingen-herinnering`.
Of gewoon in woorden: "trek de lijst van volgende week", "kijk na wie er al bevestigd heeft",
"stuur de herinneringen".

Van onderweg, via het menukaartjes-mechanisme. De drie kaartjes staan al in de Drive-map
"Claude opdrachten", naast `_dagverwerking` en `_squeegee-tijden`:

- `_bevestigingen-lijst volgende week.txt`
- `_bevestigingen-opvolgen deze week.txt`
- `_bevestigingen-herinnering deze week.txt`

Een kopie maken van zo'n kaartje start de taak. De bronbestanden staan in
[`opdrachtkaartjes/`](opdrachtkaartjes/) — pas je er iets aan, vervang dan ook het kaartje in Drive.

De submap `bevestigingen` in "Claude opdrachten" is aangemaakt; daar komen de weeklijsten in.

## Automatisch laten draaien

De momenten uit de blauwdruk, in UTC (België staat in de zomer op UTC+2):

| Skill | Belgische tijd | Cron (UTC) |
|---|---|---|
| `bevestigingen-lijst` | vrijdag 23u30 | `30 21 * * 5` |
| `bevestigingen-opvolgen` | elk uur, 6u-21u, alle dagen | `0 4-19 * * *` |
| `bevestigingen-herinnering` | maandag 8u30 | `30 6 * * 1` |

De blauwdruk zegt "vanaf maandag 6u, elk uur" zonder einduur. Dat bleek te laat: de bulk gaat op
vrijdag buiten, dus de eerste antwoorden komen tien dagen vóór die maandag toe. Vandaar 6u tot 21u,
alle dagen. Wil je dat anders, pas het cron-schema aan — de skills zelf hoeven daar niet voor te
wijzigen.

Let op de zomertijd: in de winter (UTC+1) wordt het `30 22 * * 5`, `0 5-20 * * 1-5` en
`30 7 * * 1`.

## De skills op de pc krijgen

De skills leven in deze repo, maar de taken draaien op de pc van Geert — en daar stonden ze niet.
Bij de eerste run bleek dat: het logboek meldde dat `bevestigingen-lijst` daar niet bestond en de
lokale Claude heeft het werk gedaan op basis van de opdrachtbeschrijving alleen. Dat liep goed af,
maar het is niet herhaalbaar.

Daarom staan de SKILL.md-bestanden nu ook in Drive, in
**Claude opdrachten → installatie → skills bevestigingen**, met een menukaartje
`_installeer de bevestigingen-skills.txt` dat ze op de juiste plaats zet. Daar staat ook
`squeegee-nawerk AANVULLING.md`: geen vervangend bestand, maar één alinea die aan de bestaande
skill toegevoegd moet worden zodat het opschonen de bevestigingstekens laat staan.

Wijzig je een skill in deze repo, dan moet je het bestand in Drive mee vervangen en het kaartje
opnieuw laten lopen — anders draait de pc op de oude versie. Het kaartje is bewust herhaalbaar:
het overschrijft gewoon wat er staat.

## Wat er nog nagekeken moet worden

Twee dingen in de skills volgen het patroon van de bestaande Squeegee-skills, maar zijn nog niet
in een begeleide run bevestigd. Laat de eerste keer meelopen:

1. **Het klantnotitieveld in Squeegee** (`bevestigingen-opvolgen`, STAP 4). Het pad
   job → klantfiche → ⋮ → Klant bewerken → notitieveld is afgeleid van de andere skills. Wijkt het
   scherm af, dan past de skill niets aan en meldt ze het — werk het klikpad dan bij.
2. **De dienstomschrijving op de jobkaart** (`bevestigingen-lijst`, STAP 3). Die kolom bepaalt de
   tekst van de herinneringsmail. Kijk bij de eerste lijst na of er iets bruikbaars in staat
   ("Ramen wassen", "Zonnepanelen poetsen") en niet enkel een prijs of een adres.

En één afweging die het waard is om te weten: de Drive-tools kunnen de inhoud van een bestaand
bestand niet wijzigen. Bijwerken gebeurt daarom door een nieuw bestand met dezelfde naam te
uploaden en het oude naar de prullenbak te zetten. Blijkt de Drive-map ook lokaal op de pc
gesynchroniseerd te staan, dan is rechtstreeks bewerken met openpyxl beter — dat is een kleine
aanpassing in STAP 5 van `bevestigingen-opvolgen` en STAP 4 van `bevestigingen-herinnering`.

## Het opdrachtenbord

Eén pagina om alle taken te starten vanaf de gsm:
**https://claude.ai/code/artifact/06f9ca0b-929c-4a42-9b31-1847e98de982**

De bron staat in [`artifact/opdrachtenbord.html`](artifact/opdrachtenbord.html). Republiceren gaat
met de Artifact-tool op datzelfde bestandspad, of vanuit een ander gesprek met de URL hierboven als
`url` — dan blijft de link dezelfde.

De Start-knop roept de Google Drive-connector van de kijker aan (`copy_file`) en zet een kopie van
het bijhorende menukaartje in "Claude opdrachten".

Onder "Laatste opdrachten" toont de pagina hoe het met de recente taken afloopt. Ze leest daarvoor
rechtstreeks de map `log`: `search_files` op de logboeken van de laatste 24 uur, en
`download_file_content` om elk uit te lezen. Een logboek zonder `Einde`-blok betekent bezig; met
`Exitcode : 0` klaar; met een ander getal misgelopen. Ze kijkt elke 45 seconden opnieuw zolang de pagina in beeld staat.

Bewust niet op `localStorage` gebaseerd: dan zie je enkel wat je op dát toestel gestart hebt, en
niets van een taak die vanaf de pc of van vroeger liep. `localStorage` dient nu alleen nog als
geheugen voor afgelopen logboeken, want die veranderen niet meer — dat scheelt downloads. De pc pikt die kopie op, net zoals bij een kopie
die met de hand gemaakt is. De bestandsnaam is bewerkbaar op de pagina, want die naam ís de
opdracht.

Bestands-id's staan hard in de pagina. Vervang je een menukaartje in Drive (een nieuw bestand krijgt
een nieuw id), werk dan ook `OPDRACHTEN` in het artifact bij.

Let op: het bord is intussen ook vanuit andere gesprekken bijgewerkt (de knop "Cash naar Scrada",
de ziektemelding, de nieuwe planningsberichten). `artifact/opdrachtenbord.html` is daarom opnieuw
opgehaald uit het live artifact, zodat de repo weer gelijkloopt met wat er echt draait. Publiceer
altijd vanuit dat bestand, met de URL hierboven als `url`.

## Looptijden

Een tweede pagina, voor het kijken in plaats van het starten:
**https://claude.ai/code/artifact/340b4af8-d38b-4058-be66-e8a61382954c**
(bron: [`artifact/looptijden.html`](artifact/looptijden.html))

Ze leest dezelfde map `log` als het opdrachtenbord, maar over een langere periode (7, 14 of 30
dagen) en met een andere vraag: hoe lang duren de taken?

- **Nu bezig** — elke taak zonder `Einde`-blok krijgt een klok die per seconde meeloopt, met
  ernaast wat die taak normaal doet. Loopt hij over die tijd heen, dan kleurt de klok en zegt de
  pagina hoeveel keer de gewone looptijd het intussen is. Een logboek dat na twaalf uur nog altijd
  geen slot heeft, telt niet meer als bezig maar als afgebroken.
- **Per taak** — de runs worden gegroepeerd op soort (de datum en het weeknummer gaan uit de naam),
  met de mediaan als "typisch", de snelste en de traagste, en de totale tijd van die periode.
  Gesorteerd van traag naar snel, zodat de zware taken bovenaan staan.
- **Per dagdeel** — binnen elke taak de mediaan per dagdeel (nacht, ochtend, namiddag, avond). Zijn
  er twee dagdelen met elk minstens twee runs en scheelt het meer dan een kwart, dan zegt de pagina
  het in één zin: "'s namiddags duurt hij ongeveer 1,4× zo lang als 's ochtends."
- **Alle runs** — per dag, met een staaf per run en de exitcode erbij als er iets misliep.

Twee dingen om te weten bij het lezen. Runs die misliepen tellen niet mee in het typische cijfer:
ze stoppen vroeg en zouden de taak sneller doen lijken dan hij is. En van logboeken die nog niet
gelezen zijn (bij een lange periode leest de pagina er hoogstens zestig per beurt) wordt de
looptijd geschat uit het verschil tussen aanmaak- en wijzigingstijd van het bestand; die staan
gemerkt als "geschat" en scheelt seconden, geen minuten. Wat afgelopen is, wordt onthouden in de
browser — een logboek van een afgelopen run verandert toch nooit meer.
