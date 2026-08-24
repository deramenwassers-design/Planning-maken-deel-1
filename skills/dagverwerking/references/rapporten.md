# Rapporten — er zijn er twee, schrijf ze allebei

Geert kan **geen .md-bestanden openen**. Alles wat voor hem bedoeld is, is .xlsx (in noodgeval .csv,
want dat opent ook in Excel).

---

# 1. Nakijkrapport — het belangrijkste

Dit is wat Geert effectief leest. **Altijd .xlsx, nooit .md.**

Opslaan als `Nakijken_[DD-MM-JJJJ].xlsx` (datum = de verwerkte werkdag) in:

```
C:\Users\Geert\OneDrive - De Ramenwassers\Documenten\De Ramenwassers\cowork\rapport te bekjken - aanpassingen\
```

Let op de schrijfwijze van de mapnaam, inclusief de typfout "bekjken" — neem ze exact over. Eén
bestand per werkdag; overschrijf het bestand van dezelfde dag bij een herstart, maak nooit een
tweede bestand voor dezelfde dag.

Het bestand heeft **twee tabbladen**.

## Tabblad 1 — "Nakijken" (de actielijst)

Enkel wat Geert nog moet doen, beslissen of bevestigen.

Kolommen: **Nr | Categorie | Onderwerp | Situatie | Wat jij moet doen | OK?**
De kolom "OK?" blijft leeg — daar vinkt Geert zelf af.

Kolombreedtes: A=5, B=16, C=30, D=70, E=45, F=8. Tekstterugloop aan op het hele bereik, rijhoogte 75
vanaf rij 2.

Categorieën, in deze volgorde (laat een categorie weg als er niets te melden is):

1. **LOON** — beslissingen die al in "ingave werk" zitten en geld kosten: afwijkende start-/einduren,
   niet-meegetelde ritten, ontbrekende of niet-afgetrokken pauzes. Eén rij per punt.
2. **UREN** — elke AANGEPAST-rij waar je iets moest interpreteren (gedeelde stops, pro rata, een
   adres dat via een aanpalende straat gematcht is). Zet in "Situatie": wat stond er, wat staat er
   nu, en waarom. De rijen waar je enkel een lege tijd uit Metatrak aanvulde, mag je samen in één
   rij zetten.
3. **STOP ZONDER JOB** — één rij per stop, met voertuig, uitvoerder, adres, tijdvak en duur.
4. **KLANTEN** — nieuw aangemaakte klanten waarvan telefoon en e-mail nog ontbreken.
5. **ADMIN** — bron van de bankimport (en de waarschuwing over dubbel plakken), gat in de
   factuurnummering, void-rijen, verkeerd ingedeelde transacties, en alles wat je onderweg zag maar
   niet kon uitmaken.
6. **AFGEHANDELD** — sluit af met één rij per onderdeel (facturen, facturenlijst, import bank,
   betalingen, ingave werk) met de kerncijfers en de uitgevoerde controle in "Situatie" en "Geen
   actie." in de laatste kolom, zodat hij weet waar hij **niet** naar hoeft te kijken.

## Tabblad 2 — "Tijden voor Squeegee" (de overtiklijst)

Verplicht zodra er ook maar één AANGEPAST-rij is. Hiermee past Geert de tijden in Squeegee aan.

Kolommen: **Uitvoerder | Klant | Adres | Staat nu in Squeegee | Zet op | Begin uur | Eind uur |
Waarom**

- "Staat nu in Squeegee": de originele duur, of "(leeg)" als er niets geregistreerd was.
- "Zet op": de voorgestelde duur als `0:29:16`.
- "Begin uur" en "Eind uur": de kloktijden uit Metatrak als `10:37` en `11:06` — Excel herkent die
  als tijdwaarde. **Deze twee kolommen zijn het belangrijkste van het hele tabblad; laat ze nooit
  leeg.**
- Sorteer op uitvoerder en daarbinnen chronologisch op begin uur — zo kan Geert per persoon van
  boven naar onder werken.

