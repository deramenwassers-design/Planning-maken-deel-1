---
name: bevestigingen-opvolgen
description: ⭐ bevestigingen-opvolgen — Vergelijkt de weeklijst met de bevestigingen die binnenkomen via Gmail en sms (Google Messages voor Web), zet per klant een teken in de lijst en houdt een leesbaar overzicht in de mailbox. Draait normaal elk uur vanaf maandagochtend. Gebruik deze skill wanneer Geert vraagt om "de bevestigingen nakijken", "wie heeft er geantwoord", "de tekens zetten", "de lijst bijwerken", of /bevestigingen-opvolgen oproept.
---

# Bevestigingen deel 2 — antwoorden controleren en tekens zetten

Bedrijf: De Ramenwassers (Geert Cools). Antwoord in het Nederlands zoals in België gesproken:
gemoedelijk, concreet, kort, zonder overdreven vetgedrukte tekst.

Doel: bij elke klant die geantwoord heeft het juiste teken in de weeklijst zetten, en Geert een
overzicht geven dat hij op zijn gsm kan bekijken. Deze skill draait **elk uur**, dus ze moet
zonder problemen tien keer na elkaar kunnen lopen zonder dubbel werk te doen.

Dit is deel 2 van drie **losse** skills. Ze maakt zelf geen lijst aan (dat doet
`bevestigingen-lijst`) en ze stuurt zelf geen herinneringen naar klanten (dat doet
`bevestigingen-herinnering`). Doe niets van hun werk.

## Harde regels

1. **Nooit stilzwijgend doorgaan met onvolledige gegevens.** Is een van de twee bronnen (Gmail of
   sms) niet leesbaar, dan mag de andere gewoon verwerkt worden, maar het moet gemeld worden. Zie
   "Als de sms-pagina niet leesbaar is".
2. **Geen klantmails versturen.** Deze skill mailt enkel naar Geert.
3. **In Squeegee alleen de klantnotitie.** Nooit een naam, prijs, status of tijd wijzigen.
4. **Het nieuwste antwoord wint.** Antwoordt een klant twee keer, dan telt het laatste bericht.
5. **Bouw nooit een half lijstbestand.** Faalt het inlezen of samenstellen, laat het bestaande
   bestand ongemoeid en meld het.

## STAP 0 — De lijst van deze week zoeken

Bereken eerst het weeknummer, met bash, nooit uit het hoofd:

```bash
TZ=Europe/Brussels date +%G-W%V        # de week waarin we nu zitten
```

Zoek in Drive op titel, niet op map:

```
title contains 'Bevestigingen_' and title contains '2026-W35'
```

Staan er meerdere treffers met dezelfde titel, neem dan die met de meest recente `modifiedTime`
en vermeld dat in het eindbericht. Download hem en lees het tabblad "Bevestigingen" met openpyxl.

Kolommen: `dag | klantnummer | naam | telefoonnummer | mailadres | dienst | teken | antwoord |
herinnering`. Ontbreken kolom H (antwoord) of I (herinnering), voeg ze dan toe met hun kopregel.

Geen lijst gevonden: stop, wijzig niets, en mail Geert (`CLAUDE WACHT: geen bevestigingenlijst
voor week <JJJJ-Wnn>`). Deze skill maakt zelf geen lijst aan — dan is `bevestigingen-lijst`
niet gelopen.

Bepaal ook het **venster** waarin je antwoorden zoekt: vanaf de aanmaakdatum van het lijstbestand
(`createdTime` uit Drive) tot nu. Dat is het moment waarop de bevestigingsvragen buiten gingen.

## STAP 0b — Antwoorden die al in de klantnaam staan

Geert noteert afspraken soms rechtstreeks in de klantnaam in Squeegee, en die naam staat
onveranderd in kolom C. Loop de lijst dus één keer door vóór je Gmail opent:

