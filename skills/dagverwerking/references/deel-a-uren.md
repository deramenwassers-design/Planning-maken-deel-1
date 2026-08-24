# Deel A — uren vergelijken (Squeegee-tijden vs Metatrak-stops)

Doel: vaststellen welke Squeegee-tijden ontbreken of niet kloppen, zodat Geert ze zelf kan
overtikken. **Je schrijft nooit in Squeegee.** Klantnamen opschonen hoort hier niet bij.

Nevenopbrengst die je niet mag vergeten: de **voertuig↔uitvoerder-koppeling**. Deel E kan zonder die
koppeling niet draaien.

## 1. Koppel elk voertuig aan een uitvoerder

Vergelijk de route in Metatrak met de adressen per uitvoerder in het Squeegee-rapport. In de praktijk
is de match zeer duidelijk: elk voertuig rijdt één samenhangende regio af (bv. Ravels,
Turnhout-centrum, Mol/Dessel/Retie) die exact overeenkomt met de jobs van één uitvoerder. Noteer de
koppeling en het aantal kilometers per voertuig — een voertuig met 0 km heeft niet gereden.

## 2. Vaste regels voor de cross-check

- Stopdrempel: **> 1 minuut**.
- Adres-matching op ~20 m, 1-2 huisnummers of tijdsovereenkomst. GPS wijst geregeld een aanpalend
  huisnummer, een aanpalende straat of zelfs een verkeerde straatnaam aan — dat is normaal. Op
  30/07/2026 werd "Beemdenstraat 21" als "Beekstraat 21" gemeld en "Eendendreef 5" als
  "Spreeuwendreef 6"; op 17/08/2026 wees GPS negen keer een aanpalend huisnummer aan zonder dat er
  iets fout was.
- Ontbrekende tijd aanvullen vanuit Metatrak.
- Gedeelde stops: pro rata volgens offertewaarde.
- "Timer niet gestopt": herverdelen met Metatrak als leidend.
- Minstens 1 minuut speling tussen opeenvolgende correcties.
- Pauzecontrole: ~15-17 min, meestal aan "Steenweg op Mol 123" maar soms ter plaatse bij een klant —
  een stop die duidelijk langer duurt dan de job is vermoedelijk de pauze.
- Tankstation- en eetstops: louter informatief.
- Overige onverklaarde stops: "te onderzoeken".
- Bij lage zekerheid **niet corrigeren** maar markeren als AANDACHTSPUNT.

## 3. Werkwijze die goed werkt

Match eerst alle stops die duidelijk zijn, en kijk dan welke jobs én welke stops overblijven. Blijft
er precies één job zonder tijd over én één onverklaarde stop van een passende duur, dan horen die
bij elkaar — ook als de straatnaam afwijkt. Blijven er meerdere over, wees dan voorzichtig en
markeer.

**Gedeelde stops:** ligt de som van de individueel geregistreerde Squeegee-tijden binnen ~15% van de
totale stopduur, dan is dat OK. Pas pro rata enkel toe bij een echt duidelijke afwijking (bv. één
klant met 0 geregistreerd). Let vooral op twee buren of twee appartementen op hetzelfde adres waar
één klant de volledige stopduur geregistreerd heeft en de andere niets.

**Ploegen** (uitvoerder als "Di&Ju&Ro"): de Squeegee-tijd is de SOM van de persoonstijden, niet de
klokduur. Reken met persoonsuren en corrigeer niet automatisch — markeer als AANDACHTSPUNT.

**Kloktijden bepalen** voor elke AANGEPAST-rij: uit "Begin van periode" / "Einde periode". Bij een
gedeelde stop: leid de volgorde af uit de huisnummers en splits het blok in aaneensluitende
sub-intervallen met 1 minuut speling.

**Metatrak-interpretatie:** tijdstippen als "08:09 27.07.26" of "30.07.2026 08:09:22"; lege "Duur van
de verplaatsing" = STOP; lege "Parkeerduur" = RIT; de eerste regel per voertuig zonder adressen is de
nachtperiode. Tijden op de minuut, duren op de seconde.

## 4. Het rapport van deel A

Bestand: **`Aan te passen rapport [DD-MM-JJJJ].xlsx`** in de map `aan te passen rapport`.

Sectie 1 — alle jobs van de werkdag, ook de correcte:

| Voertuig | Uitvoerder | Klant | Adres | Squeegee-tijd | Voorgestelde tijd | Begin uur | Eind uur | Status | Reden |
|---|---|---|---|---|---|---|---|---|---|

- Squeegee-tijd als `00:18:48`.
- Status: OK / AANGEPAST / TE ONDERZOEKEN / AANDACHTSPUNT.
- **"Begin uur" en "Eind uur" zijn verplicht bij elke AANGEPAST-rij**; bij OK mogen ze leeg.
- Formatteer die twee als tijd ("u:mm") — typ "9:14" zodat Excel het als tijdwaarde herkent.
  Kopieer nooit de opmaak van de duurkolommen naar deze twee kolommen.

Sectie 2 — "Stops zonder Squeegee-job / pauzecontrole":

| Voertuig | Uitvoerder | Locatie | Tijdvak | Duur | Status | Toelichting |
|---|---|---|---|---|---|---|

Vermeld daarin ook expliciet per voertuig of er een pauzestop gevonden is, en welke ritten je als
woon-werkverkeer beschouwd hebt.

Lukt Excel echt niet: .csv met puntkomma's en UTF-8 BOM (`﻿`), met "(CSV - openen in Excel en
bewaren als xlsx)" in de naam, en dat melden als noodoplossing.
