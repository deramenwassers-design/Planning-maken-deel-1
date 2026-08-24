# Deel D — bankverrichtingen

Twee losstaande onderdelen die dezelfde coda's gebruiken. **Doe ze allebei.**

- **D1** vult het Excel-overzicht "stortingen vs kosten - nieuw.xlsx" aan (Geerts eigen
  kosten/stortingen-dashboard).
- **D2** leest de coda's in bij Eenvoudig Factureren, waar ze automatisch aan facturen gekoppeld
  worden.

---

# D1 — Import bank (Excel nodig)

Bestand: `stortingen vs kosten - nieuw.xlsx` (cowork-root), blad **"Import bank"**. Data begint op
rij 5. Het blad "Automatisch inladen" bevat inactieve Power Query-code — negeren.

Bepaal met Ctrl+End de laatste rij en lees de datum in kolom B: dát is de datum tot waar de bank
bijgewerkt is. Alles ná die datum moet erbij. Loopt het blad al tot en met de werkdag, dan is D1 al
gebeurd — niets doen, melden.

**Welke kolommen vul je?** Er zijn 15 kolommen (A Rekening, B Boekingsdatum, C Rekeninguittreksel
nummer, D Transactienummer, E Rekening tegenpartij, F Naam tegenpartij, G Straat en nummer,
H Postcode en plaats, I Transactie, J Valutadatum, K Bedrag, L Devies, M BIC, N Landcode,
O Mededelingen), maar in álle bestaande rijen zijn enkel **B, F, I en K** gevuld. De andere elf
blijven leeg. Doe dat ook zo.

## Bron 1 (voorkeur) — Belfius-transactie-export

Zoek in `C:\Users\Geert\Downloads` naar `BE86 0689 3436 4550 *.csv` en kijk of er een export is die
de ontbrekende periode dekt. Open die in Excel, kopieer de datarijen (kop **niet** meeplakken) en
plak ze onder de laatste rij.

## Bron 2 (terugval) — afleiden uit de coda's

Werkte perfect op 30/07, 31/07 en 17/08/2026. Is er geen geschikte Belfius-export, gebruik dan de
`COD_*.CD2`-bestanden in `uittreksels 2026` voor de ontbrekende dagen. Ze bevatten dezelfde
verrichtingen. Weekends hebben geen uittreksel — dat is geen gat.

Parseer per coda-bestand op **vaste posities (1-geïndexeerd)**:

| Record | Posities | Betekenis |
|---|---|---|
| `21` | pos 32 | teken: `0` = credit (positief), `1` = debet (**negatief**) |
| `21` | pos 33-47 | bedrag in **duizendsten** (deel door 1000) |
| `21` | pos 116-121 | **boekingsdatum** als ddmmjj → kolom B |
| `21` | pos 48-53 | valutadatum — **niet** gebruiken voor kolom B |
| `23` | pos 48-82 | naam tegenpartij → kolom F |
| `31` met pos 40 = `0` | pos 41 t/m 112 | vrije mededeling → kolom I |
| `9` (laatste regel) | pos 17-22 / 23-37 / 38-52 | aantal records / debettotaal / credittotaal (duizendsten) |

- Kap de mededeling **af op positie 112**: daarna volgen andere velden die anders in de mededeling
  belanden. Staat er geen `31`-record met pos 40 = "0", laat kolom I leeg — de kostenindeling werkt
  ook op de tegenpartij. (Op 17/08 hadden zes verrichtingen daardoor geen mededeling: normaal.)
- Koppel de records aan elkaar via het **volgnummer op pos 3-6**.
- Tel je eigen bedragen op en vergelijk met de `9`-record. Klopt het niet exact: dat bestand **niet**
  gebruiken en melden.
- Doe het parseerwerk in code (`javascript_tool` lokaal, Python in de cloud) — betrouwbaarder dan
  met de hand.

Schrijf in het nakijkrapport welke dagen uit de coda's zijn afgeleid, met de waarschuwing dat Geert
voor die periode **geen Belfius-export meer mag bijplakken** (anders staat alles dubbel).

## Plakken en controleren (beide bronnen)

