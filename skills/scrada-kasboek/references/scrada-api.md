# Weg 1 — de Scrada API

**Status: nog niet bruikbaar.** Er is een open API, maar het endpoint en de sleutel zijn nog niet
vastgelegd. Zolang de tabel onderaan niet ingevuld is, gebruik je `scrada-scherm.md`.

Verzin nooit zelf een endpoint, een veldnaam of een base-URL. Een verkeerde POST naar een kasboek is
een boeking die je niet meer kan intrekken.

## Wat we weten (opgezocht 24/08/2026)

- Scrada biedt een open API aan waarmee externe systemen ontvangsten, betaalwijzen, kasverrichtingen
  en verkoopfacturen kunnen doorsturen. Ze is bedoeld voor onder meer kassasystemen die hun digitale
  dagontvangstenboek in Scrada willen bijhouden.
- Authenticatie gebeurt met een **API-sleutel die je bij Scrada aanvraagt**. Er is een
  testomgeving, documentatie op aanvraag, en Postman-voorbeelden.
- Documentatie: `https://www.scrada.be/api-documentation/` en het supportartikel "Scrada API"
  (`support.scrada.be`, artikel 103000132277). Er is ook een supportrubriek "Integraties"
  (103000135487) en een artikel "Scrada Sync" (103000123037).
- Eenvoudig Factureren heeft een eigen helpartikel over Scrada
  (`help.eenvoudigfactureren.be`, artikel 101000480440). **Kijk dat eerst na**: bestaat er al een
  kant-en-klare koppeling tussen Eenvoudig Factureren en Scrada, dan is die bijna zeker beter dan
  wat wij zelf bouwen — dan hoeft deze skill enkel nog te controleren of alles doorgekomen is.

## Wat er nog moet gebeuren

1. Een sleutel aanvragen bij Scrada (via de contactweg op scrada.be of via de boekhouder).
2. De sleutel opslaan in `cowork\facturatie\scrada-api-sleutel.txt`, één regel, net zoals de sleutel
   van Eenvoudig Factureren. Nooit in een rapport of bericht zetten.
3. De documentatie doornemen en de tabel hieronder invullen — bij voorkeur eerst tegen de
   **testomgeving** proberen, nooit meteen op de echte boekhouding.
4. Pas daarna deze weg in gebruik nemen en de status bovenaan aanpassen.

## IN TE VULLEN — bevestigd endpoint

Vul dit pas in als het effectief getest is, en zet erbij op welke datum.

| Wat | Waarde |
|---|---|
| Base-URL | *(nog in te vullen)* |
| Authenticatie-header | *(nog in te vullen)* |
| Endpoint voor een cash-ontvangst | *(nog in te vullen)* |
| Veld datum | *(nog in te vullen)* |
| Veld bedrag (incl. btw) | *(nog in te vullen)* |
| Veld klantnaam | *(nog in te vullen)* |
| Veld factuurnummer | *(nog in te vullen)* |
| Veld betaalwijze = cash | *(nog in te vullen)* |
| Hoe je een bestaande boeking terugvindt (duplicaatcontrole) | *(nog in te vullen)* |
| Getest op | *(datum)* |

## Als de API-weg werkt

- Doe eerst de leesoproep uit de laatste rij en controleer of er voor die datum al een ontvangst met
  datzelfde factuurnummer staat. Ja → niet nogmaals boeken.
- Boek één ontvangst per keer en schrijf ze meteen weg in `scrada_cash.json`, mét wat de API
  teruggaf.
- Bij HTTP 401/403: melden dat de sleutel vernieuwd moet worden, en terugvallen op de schermweg.
- Bij eender welke andere fout: die ene ontvangst niet boeken, de rest wel, en het melden.
- Lokaal draai je API-oproepen met `javascript_tool` (`fetch`) vanuit een tab op het juiste domein;
  in de cloud gewoon met bash of Python. Zie `omgeving.md` van `dagverwerking`.
