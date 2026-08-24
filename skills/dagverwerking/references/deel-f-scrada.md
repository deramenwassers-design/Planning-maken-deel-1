# Deel F — cash-ontvangsten in Scrada

Scrada (https://scrada.be) is het digitale kasboek en dagontvangstenboek. Elke betaling die een
ramenwasser ter plaatse **in cash** ontvangt, moet daar genoteerd worden, met het factuurnummer en
de klantnaam erbij.

De volledige werkwijze staat in de skill **`scrada-kasboek`** (`SKILL.md` plus
`references/scrada-scherm.md` en `references/scrada-api.md`). Lees die en volg ze. Hieronder staat
enkel wat specifiek is aan het draaien binnen de dagverwerking.

## Volgorde — F komt ná C

Scrada wil het **factuurnummer**, en dat wordt pas toegekend bij het aanmaken van de factuur in
Eenvoudig Factureren. Deel F kan dus pas draaien als deel C klaar is. Is C overgeslagen (geen
API-sleutel, dag al gefactureerd volgens het register, 6%-job, ...), dan haal je de nummers uit
`facturatie\gefactureerde_dagen.json`. Staan ze daar niet: F overslaan en melden.

## Wat je in deel A al moet vastleggen

De cash-herkenning berust op een signaal dat verdwijnt: een job die op **Paid** staat terwijl de
betalingen van de rest van de dag nog niet geregistreerd zijn, is cash betaald. Zodra
`squeegee-nawerk` bewerking B gelopen heeft, staat alles op Paid en is het onderscheid weg.

Leg daarom **meteen bij het inlezen van het Squeegee-rapport in deel A** per job vast:

- de betaalstatus (Paid / Invoiced / niets), en
- de betaalmethode als die in het rapport staat (Cash of Bank Transfer).

Zit die informatie niet in het .csv, lees ze dan af in Squeegee zelf vóór er iets aan betalingen
gebeurt — zie `scrada-kasboek/SKILL.md`. Noteer in het dagverwerkingsrapport welke kolom je gebruikt
hebt, of dat ze ontbrak.

Is bewerking B al gelopen en is er geen betaalmethode te vinden: **niets boeken**, en in het
nakijkrapport onder ADMIN zetten dat de cash van die dag niet meer te onderscheiden was.

## Bedragen

Deel C werkt met bedragen **exclusief** btw. Scrada wil wat de klant effectief betaald heeft, dus
het **totaal inclusief** btw uit het Squeegee-rapport. Controleer dat tegen het totaal van de
factuur in Eenvoudig Factureren; wijkt het af, dan boek je niet en meld je het.

## Duplicaatcontrole

Register: `facturatie\scrada_cash.json`, met dezelfde bezig/voltooid-logica als
`gefactureerde_dagen.json`. Schrijf het blok met `"status": "bezig"` weg vóór de eerste boeking, en
elke geslaagde boeking meteen daarna. Zie `scrada-kasboek/SKILL.md`.

## In de rapporten

- Nakijkrapport, categorie **ADMIN**: alles wat niet geboekt raakte, met de reden. Zet er één keer
  per run ook bij dat cash betaalde facturen in Eenvoudig Factureren blijven openstaan (er komt geen
  bankverrichting binnen, dus D2 kan ze niet koppelen), met de vraag of ze daar ook als betaald
  gemarkeerd moeten worden. Beslis dat nooit zelf.
- Nakijkrapport, categorie **AFGEHANDELD**: één rij met het aantal geboekte cash-ontvangsten en het
  totaalbedrag.
- Dagverwerkingsrapport: welke weg je gebruikt hebt (API of scherm) en wat er misging.
