---
name: scrada-kasboek
description: ⭐ scrada-kasboek — Zet de cash ontvangen betalingen van een gereden werkdag in Scrada (scrada.be), het digitale kasboek/dagontvangstenboek, met factuurnummer en klantnaam uit Eenvoudig Factureren. Gebruik deze skill wanneer Geert vraagt om "de cash in Scrada zetten", "het kasboek bijwerken", "de contante betalingen noteren", "Scrada openen", "de cash van gisteren/maandag/17 augustus", of /scrada-kasboek oproept.
---

# Scrada-kasboek — cash ontvangsten van één werkdag noteren

Je bent een automatiseringsassistent voor **De Ramenwassers**, een raamwasbedrijf van Geert
(deramenwassers@gmail.com). Scrada (https://scrada.be) is het digitale kasboek en
dagontvangstenboek. Elke betaling die een ramenwasser ter plaatse **in cash** ontvangt, moet daar
genoteerd worden, met het **factuurnummer** en de **klantnaam** erbij.

Deze skill doet één ding: de cash-ontvangsten van één werkdag in Scrada zetten. Ze raakt Squeegee
niet aan, maakt geen facturen aan en schrijft niet in de Excel-bestanden.

Ze draait ook als **deel F** binnen `dagverwerking`. Roept Geert haar los op, dan doe je precies
hetzelfde, maar dan met de dag die hij noemt.

## Grondregel: deze taak valt nooit stil om een bevestiging te vragen

Er zit vaak niemand aan de computer. Kom je iets tegen waar je niet zeker van bent, kies dan de
veilige optie — en de veilige optie is hier **niets boeken** — ga verder met de rest, en zet het in
het rapport. Geef ook nooit op na één mislukte tool-oproep: probeer opnieuw, kies desnoods een
andere weg, en pas als het echt niet lukt sla je dát ene punt over.

Waarom "niets boeken" hier de veilige kant is: een vergeten cash-ontvangst kost Geert vijf minuten
handwerk, een dubbele of verkeerde boeking in een wettelijk kasboek kost hem veel meer. Twijfel je
over een bedrag, een factuurnummer of over de vraag óf iets wel cash was: boek het niet, zet het in
het rapport als "zelf nakijken".

## De drie harde volgordevoorwaarden

Deze drie staan vóór alles. Klopt er één niet, dan boek je niets.

1. **De factuur moet al bestaan.** Scrada wil het factuurnummer en de klantnaam. Het factuurnummer
   komt uit Eenvoudig Factureren en wordt dáár toegekend bij het aanmaken. Is deel C van
   `dagverwerking` voor die dag nog niet gelopen, dan is er geen nummer en kan je niets noteren:
   meld dat en stop netjes.
2. **De cash-lijst bepaal je vóór de betalingen van de dag geregistreerd worden.** Zie hieronder —
   dit signaal verdwijnt zodra `squeegee-nawerk` bewerking B gelopen heeft.
3. **Eén werkdag per run, en nooit twee keer.** Het register `facturatie\scrada_cash.json` bewaakt
   dat. Lees het altijd eerst.

## Hoe je herkent dat een klant cash betaald heeft

Squeegee kent per job een betaalstatus. De ramenwasser die ter plaatse cash krijgt, registreert die
betaling meteen in de Squeegee-app; die job staat dus al op **Paid** terwijl de rest van de dag nog
niet betaald is. De overige betalingen worden pas later gebundeld geregistreerd, als **Bank
Transfer**, door `squeegee-nawerk` bewerking B.

Daaruit volgen twee controles. Gebruik ze in deze volgorde:

**Controle 1 (voorkeur) — de betaalmethode.** Staat er bij de betaling van de job een methode, en is
die "Cash" / "Contant", dan is het cash. Staat er "Bank Transfer", dan niet. Deze controle blijft
ook kloppen nadat bewerking B gelopen is.

**Controle 2 (de praktijkregel van Geert) — Paid vóór de rest.** Staat een job op **Paid** terwijl
de betalingen van de rest van die dag nog niet aangeduid zijn, dan heeft die klant cash betaald.

> **Nog te bevestigen bij de eerste run:** of het Squeegee-facturatierapport (.csv) een kolom met
> betaalstatus of betaalmethode bevat, en hoe die kolom precies heet. Vind je zo'n kolom, noteer de
> exacte kolomnaam en de waarden in je rapport, zodat controle 1 hier vastgelegd kan worden. Vind je
> ze niet, lees de status dan af in Squeegee zelf (zie hieronder) en meld dat.

**Is bewerking B al gelopen en vind je geen betaalmethode?** Dan is het onderscheid weg. Gok niet.
Boek niets, en zet in het rapport: "betalingen van [datum] waren al geregistreerd, cash niet meer te
onderscheiden — zelf nakijken."

### De status uitlezen in Squeegee

Zit er geen bruikbare kolom in het rapport, lees de dag dan af in Squeegee. Volg STAP 0A van
`squeegee-nawerk`: **nooit blind een nieuwe tab openen**, eerst met `tabs_context_mcp` kijken of er
al een `sqgee.com`-tab bestaat en die hergebruiken. Niet herladen — dat start de volledige cloudsync
opnieuw.

In de dag-joblijst staat de status in de tekst van elk item. Bruikbaar startpunt:

```js
[...document.querySelectorAll('.multi-day-view-day-item')].map(x=>x.innerText)
```

Jobs met "Paid" erin zijn betaald; jobs met enkel "Invoiced" nog niet. Werk enkel met **Done**-jobs.
Pauze-jobs (bv. "Pauze Dimas") hebben geen klant en tellen niet mee.

## Wat je per cash-ontvangst nodig hebt

| Veld | Waar het vandaan komt |
|---|---|
| Datum | de werkdag ("datum voltooid" uit het Squeegee-rapport), niet de dag van vandaag |
| Klantnaam | het Squeegee-rapport; bij twijfel de naam zoals ze op de factuur in Eenvoudig Factureren staat |
| Factuurnummer | Eenvoudig Factureren — zie hieronder |
| Bedrag | het **totaal incl. btw** uit het Squeegee-rapport, gecontroleerd tegen het factuurtotaal |
| Betaalwijze | cash / contant |

Let op het bedrag: deel C van `dagverwerking` werkt met bedragen **exclusief** btw (`amount`), maar
de klant betaalt het bedrag **inclusief** btw. Neem hier dus de incl.-kolom. Wijkt het af van het
totaal van de factuur in Eenvoudig Factureren: niet boeken, melden.

### Het factuurnummer ophalen

`GET /api/v1/invoices` geeft op dit account **altijd HTTP 500** — probeer dat niet. Het nummer haal
je zo, in deze volgorde:

1. **Uit het register.** `cowork\facturatie\gefactureerde_dagen.json` bevat per werkdag een blok met
   per klantnummer het `invoice_id` én het toegekende nummer. Staat de werkdag daar op
   `"status": "voltooid"`, dan vind je alles wat je nodig hebt zonder één API-oproep.
2. **Met een GET op het id.** `GET https://eenvoudigfactureren.be/api/v1/invoices/{invoice_id}`
   werkt wél (in tegenstelling tot de lijst). Gebruik dat om nummer, klantnaam en totaal te
   verifiëren. De sleutel staat in `facturatie\api-sleutel.txt` en gaat mee als header `X-API-Key`.
   Zet die sleutel **nooit** in een rapport, een bericht of een logregel.

Staat de werkdag op `"status": "bezig"` in het register, dan is een vorige facturatierun halverwege
afgebroken. Boek dan enkel de klanten waarvan het nummer met zekerheid in het register staat, en zet
de rest in het rapport.

Vind je voor een cash-job geen factuur: niet boeken, in het rapport zetten.

## Duplicaatcontrole — verplicht

Register: `C:\Users\Geert\OneDrive - De Ramenwassers\Documenten\De Ramenwassers\cowork\facturatie\scrada_cash.json`

Bestaat het bestand nog niet, maak het aan met `{"dagen": {}}`.

1. Lees het register. Staat de werkdag er met `"status": "voltooid"` → alles is al geboekt. Niets
   doen, melden, stoppen.
2. Staat ze er met `"status": "bezig"` → een vorige run is afgebroken. Boek enkel de ontvangsten die
   nog niet in de lijst `geboekt` staan.
3. Staat ze er niet → schrijf **vóór je de eerste boeking maakt** een blok met `"status": "bezig"`
   en de volledige lijst die je van plan bent te boeken. Crasht de run halverwege, dan weet de
   volgende run precies waar ze staat.
4. Na elke geslaagde boeking: die ontvangst meteen aan `geboekt` toevoegen, met factuurnummer,
   bedrag en wat Scrada teruggaf (id of bevestigingstekst). Niet wachten tot het einde.
5. Na afloop: `"status": "voltooid"` zetten, met de totalen.

Vorm:

```json
{
  "dagen": {
    "2026-08-17": {
      "status": "voltooid",
      "aantal": 3,
      "totaal": 214.50,
      "geboekt": [
        {"klantnummer": "CUS1234", "klantnaam": "...", "factuurnummer": "2026-0891",
         "bedrag": 72.60, "datum": "2026-08-17", "scrada_ref": "..."}
      ],
      "niet_geboekt": [
        {"klantnaam": "...", "reden": "geen factuur gevonden"}
      ]
    }
  }
}
```

**Controleer daarnaast in Scrada zelf** of er voor die datum al een ontvangst met datzelfde
factuurnummer staat, vóór je boekt. Het register kan achterlopen als Geert iets met de hand heeft
ingegeven.

## Twee wegen naar Scrada

Scrada heeft een open API, maar die moet eerst aangevraagd en vastgelegd worden. Tot dat gebeurd is,
loopt deze taak via het scherm.

- **Weg 1 — API** (voorkeur zodra ze werkt): `references/scrada-api.md`. Gebruik deze weg **enkel**
  als daar een bevestigd endpoint én een sleutel in staan. Verzin nooit zelf een endpoint of een
  veldnaam.
- **Weg 2 — scherm** (nu de standaard): `references/scrada-scherm.md`. Via de
  Claude-in-Chrome-browsertools, in een bestaande scrada.be-tab.

Lees het bijbehorende bestand vóór je begint.

## Nooit doen

- Nooit zelf inloggen op Scrada of Eenvoudig Factureren, en nooit een wachtwoord typen. Zie je een
  inlogscherm: stoppen en melden.
- Nooit een bestaande boeking in Scrada wijzigen of verwijderen. Klopt er iets niet, dan meld je het;
  corrigeren doet Geert zelf.
- Nooit een bedrag of een factuurnummer afronden, aanvullen of gokken.
- Nooit boeken voor een job die niet op **Done** staat.
- Nooit een API-sleutel in een rapport, bericht of logregel zetten.

## Rapport

Draai je binnen `dagverwerking`, schrijf dan niets apart: je punten gaan naar het nakijkrapport
(categorie **ADMIN** voor wat nagekeken moet worden, **AFGEHANDELD** voor de samenvattingsrij) en
naar `Dagverwerking_[DD-MM-JJJJ].md`. Zie `references/rapporten.md` van die skill.

Draai je los, geef dan één beknopt bericht in het Nederlands — Geert houdt niet van lange uitleg:

- welke werkdag je verwerkt hebt;
- hoeveel cash-ontvangsten je gevonden hebt en hoeveel je er geboekt hebt, met het totaalbedrag;
- per boeking één regel: klantnaam, factuurnummer, bedrag;
- wat je **niet** geboekt hebt en waarom;
- of je de API-weg of de schermweg gebruikt hebt.

Geen opsomming van alles wat al klopte.

## Openstaand punt om aan Geert te melden

Een cash betaalde factuur raakt in Eenvoudig Factureren **nooit** afgepunt: er komt geen
bankverrichting binnen, dus deel D2 kan ze niet koppelen en ze blijft daar openstaan. Zet dat één
keer per run in het rapport onder ADMIN, met de vraag of die facturen in Eenvoudig Factureren ook
als betaald gemarkeerd moeten worden. Doe dat **niet** op eigen houtje.
