# Deel E — ingave werk (macro "TeamToevoegen", Excel nodig)

Bestand: `ingave werk.xlsm` in de cowork-root, blad **"ingave"** (staat vooraan in de tabbalk;
anders: rechtsklik op de bladnavigatiepijltjes → "Activeren" → "ingave").

**Dit is een loonbestand.** Een dubbele registratie betekent dubbel loon, een verzonnen verdeling
betekent een verkeerd betaalde werknemer. Vandaar de strenge controles hieronder.

## Wat er op het blad staat

- Radiobuttons **Camionette**: Toyota / Gele / Vivaro / Witte / Sprinter / Geen.
- Radiobuttons **Omschrijving Dag**: gebruik **altijd enkel "Werk"**. VAK/ZK/FD/VV/EW/Bureau/TA/ADV
  blijven 100% manueel bij Geert — die absentiecodes kan deze taak niet kennen.
- Gedeelde invoerrij: **B19 = Datum, C19 = startuur, D19 = Pauze (vinkje), E19 = Eind uur,
  F19 = Omzet**.
- Per werknemer een vinkje + rol-radiobuttons S/M/J. **Rollen nooit aanpassen** — dat is een vaste,
  door Geert beheerde instelling.
- Onderaan de knop "Team opslaan".

## Controle vooraf — verplicht

Kijk op het tabblad van één werknemer (Ctrl+Home, nieuwste datum bovenaan; de eerste rijen kunnen
toekomstige VAK-dagen zijn, scroll tot je de recente werkdagen ziet) of de werkdag er al staat.

Staat ze er al, dan is deel E al gebeurd: draai de macro **niet** opnieuw, meld het en ga door.
Controleer dit ook per werknemer als je vermoedt dat een vorige run halverwege is gestopt.

Een gat van meerdere dagen met VAK is meestal collectief verlof (augustus en eind december), geen
achterstand — niet oprakelen.

## Welke teams

**Elk voertuig dat die dag gereden heeft** (kilometers > 0 in Metatrak), gekoppeld aan de uitvoerder
zoals bepaald in deel A — dus ook de solo-rijders. Sla nooit iemand over. Een voertuig met 0 km laat
je weg.

## Omzet per team

Tel de kolom "subtotaal" (= **exclusief btw**) van het Squeegee-rapport op voor alle jobs van die
uitvoerder op de werkdag. Void-rijen die elkaar opheffen tellen netto voor nul — neem ze niet dubbel
mee. Reed een uitvoerder mee in een ploeg, dan hoort zijn omzet bij die ploeg.

Sluitstuk: de som van alle team-omzetten moet gelijk zijn aan de totale omzet excl. btw van de
werkdag.

## Tijden

C19 en E19 laten enkel **kwartierwaarden** toe. Rond altijd af naar het dichtstbijzijnde kwartier en
gebruik die afgeronde tijden ook in het rapport.

- **Startuur** = het moment waarop de camionette met de ronde vertrekt, **min 30 minuten**.
- **Einduur** = het moment waarop de camionette van de ronde terugkeert, zonder extra tijd.
- "Vertrekken" en "terugkeren" = de rit naar de eerste klant en de rit terug naar het depot
  (Steenweg op Mol 123). Ritten daarvóór of daarná die woon-werkverkeer zijn (een chauffeur die de
  bus mee naar huis neemt) of een verzetting van enkele honderden meters tellen **niet** mee. Zet
  die keuze in het nakijkrapport. Idem voor een avondrit ná de depotterugkeer zonder Squeegee-job:
  niet meetellen, wel expliciet vermelden zodat Geert kan zeggen of het werktijd was.
- Bij twijfel is **07:45** het startuur dat in de rest van het werkboek standaard gehanteerd wordt.
  Maar reken altijd eerst met Metatrak: op 30/07/2026 kwamen drie van de vier uitvoerders op 07:30
  uit. Wijk je bij meerdere mensen af van 07:45, zet dat dan als apart punt in het nakijkrapport —
  het heeft loonimpact.

## Per voertuig/team, eenmaal

1. Camionette-radiobutton aanklikken (ze staan ~15-20 px uit elkaar — eerst inzoomen, desnoods op
   het label klikken) en via zoom verifiëren.
2. B19 = de verwerkte werkdag.
3. C19 = afgerond startuur.
4. E19 = afgerond einduur.
5. **D19 (pauze-vinkje) UIT laten.** WAAR trekt 15 minuten af (0,010416667 = 0:15, formule
   (Eind−Pauze−Start)×24) — dat is niet de bedoeling.
6. F19 = de team-omzet excl. btw, **altijd met komma** (een punt geeft een ×100-fout).
7. Vink enkel de juiste werknemers aan, en vink eerst de vorige selectie uit — het formulier onthoudt
   die. Verifieer via zoom. Rollen niet aanpassen.
8. Klik op **"Team opslaan"** (nooit Alt+F8; bij een VBA-foutmelding kies "Beëindigen"). De
   bevestiging "Teamregistratie voltooid." kan enkele seconden duren — wachten en een verse
   screenshot nemen. **Klik de knop nooit tweemaal.**
9. Controleer verplicht de nieuwe rij op het tabblad van elk teamlid (Ctrl+Home).

B19 t/m F19 kan je in één keer invullen door met Ctrl+G naar B19 te gaan en
`30/07/2026<TAB>7:30<TAB><TAB>16:15<TAB>635,83<ENTER>` te typen (de lege tab slaat de pauzekolom
over). Dat lukt niet altijd: op 31/07/2026 kwam die invoer bij één team gewoon niet door en bleven de
vorige waarden staan. **Controleer daarom altijd met een zoom op de invoerrij dat er écht staat wat
je bedoelde, vóór je op "Team opslaan" klikt.** Klopt er iets niet, vul die cellen dan één voor één
opnieuw in.

## Na afloop controleren

Vergelijk op het tabblad van elk teamlid "Omzet" met "Omzet enkel":

- bij een **solo-rijder** exact gelijk;
- bij een **ploeg** verdeelt de macro gewogen naar rol (M meer dan S) — controleer dan of de SOM
  klopt en meld de verdeling.

Wijkt iets een factor 10 of 100 af: handmatig corrigeren met komma-notatie en opnieuw verifiëren.
Lukt de controle niet: **niet opnieuw de macro draaien** — dat team overslaan en exact melden.
Opslaan met Ctrl+S.

## Twee uitzonderingen

- Geen duidelijk voertuig voor iemand: enkel die persoon overslaan en melden.
- **Eén ploeg met twee busjes:** de macro kan dat niet in één registratie aan. Geef de andere
  voertuigen gewoon in, sla die ene ploeg over, en zet in het nakijkrapport dat Geert zelf moet
  zeggen wie in welke camionette zat en hoe de omzet verdeeld moet worden. Verzin die verdeling
  nooit zelf.
