---
name: bevestigingen-herinnering
description: ⭐ bevestigingen-herinnering — Stuurt een tweede, vriendelijke mail naar de klanten uit de weeklijst die nog niet geantwoord hebben op de vraag om te bevestigen. Draait normaal maandagochtend om 8u30. Gebruik deze skill wanneer Geert vraagt om "de herinneringen sturen", "de tweede mail", "wie nog niet geantwoord heeft nog eens mailen", of /bevestigingen-herinnering oproept.
---

# Bevestigingen deel 3 — de herinneringsmail

Bedrijf: De Ramenwassers (Geert Cools). Antwoord in het Nederlands zoals in België gesproken:
gemoedelijk, concreet, kort, zonder overdreven vetgedrukte tekst.

Doel: elke klant uit de weeklijst die op dat moment nog geen antwoord gegeven heeft, krijgt één
tweede mail met de vraag of het lukt.

Dit is deel 3 van drie **losse** skills. Ze zet zelf geen tekens (dat doet
`bevestigingen-opvolgen`) en ze maakt zelf geen lijst (dat doet `bevestigingen-lijst`).

**Deze skill stuurt mail naar echte klanten.** Dat is haar opdracht en het is vooraf goedgekeurd —
vraag dus geen bevestiging per klant. Maar het is ook het enige onderdeel van het geheel dat naar
buiten gaat, en een mail is niet terug te halen. De controles in STAP 1 zijn er om die reden en
mogen niet overgeslagen worden.

## Harde regels

1. **Eén mail per klant per week.** Nooit twee keer. Kolom I is daarvoor.
2. **Enkel rijen met `❓`.** Wie al `✅`, `❌` of `❎` heeft, krijgt niets.
3. **Enkel per mail.** Geen sms, geen telefoon. Klanten zonder mailadres worden gemeld, niet
   gecontacteerd.
4. **De dienst uit kolom F bepaalt de tekst.** Staat die kolom leeg, gebruik dan de neutrale
   variant uit STAP 2.
5. **Niets wijzigen in Squeegee.** Deze skill komt daar niet.

## STAP 0 — De lijst van deze week zoeken

Het weeknummer staat meestal in de opdracht: "herinnering sturen van week 36". Gebruik dat.
Staat er geen weeknummer in, neem dan de week waarin we nu zitten:

```bash
TZ=Europe/Brussels date +%G-W%V
```

Zoek in Drive op titel, niet op map:

```
title contains 'Bevestigingen_' and title contains '2026-W35'
```

Meerdere treffers met dezelfde titel? Neem die met de meest recente `modifiedTime` en vermeld dat.
Download het bestand en lees het tabblad "Bevestigingen" met openpyxl. Ontbreekt kolom I
(herinnering), voeg ze toe met haar kopregel.

Geen lijst gevonden: stop, verstuur niets, en mail Geert
(`CLAUDE WACHT: geen bevestigingenlijst voor week <JJJJ-Wnn>`).

## STAP 1 — Bepalen wie een mail krijgt, en drie controles

Kandidaat = een rij met **kolom G op `❓`** (of leeg, bij een oude lijst), **kolom E gevuld** en
**kolom I leeg**.

Doe daarna deze drie controles vóór je ook maar één mail verstuurt:

1. **Klopt de week?** Is de eerste datum in kolom A niet de maandag van deze week, dan heb je de
   verkeerde lijst te pakken. Stop en meld het.
2. **Heeft `bevestigingen-opvolgen` gedraaid?** Staat in de **hele** lijst nergens een `✅`, `❌`
   of `❎` — dus overal nog `❓` — dan is de opvolging waarschijnlijk niet gelopen en zou je
   iederéén mailen, ook wie al netjes geantwoord heeft. Verstuur dan niets, mail Geert
   (`CLAUDE WACHT: nog geen enkel antwoord verwerkt — herinneringen niet verstuurd`) en stop.
3. **Is het aantal geloofwaardig?** Gaan er meer dan 40 mails buiten, of meer dan drie kwart van
   de lijst, stop dan en vraag het eerst na. Dat is geen normale maandag.

Zijn er nul kandidaten, dan is er niets te doen: meld dat in één zin en stop. Dat is een goed
resultaat, geen fout.