| Staat er in de naam | Teken | In kolom H |
|---|---|---|
| `OK BEVESTIGD` | `✅` | `naam in Squeegee — OK BEVESTIGD` |
| `KLANT VRAAGT WEEK <datum>` en die datum valt in deze week | `✅` | `naam in Squeegee — klant vroeg zelf deze week` |
| `KLANT VRAAGT WEEK <datum>` en die datum valt buiten deze week | `☒` | de letterlijke tekst |
| `ZO SNEL MOGELIJK INPLANNEN`, `MT NT ANTWRDN`, `OPBELLEN` | laat leeg | de letterlijke tekst, als aandachtspunt |

Dat scheelt herinneringsmails naar klanten die de afspraak zelf gevraagd hebben — precies de
mails die het meest ergerlijk zijn om te krijgen.

Een teken uit deze stap is zwakker dan een echt antwoord: komt er later een mail of sms binnen,
dan wint die en werk je kolom G en H bij.

## STAP 1 — Gmail: antwoorden ophalen

Zoek gericht op de mailadressen uit kolom E, niet op de hele inbox. Bouw de query in blokken van
ongeveer 25 adressen, anders wordt ze te lang:

```
newer_than:10d (from:jan@example.be OR from:mie@example.be OR ...)
```

Gebruik `mcp__Gmail__search_threads`, en lees enkel de threads die iets nieuws bevatten met
`mcp__Gmail__get_thread`.

Doe daarna één brede veegslag voor klanten die vanaf een ánder adres antwoorden of van wie het
mailadres ontbreekt: zoek op achternaam of op straatnaam uit de lijst, telkens met
`newer_than:10d`. Vind je zo een antwoord, noteer dan in kolom H dat het van een afwijkend adres
kwam, zodat Geert dat adres kan bijwerken.

Negeer je eigen verzonden mail (`-in:sent`), automatische afwezigheidsberichten en
bounce-meldingen. Een bounce is geen antwoord: laat het teken leeg en zet in kolom H
`mail onbestelbaar`.

## STAP 2 — sms: Google Messages voor Web

De sms-antwoorden komen binnen op Google Messages voor Web, in dezelfde browser.

1. Kijk eerst met `tabs_context_mcp` of er al een tab op `messages.google.com` open staat en
   gebruik die. Anders `tabs_create_mcp` + `navigate` naar `https://messages.google.com/web`.
2. Wacht 5-10 seconden en lees met `get_page_text`.
3. Je zit goed als je de gesprekkenlijst ziet met namen/nummers en berichtvoorbeelden.
4. Open enkel de gesprekken van nummers uit kolom D die een bericht hebben binnen het venster uit
   STAP 0. Vergelijk telefoonnummers op de **laatste 9 cijfers** — `+32475123456`, `0475 12 34 56`
   en `0475/123456` zijn hetzelfde nummer.
5. Lees het laatste inkomende bericht en noteer tijdstip en tekst.

### Als de sms-pagina niet leesbaar is

De koppeling van Google Messages voor Web valt om de zoveel weken weg. Geert herstelt dat door de
wifi op zijn gsm even uit en weer aan te zetten.

Zie je een QR-koppelscherm, "Apparaat koppelen", "Wachten op verbinding", of blijft de
gesprekkenlijst leeg terwijl er wél klanten met een telefoonnummer in de lijst staan:

- **Ga niet stilzwijgend door.** Zet bij de klanten waarvoor je enkel sms had geen teken en zet in
  kolom H `sms niet leesbaar op DD/MM JJ:MM`.
- Mail Geert met onderwerp **`CLAUDE WACHT: sms-koppeling herstellen`** en in twee lijnen wat hij
  moet doen (wifi op de gsm uit en weer aan).
- **Stuur die mail hoogstens één keer per 12 uur.** Deze skill draait elk uur; anders staan er
  vijftien identieke mails in zijn inbox. Controleer eerst met
  `search_threads` op `subject:"CLAUDE WACHT: sms-koppeling herstellen" newer_than:1d`. Is er al
  zo'n mail, sla het versturen over en vermeld het enkel in het eindbericht.
- De Gmail-controle uit STAP 1 loopt gewoon door. Werk die volledig af.

## STAP 3 — Het juiste teken bepalen

Kopieer de tekens letterlijk uit dit bestand. Nooit natypen, nooit een gelijkend teken gebruiken
(✔️, ✖️, ⛔).