Kolombreedtes: A=12, B=35, C=40, D=20, E=12, F=11, G=11, H=55.

### Opmaak van tabblad 2 — belangrijk, Geert typt deze cijfers over

Zonder kleur "dansen de cijfertjes door elkaar" (zijn woorden, 31/07/2026). Doe daarom telkens:

- **Eén zachte achtergrondkleur per uitvoerder**, over de volle breedte A:H van dat blok. Zo ziet hij
  in één oogopslag waar de rijen van één persoon beginnen en eindigen. Wissel af tussen lichtblauw,
  lichtgroen en lichtgeel (de lichtste tinten uit het themapalet, bovenste rij van het kleurmenu).
  Zijn er meer dan drie uitvoerders, begin dan opnieuw bij de eerste kleur — zolang twee
  opeenvolgende blokken maar verschillen.
- **De drie invoerkolommen (Zet op, Begin uur, Eind uur) gecentreerd en vet.** Dat is wat hij
  effectief overtypt; die moeten eruit springen.
- **Dunne randen rond alle cellen** van het gevulde bereik (randen-knop → "Alle randen").
  Rasterlijnen houden het oog op de juiste rij.
- **Kopregel vet met een donkere vulling en witte tekst**, en de bovenste rij blokkeren.

Gebruik die kleurlogica **niet** op tabblad 1 — daar volstaat de kopregel-opmaak, want dat blad lees
je en typ je niet over.

## Zo maak je het bestand

**In de cloud (Cowork):** bouw het gewoon met openpyxl — kolombreedtes, tekstterugloop, vulkleuren,
randen en blokkeren gaan daar in één script. Schrijf het weg en zet het met `device_commit_files` in
de juiste map.

**Lokaal (bewezen werkwijze, 31/07/2026):** Excel openen → "Lege werkmap" → venster maximaliseren met
een **dubbelklik op de titelbalk** → het blok tab-gescheiden op het klembord zetten met
`write_clipboard` en in één Ctrl+V op A1 plakken (geen tabs of regeleinden binnen een cel) →
tekstterugloop via de knop "Terugloop" in het lint (Start-tabblad, ~x=310 y=47) → kolombreedtes en
rijhoogte via de rechtermuisknop op de kop → kopregel vet (Ctrl+G naar `A1:F1`, dan Ctrl+B) → Beeld
→ Blokkeren → "Bovenste rij blokkeren" → tweede tabblad met de "+" naast de bladtab, plakken,
opmaken en inkleuren → beide tabbladen hernoemen → opslaan via Ctrl+S → "Meer opties..." →
"Bladeren".

Lukt Excel echt niet: schrijf `Nakijken_[DD-MM-JJJJ].csv` in dezelfde map (beide tabellen onder
elkaar, met een lege regel en een kopregel ertussen), met puntkomma's en een UTF-8 BOM, en meld dat
als noodoplossing. **Schrijf nooit een .md voor Geert.**

---

# 2. Dagverwerkingsrapport — je eigen verslag

`Dagverwerking_[DD-MM-JJJJ].md` in de cowork-map (root). Dit mag .md blijven: het is naslag voor een
volgende run, niet voor Geert.

Inhoud:

- verwerkte werkdag en **totale duur**;
- status van elk deel (A t/m E);
- per deel wat je precies gedaan hebt en welke controles je uitgevoerd hebt;
- welk Metatrak-bestand gebruikt is (volledig pad + gedekte werkdag + aantal detailregels);
- een tabel met de AANGEPAST-rijen (was → wordt + reden);
- **wat er misging of bijna misging** (foute plakactie, verkeerd blad, overschreven cel, hernummerde
  factuur, vergeten teamlid, gewiste filter, overgeslagen team, invoer die niet doorkwam) — ook als
  het hersteld is. Dit deel is het waardevolste voor de volgende run; sla het nooit over omdat "het
  toch goed afgelopen is".

Zet de API-sleutel nooit in een van beide rapporten.