Kandidaten zonder mailadres (kolom G op `❓` maar kolom E leeg) krijgen niets. Zet ze in het
eindbericht apart onder "zelf bellen of sms'en" — dat zijn de klanten die anders door de mazen
vallen.

Meld vóór je begint in één regel: aantal rijen, aantal zonder antwoord, aantal mails dat je gaat
sturen, aantal zonder mailadres.

## STAP 2 — De tekst

Toon: gemoedelijk en professioneel, zoals Geert zelf schrijft. Niet overdreven formeel, geen
verkooppraat, geen uitroeptekens, geen druk. Het is een herinnering, geen aanmaning.

Onderwerp: `Uw afspraak van <dag> — even bevestigen?`

### De middelste zin uit kolom F

**Plak kolom F nooit letterlijk in de mail.** In Squeegee staan daar de technische
dienstregels, vaak meerdere na elkaar, bijvoorbeeld:

```
Ramenwassen: buitenkant, veluxen buitenkant, valwand buiten en binnenkant
bijgebouw buitenkant, ramenwassen: huis buitenkant, verandadak bovenkant, coating plaatsen op poort
zonnepanelen poetsen, veluxen buitenkant, Kader van de raam vooraan op de 1ste verdieping poetsen
Dakranden poetsen, Dakgoot ledigen
```

Zoiets in een klantmail zetten leest als een systeemuitdraai. Leid er in plaats daarvan de
**soort werk** uit af, met deze trefwoorden (hoofdletterongevoelig, ergens in de tekst):

| Trefwoord in kolom F | Soort werk |
|---|---|
| `ramenwassen`, `ramen wassen`, `velux`, `veranda`, `valwand`, `koepel`, `lichtstraat`, `schuiframen`, `vitrine`, `inkom`, `voorkant`, `buitenkant`, `binnenkant` | de ramen wassen |
| `zonnepanelen`, `panelen` | de zonnepanelen poetsen |
| `dakgoot`, `dakrand`, `afdak`, `boogdak` | het dakwerk |
| `poort`, `rolluik`, `screens`, `coating` | (nooit op zich — enkel meenemen naast een van de bovenstaande) |

Regels:

- Eén soort gevonden → `Lukt het voor u om <dag> de ramen te laten wassen?`
- Twee soorten → noem er hoogstens twee, met "en":
  `Lukt het voor u om <dag> de ramen te laten wassen en de zonnepanelen te laten poetsen?`
- Drie of meer, of enkel woorden uit de laatste rij, of kolom F leeg →
  `Lukt het voor u om <dag> langs te komen voor de geplande werken?`

Bij twijfel neem je altijd de laatste, neutrale zin. Die klopt sowieso, en dat is meer waard dan
een specifieke zin die ernaast zit.

`<dag>` schrijf je uit zoals mensen praten: "dinsdag 26 augustus", niet "26/08/2026".

Model:

```
Dag <voornaam>,

Wij hadden u laten weten dat wij <dag> bij u langskomen, maar wij hebben daar nog geen
antwoord op ontvangen.

Lukt het voor u om <dag> de ramen te laten wassen?

Een kort berichtje volstaat — ja of neen, dan weten wij waar wij aan toe zijn.
Past het die dag niet, laat het gerust weten, dan schuiven wij het op.

Met vriendelijke groeten,
Geert
De Ramenwassers
```

Voor de aanspreking neem je de **voornaam** uit kolom C, dus zonder de haakjes en zonder de tekens
(⤵️, 🧽, ❗, 📷, ✅, ❌, ❎, ❓) die in Squeegee achter de naam staan. Ook de opmerkingen in
HOOFDLETTERS die soms los in de naam staan ("ZO SNEL MOGELIJK INPLANNEN", "OK BEVESTIGD",
"KLANT VRAAGT WEEK 31 AUG") horen er niet bij.

Gebruik `Dag,` op zich zodra de voornaam niet zeker is:

- een bedrijfsnaam (`ILIMMO BV`, `VrijeBasisschool Weg-wijzer Dessel`, `De_Krokodil (Twdm Bv)`);
- een naam die met `Moeder_`, `Vader_` of `Ouders` begint — dat is de klantadministratie van Geert,
  geen voornaam (`Moeder_Eddy Stessens`, `Ouders Luc Mortier`);