| Teken | Unicode | Wanneer |
|---|---|---|
| `✅` | U+2705 | Positief en verder niets aan te doen: "ja hoor", "prima", "tot dan", "ok". |
| `☒` | U+2612 | Positief, maar er is nog actie nodig: een ander uur gevraagd, "bel eens", een poort die op slot is, een extra opdracht, een vraag over de prijs, betaling nog te regelen. |
| `❌` | U+274C | Overslaan, een week opschuiven, of een andere afmelding: "niet deze keer", "we zijn op reis", "liever volgende maand", opzegging. |

Regels:

- **Leeg blijft leeg** als er geen antwoord is. Een leeg teken is geen fout, het is de toestand
  "nog niets gehoord" — daar werkt `bevestigingen-herinnering` mee.
- **Bij twijfel `☒`**, met de letterlijke tekst in kolom H, en vermeld die klant apart in je
  eindbericht. Beter dat Geert er even naar kijkt dan dat een afmelding als bevestiging doorgaat.
- **Staat er al een teken en komt er een nieuwer antwoord**, werk het dan bij en zet in kolom H
  beide: `was ✅ 25/08 07:14 — nu ❌ 25/08 16:02: toch op reis`. Nooit stilzwijgend overschrijven.
- Kolom H krijgt altijd bron, tijdstip en de kern van het antwoord, bv.
  `sms 25/08 07:14 — kan pas na 14u`. Kort houden, maar wel de woorden van de klant.

## STAP 4 — Bij `☒`: de klantnotitie in Squeegee

Enkel voor klanten die in **deze run** een `☒` krijgen. Een klant die vorige week al een notitie
kreeg, doe je niet opnieuw — je herkent dat aan het merkteken `[notitie in Squeegee]` achteraan in
kolom H.

Open Squeegee volgens het gewone ritueel:

1. `tabs_context_mcp`; bestaat er een `sqgee.com`-tab, gebruik die en herlaad niet. Anders
   `tabs_create_mcp` + `navigate` naar `https://sqgee.com/schedule`. Wacht de cloudsync af
   (~30-60 sec), controleer met `get_page_text`.
2. Verschijnt er een inlogscherm: stop met dit onderdeel, typ nooit een wachtwoord, en meld dat
   Geert via Google SSO moet inloggen. De rest van de skill loopt gewoon door.
3. Zoek de job van die klant op de dag uit kolom A en klik de jobkaart aan.
4. Klik onderaan in het jobpaneel de regel met het personage-icoontje aan — de klantfiche opent.
   Ga altijd via de job, nooit via het zoekvak in het Klanten-menu: bij naamgenoten open je anders
   de verkeerde fiche.
5. Controleer dat het klantnummer op de fiche overeenkomt met kolom B. Klopt het niet, sluit af en
   sla die klant over.
6. Open het ⋮-menu rechtsboven op de klantfiche → **Klant bewerken** → het notitieveld.
7. Voeg de notitie **achteraan toe** op een nieuwe regel, in de vorm
   `25/08 sms: kan pas na 14u`. Nooit bestaande notities wissen of vervangen.
8. Klik **OPSLAAN** en lees met `get_page_text` terug dat de notitie er effectief staat.
9. Zet in kolom H achteraan ` [notitie in Squeegee]`.

Weergavefout om te kennen: na het opslaan blijft de titelbalk van de klantkaart soms de oude
gegevens tonen. Controleer in het veld zelf, niet in de titelbalk.

Reageert een paneel na 2-3 pogingen niet: sla die klant over, noteer het, ga verder. Geen diepe
debugging met `javascript_tool` of `resize_window` op de sqgee.com-tab — dat maakte de browser
eerder onstabiel.

> Dit klikpad volgt hetzelfde patroon als de andere Squeegee-skills, maar het notitieveld zelf is
> nog niet in een begeleide run bevestigd. Wijkt het scherm af van wat hier staat, pas dan niets
> aan, meld het, en werk dit bestand bij zodra het pad bekend is.

## STAP 5 — De lijst wegschrijven

De Drive-tools kunnen de inhoud van een bestaand bestand niet wijzigen. Bijwerken gaat dus zo:

