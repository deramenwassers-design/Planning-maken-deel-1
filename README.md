# Planning maken deel 1 — automatisering bevestigingen

De wekelijkse bevestigingen van klanten automatisch opvolgen, zodat Geert in één oogopslag ziet
wie bevestigd heeft, wie nog actie vraagt en wie afgemeld heeft.

Gebouwd naar de blauwdruk `Blauwdruk planning maken deel 1.md` uit de Google Drive-map
"Claude opdrachten".

## Drie losse skills

Bewust drie aparte skills, geen geheel. Elk onderdeel heeft zijn eigen moment en zijn eigen
planning, en zo blijven de andere twee gewoon draaien als er ergens iets hapert — bijvoorbeeld een
weggevallen sms-koppeling.

| Skill | Wanneer | Wat |
|---|---|---|
| [`bevestigingen-lijst`](.claude/skills/bevestigingen-lijst/SKILL.md) | vrijdagnacht | Trekt de klanten van de komende week uit Squeegee en zet ze als Excel in Drive. |
| [`bevestigingen-opvolgen`](.claude/skills/bevestigingen-opvolgen/SKILL.md) | elk uur vanaf maandag 6u | Vergelijkt de lijst met de antwoorden in Gmail en sms, zet de tekens, houdt een overzicht in de mailbox. |
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
| `✅` | positief, gewoon in te plannen | niets meer te doen |
| `☒` | positief, maar er is nog actie nodig | inhoud van mail/sms gaat ook in de klantnotitie in Squeegee |
| `❌` | overslaan, opschuiven of afgemeld | niet inplannen |
| leeg | nog geen antwoord | krijgt maandag 8u30 een herinnering |

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
| `bevestigingen-opvolgen` | elk uur, 6u-21u, ma t/m vr | `0 4-19 * * 1-5` |
| `bevestigingen-herinnering` | maandag 8u30 | `30 6 * * 1` |

De blauwdruk zegt "vanaf maandag 6u, elk uur" zonder einduur. Hierboven staat 6u tot 21u van
maandag tot vrijdag; antwoorden komen de hele week binnen, dus de opvolging loopt de hele week
door. Wil je dat anders, pas het cron-schema aan — de skills zelf hoeven daar niet voor te
wijzigen.

Let op de zomertijd: in de winter (UTC+1) wordt het `30 22 * * 5`, `0 5-20 * * 1-5` en
`30 7 * * 1`.

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
