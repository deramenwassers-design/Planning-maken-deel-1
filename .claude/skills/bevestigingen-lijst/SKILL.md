---
name: bevestigingen-lijst
description: ⭐ bevestigingen-lijst — Trekt uit Squeegee (sqgee.com) alle klanten die de komende week ingepland staan en zet ze als Excel-bestand in de Google Drive-map "Claude opdrachten". Draait normaal in de nacht van vrijdag op zaterdag. Gebruik deze skill wanneer Geert vraagt om "de bevestigingenlijst", "de lijst van volgende week", "trek de bevestigingen", "maak de weeklijst", of /bevestigingen-lijst oproept.
---

# Bevestigingen deel 1 — de weeklijst uit Squeegee trekken

Bedrijf: De Ramenwassers (Geert Cools). Antwoord in het Nederlands zoals in België gesproken:
gemoedelijk, concreet, kort, zonder overdreven vetgedrukte tekst.

Doel: één Excel-bestand met alle klanten die de **komende week** ingepland staan, zodat de
twee andere skills daarna kunnen bijhouden wie bevestigd heeft. Deze skill vult de gegevens in;
de kolom "teken" laat ze leeg — die is voor `bevestigingen-opvolgen`.

Dit is deel 1 van drie **losse** skills. Ze draaien apart en op eigen momenten. Loopt deze skill
vast, dan is dat vervelend maar het breekt de andere twee niet. Doe hier dus niets van hun werk:
geen mails naar klanten, geen antwoorden controleren, geen tekens zetten, geen klantnotities.

## Harde regels

1. **Enkel Not Done-jobs.** Nooit Done, nooit Skipped. Zie STAP 3.
2. **Niets wijzigen in Squeegee.** Deze skill leest alleen. Geen namen, geen tijden, geen notities.
3. **Nooit inloggen of een wachtwoord typen.** Verschijnt er een inlogscherm: stop en meld dat
   Geert opnieuw moet inloggen via Google SSO.
4. **Nooit een bestaande weeklijst overschrijven.** Elke week krijgt zijn eigen bestandsnaam.
5. **Liever een gedeeltelijke lijst dan geen lijst.** Loopt iets vast, schrijf weg wat je hebt en
   meld precies wat ontbreekt.

## STAP 0 — Doelweek bepalen

De doelweek is standaard de **eerstvolgende maandag t/m vrijdag**. Geeft Geert iets anders mee
("de week van 1 september", "deze week nog"), volg dat dan.

Het weekend hoort er nooit bij. Zaterdag en zondag worden niet opgehaald, ook niet als er die
dagen jobs staan — die klanten krijgen geen bevestigingsvraag.

Reken altijd met bash in de juiste tijdzone, nooit uit het hoofd:

```bash
TZ=Europe/Brussels date -d "next monday" +%Y-%m-%d    # maandag van de doelweek
TZ=Europe/Brussels date -d "next monday" +%G-W%V      # bv. 2026-W35 → in de bestandsnaam
TZ=Europe/Brussels date -d "next monday +4 days" +%Y-%m-%d   # vrijdag, de laatste dag
```

Let op: draait de taak in de nacht van vrijdag op zaterdag, dan is het al zaterdag. `next monday`
geeft dan nog steeds de juiste maandag. Draait ze uitzonderlijk op een maandag, dan geeft
`next monday` de week **erna** — controleer in dat geval expliciet of dat de bedoeling is.

Bevestig de doelweek in één zin ("Ik trek de lijst voor de week van maandag 24 augustus 2026")
en maak meteen een takenlijst (TaskCreate) zodat Geert de voortgang ziet.

## STAP 1 — Squeegee openen

**Eerst kijken of Squeegee al open staat.**

Open nooit blind een nieuwe tab. Squeegee is offline-first: een verse tab kost 30-60 sec sync en
soms een nieuwe login, terwijl een reeds geopend tabblad meteen bruikbaar is.

1. Vraag met `tabs_context_mcp` de lijst van open tabbladen op.
2. Zit daar een tab met `sqgee.com` in de URL? Gebruik die en werk daarin verder. Niet herladen —
   een herlaad start de volledige cloudsync opnieuw.
3. Staat die tab op een andere Squeegee-pagina (bv. een klantfiche), gebruik dan `navigate` naar
   `https://sqgee.com/schedule` binnen datzelfde tabblad (geef de tabId expliciet mee).
4. Alleen als er geen sqgee.com-tab bestaat: `tabs_create_mcp` + `navigate` naar
   `https://sqgee.com/schedule`.
5. Vermeld in je eindbericht in enkele woorden wat het geworden is: "bestaand tabblad hergebruikt"
   of "nieuw tabblad geopend".

Geen browser verbonden of geen enkel tabblad bereikbaar: stop, wijzig niets, en verwittig Geert per
mail (onderwerp "CLAUDE WACHT: ..."). Is de sessie vanaf zijn gsm gestart, vermeld er dan bij dat de
browsertoegang eerst op de pc goedgekeurd moet worden — die toestemmingsvraag verschijnt daar en
blijft anders onbeantwoord staan.