1. Bouw de volledige nieuwe inhoud eerst in het geheugen op, met openpyxl, op basis van het
   ingelezen bestand. Behoud de opmaak, herschrijf niet van nul.
2. Is er niets veranderd sinds de vorige run, **schrijf dan niet**. Elk uur een nieuw bestand
   wegschrijven zonder wijziging is enkel ruis. Ga door naar STAP 6.
3. Anders: `create_file` met **dezelfde titel** in dezelfde map,
   `contentMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'` en
   `disableConversionToGoogleType: true`.
4. Zet daarna het oude bestand in de prullenbak met `trash_file`.

Lukt stap 4 niet, meld dat dan — er staan dan twee bestanden met dezelfde titel, en de volgende
run moet die met de nieuwste `modifiedTime` nemen.

## STAP 6 — Het overzicht in de mailbox

Geert moet de stand van zaken op zijn gsm kunnen bekijken. Houd daarvoor **één mailthread per
week** bij.

- Onderwerp: `Bevestigingen week <JJJJ-Wnn> — stand van zaken`.
- Eerste run van de week: nieuwe mail met `mcp__Gmail__send_message`.
- Latere runs: zoek die thread op met `search_threads` (`subject:"Bevestigingen week 2026-W35"`)
  en antwoord erin met `mcp__Gmail__reply`, zodat alles onder elkaar blijft staan.
- **Stuur enkel iets als er sinds de vorige run een teken bijgekomen of gewijzigd is.** Anders
  niets versturen. Zonder die regel krijgt Geert vijftien identieke mails per dag.
- Mail naar `geertensanne@gmail.com` — nooit naar de gekoppelde mailbox zelf.

Inhoud, kort en leesbaar op een klein scherm:

```
Week 35 — 47 klanten
✅ 31   ☒ 4   ❌ 5   nog niets 7

Nieuw sinds vorige controle
✅ Jan Peeters (di) — "ja hoor, tot dinsdag"
☒ Mie Willems (wo) — kan pas na 14u  → notitie in Squeegee gezet
❌ Karel Aerts (do) — op reis, week opschuiven

Nog niets gehoord (7)
ma: Peeters, Janssens · di: Cools · wo: … 
```

Zet de klanten met een `☒` en de twijfelgevallen bovenaan — dat is wat actie vraagt.

## STAP 7 — Afronden

Kort bericht in het gesprek:

- welke week en welk lijstbestand;
- de telling per teken, en hoeveel er in deze run zijn bijgekomen;
- de `☒`-klanten en de twijfelgevallen, met naam;
- of de sms-koppeling werkte, en of de wachtmail al eerder verstuurd was;
- klanten waarvan de klantnotitie niet gelukt is;
- of het lijstbestand herschreven is, of dat er niets te wijzigen viel.

Geen opsomming van alles wat al klopte.

## Mail (verplicht)

Pushmeldingen komen bij Geert niet aan; enkel e-mail geeft geluid op zijn gsm. Nooit naar de
gekoppelde mailbox zelf sturen: is `deramenwassers@gmail.com` gekoppeld, mail dan naar
`geertensanne@gmail.com`, en omgekeerd.

- Wacht je op een antwoord (sms-koppeling, geen lijst, login)? Stuur EERST
  `mcp__Gmail__send_message`, onderwerp `CLAUDE WACHT: <kern in enkele woorden>`, body in 2-3
  lijnen. Pas daarna de vraag in het gesprek stellen. Denk aan de regel van hoogstens één
  wachtmail per 12 uur per onderwerp — deze skill draait elk uur.
- Label die mail daarna met `mcp__Gmail__label_message`: label "Claude wacht" (labelId opzoeken met
  `mcp__Gmail__list_labels`) plus `IMPORTANT`. Lukt het labelen niet, laat het en ga verder.
- Een `CLAUDE KLAAR`-mail hoort hier **niet** bij elke run. Het uurlijkse overzicht uit STAP 6 is
  de melding. Stuur enkel `CLAUDE KLAAR: bevestigingen week <JJJJ-Wnn> volledig` op het moment dat
  élke rij een teken heeft — dan is de opvolging van die week rond.