- Zet het blok tab-gescheiden op het klembord (15 kolommen per rij, lege velden gewoon leeg).
  Bedragen met **komma**, negatieve bedragen met een minteken. Datums als `24/07/2026`.
- Navigeer met Ctrl+G naar de eerste vrije cel in kolom A. **Verifieer vóór het plakken zowel de cel
  (zoom op de Naam-box) als het blad (schermafbeelding — de titel moet "Bankbestand inladen" zijn en
  de tab "Import bank" moet actief zijn).** Een klik op een tabblad pakt niet altijd; op 30/07/2026
  belandde een blok van 97 rijen daardoor in het blad "Regels". Dat werd met Ctrl+Z hersteld, maar
  controleer het vooraf.
- Na het plakken: selecteer het bedragenbereik met Ctrl+G en lees "Aantal" en "Som" af in de
  statusbalk. Die moeten overeenkomen met het aantal verrichtingen en met de som van de
  coda-totalen.
- **Let op:** een mededeling die enkel uit cijfers bestaat (bv. een lang referentienummer) wordt door
  Excel als getal ingelezen en verschijnt als 7,6E+21. Controleer daarop en zet er desnoods een
  woord voor.
- Controleer ook B van de eerste en laatste nieuwe rij: het moeten echte datumwaarden zijn (selecteer
  het bereik; de statusbalk toont dan "Gemiddelde" als datum).
- Opslaan met Ctrl+S. "Transacties" en de overzichten rekenen zichzelf bij.

## Nakijken in het blad "Transacties"

Kijk naar de nieuwe rijen: staat er iets op "Nog in te delen" of duidelijk verkeerd ingedeeld, zet
dat in het nakijkrapport. De nieuwe rijen staan rond rij 2044 + (rijnummer in "Import bank" − 5).

De indeling werkt op **trefwoorden** uit het blad "Regels" die in de tegenpartij óf de omschrijving
voorkomen. Twee valkuilen:

- korte trefwoorden matchen soms binnenin een naam (op 30/07/2026 werd "RSDG BV" als Sociaal
  secretariaat geboekt door het trefwoord "SD");
- een bestaande regel kan verkeerd uitpakken voor een **inkomende** betaling van een partij die
  normaal een kost is (F.C. WITGOOR staat als regel op "Onderaanneming"). Ook Van Raak is er zo
  eentje: die wordt op "Poetsmateriaal" geboekt terwijl het brandstof is.

Pas de regelset **nooit** zelf aan — meld enkel welke regel Geert best toevoegt of nakijkt.

Kom je er met geen van beide bronnen met zekerheid uit: doe geen gok-plakactie in dit financiële
bestand — overslaan en melden.

---

# D2 — betalingen importeren in Eenvoudig Factureren (geen Excel nodig)

1. Zoek hoofdletterongevoelig naar `COD_*.CD2` in `uittreksels 2026`.
2. Controleer welke al ingelezen zijn:
   `GET https://eenvoudigfactureren.be/api/v1/banktransactions?sort=-date`. De parameter
   **`sort=-date` is essentieel** — zonder krijg je de 100 oudste uit 2023; `date_from`, `from`,
   `page` en `offset` werken niet. Importeer enkel coda's van ná de meest recente aanwezige datum.
   Elk coda-bestand mag maar één keer ingelezen worden, anders krijg je dubbele betalingen.
3. Lees het bestand, bouw het opnieuw op als regels van exact **128 tekens** (`padEnd`), verifieer
   dat geen enkele regel langer is dan 128, en tel de bedragen van de `21`-records op. Vergelijk met
   het totaal in de `9`-record. Klopt dat niet exact: dat bestand niet importeren, wel melden, en
   doorgaan met de rest.
4. POST de tekst naar `https://eenvoudigfactureren.be/api/v1/banktransactions/import/coda`
   (Content-Type `text/plain`). Succes bevat `banktransaction_count`. Bij een fout: dat bestand als
   mislukt melden en doorgaan.
5. Vraag daarna de nieuwe verrichtingen op en tel hoeveel er al gekoppeld zijn (`allocations`).
   Meestal 0 — dat is normaal; verwijs voor het koppelen naar de "Bank"-module.