Wacht de cloudsync geduldig af (~30-60 sec) en controleer met `get_page_text`, niet met herhaalde
screenshots. Blijft de tab langer dan ~45 sec hangen: probeer het **nog één keer** met een verse
tab. Lukt het dan nog niet, stop en meld het.

Zet meteen een wake lock — deze taak draait 's nachts en zijn scherm ging vroeger in slaapstand:

```js
let wl; try{ if(!('wakeLock' in navigator)){wl='niet ondersteund'} else {
  window.__wl = await navigator.wakeLock.request('screen');
  if(!window.__wlHandler){window.__wlHandler=async()=>{if(document.visibilityState==='visible'){try{window.__wl=await navigator.wakeLock.request('screen')}catch(e){}}};
  document.addEventListener('visibilitychange',window.__wlHandler)} wl='wake lock actief' } }catch(e){ wl='geweigerd: '+e.name } wl
```

Lukt dat niet, ga gewoon verder maar vermeld het op het einde.

## STAP 2 — De juiste week en dag kiezen

Klik in het linkermenu op **Werkplanner** en blijf in de **staafdiagram-/dagweergave** (het eerste
van de drie icoontjes). Dat is bewust niet de persoonsweergave: je wil alle klanten van de dag,
niet die van één gast.

Blader met `navigate_next` naar de doelweek. Controleer met `get_page_text` dat de weekkop
effectief de doelweek toont vóór je begint te lezen. Een week te ver levert een volledig
verkeerde lijst op, en die lijst gaat rechtstreeks naar klanten toe.

Loop daarna de dagen van maandag t/m vrijdag één voor één af. Zaterdag en zondag sla je over,
ook als er jobs op staan — die horen niet in de bevestigingen. Dagen zonder Not Done-jobs sla je
gewoon over — ze horen niet in de lijst en verdienen geen melding.

## STAP 3 — Per dag de Not Done-lijst lezen

Onder de dagbalk staat een kop in de vorm `<aantal> | Not Done | <duur> | <km>`. Noteer dat
aantal: dat is je verwachte aantal jobs voor die dag.

1. Lees met `get_page_text`.
2. Neem **uitsluitend** de jobs uit het Not Done-blok. Stop bij de eerstvolgende kop
   `<getal> | Done | …` en ga nooit door tot in `<getal> | Skipped`.
   Kleurcode bij twijfel: Not Done = blauw, Done = groen, Skipped = geel/oranje.
3. Per jobregel staan het adres en de **klantnaam**. Noteer de naam **exact**, inclusief haakjes,
   hoofdletters, spaties en de tekens die er al staan (⤵️, 🧽, ❗, 📷). Die naam gaat later
   ongewijzigd in kolom C.
4. Noteer ook de **dienst** van de job. In Squeegee staan daar de technische dienstregels, vaak
   meerdere na elkaar, bijvoorbeeld `Ramenwassen: buitenkant, veluxen buitenkant, valwand buiten
   en binnenkant` of `zonnepanelen poetsen, veluxen buitenkant`. Neem ze **letterlijk** over,
   gescheiden door komma's — niet samenvatten en niet vertalen. `bevestigingen-herinnering` leidt
   er zelf de soort werk uit af. Staat er niets bruikbaar op de regel, open dan het jobpaneel en
   lees de dienstomschrijving daar. Laat de kolom bij twijfel leeg en meld de klant.
5. Sla "Pauze"/break-items en generieke €0,00-regels over. Die hebben geen echte klant.

### Doorladen na 50 (belangrijk)

De lijst toont maximaal 50 items. Onderaan verschijnt dan een grijze kader in de trant van
`Showing 50 of <totaal> / Not done, load more?`. **Klik daarop**, wacht 2-3 seconden en lees
opnieuw. Herhaal tot die kader niet meer verschijnt en het aantal gelezen jobs overeenkomt met het
aantal uit de Not Done-kop. Anders mis je stil de helft van de week.

## STAP 4 — Ontdubbelen naar één rij per klant per dag

Zet de gelezen jobs om naar unieke combinaties van **klant + dag**:

- Dezelfde klant met drie jobs op dinsdag = één rij.
- Dezelfde klant op dinsdag én donderdag = twee rijen.
- Twee verschillende diensten op dezelfde dag = één rij, diensten samengevoegd met " + ".

Ontdubbel op **klantnummer**, niet op naam of adres. Twee huizen kunnen dezelfde bewoner hebben en
twee klanten kunnen dezelfde naam dragen. Heb je het klantnummer nog niet, gebruik dan voorlopig
naam + adres en corrigeer in STAP 5 zodra je het nummer kent.

Meld in één regel: doelweek, aantal Not Done-jobs, aantal unieke klant-dagcombinaties.

## STAP 5 — Klantgegevens ophalen

Voor kolommen B, D en E heb je de klantfiche nodig: klantnummer (`CUS…`), telefoonnummer en
mailadres. Die staan niet in de dagplanning.

