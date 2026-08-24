# Scrada-kasboek — cash-ontvangsten noteren

Deze map bevat twee skills voor De Ramenwassers:

| Map | Wat |
|---|---|
| `skills/scrada-kasboek/` | **Nieuw.** Zet de cash ontvangen betalingen van één werkdag in Scrada (scrada.be), met factuurnummer en klantnaam. |
| `skills/dagverwerking/` | **Aangepast.** Dezelfde skill als voordien, met een extra **deel F** dat de cash-ontvangsten meepakt. |

## Installeren

Beide mappen zijn volledige skills. Laad ze op bij je skills (dezelfde weg als waarlangs
`dagverwerking` en `squeegee-nawerk` er nu staan). De aangepaste `dagverwerking` **vervangt** de
bestaande — het is geen tweede skill.

## Wat er nog moet gebeuren voor het echt draait

Drie dingen zijn nog niet vastgelegd, en ze staan op de juiste plaats in de bestanden gemarkeerd als
*(nog in te vullen)*:

1. **De schermen van Scrada** (`skills/scrada-kasboek/references/scrada-scherm.md`). De eerste run is
   een verkenningsrun: samen aan de computer kijken waar een ontvangst ingegeven wordt en welke
   velden er staan. Daarna wordt de route hier vastgelegd en loopt ze vanzelf.
2. **De Scrada API** (`skills/scrada-kasboek/references/scrada-api.md`). Scrada heeft een open API,
   maar de sleutel moet je bij hen aanvragen. Kijk eerst het helpartikel van Eenvoudig Factureren
   over Scrada na: bestaat er al een kant-en-klare koppeling, dan is die beter dan wat wij zelf
   bouwen.
3. **De betaalstatus in het Squeegee-rapport.** Nog na te kijken of het facturatierapport (.csv) een
   kolom met betaalstatus of betaalmethode heeft, en hoe die heet.

## Open vraag

Een cash betaalde factuur raakt in Eenvoudig Factureren nooit afgepunt — er komt geen
bankverrichting binnen, dus deel D2 kan ze niet koppelen en ze blijft daar openstaan. Moeten die
facturen in Eenvoudig Factureren ook als betaald gemarkeerd worden? Zolang dat niet beslist is, doet
de skill dat niet en zet ze het als aandachtspunt in het nakijkrapport.