- twee namen samen (`Wies - Jef Smets`, `Karin Van Laer - Willy Hendrickx`) — schrijf dan `Dag,`,
  niet één van de twee;
- enkel een achternaam of initialen (`Mr.Donckers`).

Nooit gokken naar een voornaam en nooit "Beste heer/mevrouw" verzinnen.

De mail vertrekt vanuit de gekoppelde mailbox `deramenwassers@gmail.com`, dus gewoon met
`mcp__Gmail__send_message` zonder afzender in te stellen.

## STAP 3 — Versturen en meteen markeren

Werk de kandidaten één voor één af. Per klant:

1. Bouw de tekst met de juiste dag, dienst en aanspreking.
2. Lees ze na op de dingen die opvallen als er iets misloopt: staat er nog een `<dag>`-plaatshouder
   in? Klopt de dienst met kolom F? Is het mailadres dat van deze rij?
3. Verstuur met `mcp__Gmail__send_message`.
4. Zet **meteen** in kolom I `herinnerd DD/MM JJ:MM`. Niet pas op het einde: breekt de run
   halverwege, dan mag de volgende run de eerste helft niet opnieuw mailen.
5. Mislukt het versturen, zet dan `NIET GELUKT: <korte reden>` in kolom I en ga verder met de
   volgende. Blijf niet herproberen.

Vraag geen bevestiging per klant — dit is vooraf goedgekeurd.

## STAP 4 — De lijst wegschrijven

De Drive-tools kunnen de inhoud van een bestaand bestand niet wijzigen. Bijwerken gaat dus zo:

1. Bouw de volledige nieuwe inhoud eerst in het geheugen op met openpyxl, vertrekkend van het
   ingelezen bestand. Behoud de opmaak, herschrijf niet van nul.
2. `create_file` met **dezelfde titel** in dezelfde map,
   `contentMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'` en
   `disableConversionToGoogleType: true`.
3. Zet daarna het oude bestand in de prullenbak met `trash_file`.

Lukt het wegschrijven niet, dan zijn de mails wél buiten maar staat het niet in de lijst. Dat is de
ergste afloop van deze skill: de volgende run zou dezelfde klanten opnieuw mailen. Meld het dan
uitdrukkelijk, zowel in het gesprek als in de mail naar Geert, met de volledige lijst van wie al
gemaild is — en lever het bijgewerkte bestand af met `SendUserFile` zodat hij het zelf kan zetten.

## STAP 5 — Afronden

Kort bericht in het gesprek:

- welke week en welk lijstbestand;
- hoeveel klanten nog niets geantwoord hadden en hoeveel mails er effectief buiten zijn;
- de klanten zonder mailadres, met naam en telefoonnummer, onder "zelf bellen of sms'en";
- wat er misgelopen is en bij wie;
- of de lijst bijgewerkt en teruggeschreven is.

Geen opsomming van alles wat al klopte.

## Mail (verplicht)

Pushmeldingen komen bij Geert niet aan; enkel e-mail geeft geluid op zijn gsm. Nooit naar de
gekoppelde mailbox zelf sturen: is `deramenwassers@gmail.com` gekoppeld, mail dan naar
`geertensanne@gmail.com`, en omgekeerd. Verwar dit niet met de klantmails uit STAP 3 — die gaan
wél vanuit de gekoppelde mailbox naar de klant.

- Wacht je op een antwoord (geen lijst, geen tekens, verdacht aantal)? Stuur EERST
  `mcp__Gmail__send_message`, onderwerp `CLAUDE WACHT: <kern in enkele woorden>`, body in 2-3
  lijnen. Pas daarna de vraag in het gesprek stellen.
- Afgerond? Onderwerp `CLAUDE KLAAR: <n> herinneringen verstuurd voor week <JJJJ-Wnn>` met de
  samenvatting uit STAP 5, en altijd de klanten zonder mailadres erin — dat zijn de enige waar hij
  zelf iets voor moet doen.
- Label die mail daarna met `mcp__Gmail__label_message`: label "Claude wacht" (labelId opzoeken met
  `mcp__Gmail__list_labels`) plus `IMPORTANT`. Lukt het labelen niet, laat het en ga verder.