Biedt Squeegee een klantenexport aan (Klanten → export/CSV), gebruik die — dat is veel sneller dan
fiches openen en scheelt tientallen kliks. Kan dat niet, doe het dan per klant:

1. Klik de jobkaart aan; rechts opent het jobpaneel.
2. Klik onderaan de regel met het personage-icoontje (de klantnaam met het balansbedrag). De
   klantfiche opent.
3. Lees klantnummer, telefoonnummer en mailadres met `get_page_text`.
4. Sluit de fiche en ga naar de volgende.

Vertrek altijd van de job, nooit via het zoekvak in het Klanten-menu: bij naamgenoten open je
anders de verkeerde fiche, en dan mailt skill 3 de verkeerde persoon.

Een klant die meerdere keren in de week voorkomt, open je **één keer** — hergebruik de gegevens
voor al zijn rijen.

Tijdslimiet: ongeveer 25 minuten voor deze stap. Loop je daar tegenaan, schrijf dan de lijst weg
met de gegevens die je hebt, laat de ontbrekende velden leeg en zet die klanten in het eindbericht
bij "gegevens ontbreken". Een klant zonder mailadres én zonder telefoonnummer kan skill 2 niet
opvolgen en skill 3 niet mailen — vermeld die apart.

Ontbreekt enkel het mailadres, laat kolom E dan leeg. Verzin nooit een adres en leid er nooit een
af uit de naam.

## STAP 6 — Het Excel-bestand bouwen en in Drive zetten

Eén tabblad, **"Bevestigingen"**. Rij 1 is de kopregel:

```
dag | klantnummer | naam | telefoonnummer | mailadres | dienst | teken | antwoord | herinnering
```

- **dag**: `DD/MM/JJJJ (ma)` — datum plus de afkorting van de weekdag.
- **teken**, **antwoord**, **herinnering**: leeg laten. Die zijn voor de andere twee skills.
- Sorteer op dag, en binnen een dag in de volgorde waarin de jobs in Squeegee staan (dat is de
  rijvolgorde) — zo herkent Geert zijn eigen planning terug.
- Maak de kopregel vet, zet tekstterugloop uit en geef de kolommen een leesbare breedte. Meer
  opmaak is niet nodig.

Bouwen doe je met openpyxl. Bestandsnaam:

```
Bevestigingen_<ISO-jaar>-W<ISO-weeknummer>.xlsx     bv. Bevestigingen_2026-W35.xlsx
```

Wegschrijven naar Drive:

1. Zoek de map: `title = 'Claude opdrachten'` in de Drive van `deramenwassers@gmail.com`, en
   daarbinnen de submap `bevestigingen` (`parentId = '<id van Claude opdrachten>'`).
2. Bestaat die submap niet, maak ze aan met `create_file`,
   `contentMimeType: 'application/vnd.google-apps.folder'`.
3. Upload met `create_file`: `base64Content` met de bytes van het bestand,
   `contentMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'`, en
   **`disableConversionToGoogleType: true`** — zonder dat wordt het een Google Sheet en kunnen de
   andere twee skills er niet mee verder.
4. Bestaat er al een bestand met exact dezelfde titel (een herstart van dezelfde week), zet dan het
   oude na een geslaagde upload in de prullenbak met `trash_file`, zodat er één actuele lijst is.

Zet de lijst **niet** in de wortel van "Claude opdrachten": dat is de opdrachtenwachtrij met de
menukaartjes.

Lever het bestand ook af in het gesprek met `SendUserFile`, zodat Geert het meteen kan openen.

## STAP 7 — Afronden

Kort bericht in het Nederlands:

- de doelweek en de bestandsnaam;
- aantal rijen, aantal unieke klanten, en de verdeling per dag (bv. "ma 12, di 9, wo 14, …");
- klanten zonder mailadres en klanten zonder enige contactgegevens;
- klanten waarvan de dienst niet vast te stellen was;
- of de "load more"-kader gebruikt is en hoe vaak;
- wat niet gelukt is en waarom (venster te smal, wake lock geweigerd, Squeegee blijven hangen,
  tijdslimiet op STAP 5).

Geen opsomming van alles wat wél klopte.

## Mail (verplicht)

Pushmeldingen komen bij Geert niet aan; enkel e-mail geeft geluid op zijn gsm. Nooit naar de
gekoppelde mailbox zelf sturen: is `deramenwassers@gmail.com` gekoppeld, mail dan naar
`geertensanne@gmail.com`, en omgekeerd.

- Wacht je op een antwoord (login, geen browser, welke week)? Stuur EERST
  `mcp__Gmail__send_message`, onderwerp `CLAUDE WACHT: <kern in enkele woorden>`, body in 2-3
  lijnen. Pas daarna de vraag in het gesprek stellen.
- Afgerond? Onderwerp `CLAUDE KLAAR: bevestigingenlijst week <JJJJ-Wnn> klaar` met de samenvatting
  uit STAP 7.
- Label die mail daarna met `mcp__Gmail__label_message`: label "Claude wacht" (labelId opzoeken met
  `mcp__Gmail__list_labels`) plus `IMPORTANT`. Lukt het labelen niet, laat het en ga verder.
