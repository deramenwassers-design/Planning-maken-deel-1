# Deel B — facturenlijst aanvullen (Excel nodig)

Bestand: `cowork\facturatie\facturenlijst.xlsm`, blad **"Data Squeegee"**.

Dit blad staat niet vooraan in de tabbalk: rechtsklik op de bladnavigatiepijltjes linksonder →
"Activeren" → "Data Squeegee".

Doel van dit bestand: overzicht van welke klanten al betaald hebben ten opzichte van elkaar. Het
voedt bovendien "stortingen vs kosten".

## Vóór je iets plakt

1. **Staat er een filter op?** (statusbalk toont "Filtermodus") Wis die eerst via Gegevens → Wissen,
   anders klopt Ctrl+End niet en plak je in verborgen rijen. Meld dat je de filter gewist hebt.
2. Bepaal de laatste rij met Ctrl+End. Die kan kolom Q teruggeven terwijl de data tot P loopt — dat
   is normaal.
3. Controleer meteen of de laatste rijen niet al de werkdag bevatten.

## Kolommen

| Kolom | Inhoud |
|---|---|
| A, B, C | hulpformules (zie hieronder) |
| D | klant referentie (CUS…) |
| E | klantnaam |
| F | adres |
| G | datum voltooid |
| H | datum gefactureerd |
| I | betalingsstatus |
| J | subtotaal (excl. btw) |
| K | belasting |
| L | totaal (incl. btw) |
| M | opgenomen tijd |
| N | uitvoerder |
| O | uitgevoerde taken |
| P | ronde |

**Hulpformules — per rij met het juiste rijnummer meeplakken.** Naar beneden kopiëren geeft een fout
bereik in B.

- A: `=D{r}&G{r}&I{r}&J{r}&F{r}`
- B: `=ALS(C{r}="Y";AANTAL.ALS($C${r}:$C$94149;"Y");0)` ← het bereik begint op de **eigen** rij
- C: `=ALS(G{r}='blad voor facturen dag'!$B$2;"Y";"N")`

Dat B op 0 en C op "N" staat is normaal zolang `'blad voor facturen dag'!$B$2` op een andere dag
staat — melden, niet corrigeren.

## Welke rijen

Enkel rijen met **datum voltooid = de verwerkte werkdag**, inclusief void-rijen. Void-rijen die géén
datum voltooid hebben neem je toch op, met kolom G leeg (getrouw aan de bron) — zet dat in het
nakijkrapport.

- Kolom M: gebruik het resultaat van deel A — voor AANGEPAST-rijen de "Voorgestelde tijd", voor
  OK-rijen de originele duur. Schrijf als `0:57:08`.
- Bedragen in J/K/L met **komma**, ongewijzigd uit Squeegee (pas hier niet de afronding van deel C
  toe).
- Datums als `29/07/2026`.

## Plakken en verifiëren

Zet het volledige blok (A t/m P, alle rijen) tab-gescheiden op het klembord met `write_clipboard` en
plak in **één** Ctrl+V. Nooit cel per cel typen.

Navigeer met Ctrl+G naar de eerste nieuwe cel in kolom A en verifieer met een zoom op de Naam-box
dat je echt in kolom A staat, én met een schermafbeelding dat je op het juiste **blad** staat, vóór
je plakt.

Verifieer nadien:

- de A- en B-formule van de laatste rij via de formulebalk;
- de M-cel van elke AANGEPAST-rij;
- het totaal van kolom J: selecteer het bereik met Ctrl+G en lees "Aantal" en "Som" af in de
  statusbalk. Dat moet gelijk zijn aan het totaal excl. btw van deel C.

Opslaan met Ctrl+S.

**Staan de rijen er al?** Controleer dan per AANGEPAST-rij of M de gecorrigeerde waarde heeft; zo
niet, pas enkel die cellen aan (geen nieuwe rijen) en meld dit.
