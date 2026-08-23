# Het weeklijstbestand — het contract tussen de drie skills

De drie skills praten niet rechtstreeks met elkaar. Ze delen één ding: het Excel-bestand
met de bevestigingen van de komende week. Dit document beschrijft dat bestand. Wijzigt hier
iets, dan moeten alle drie de skills mee.

## Waar staat het

Google Drive van `deramenwassers@gmail.com`, map **Claude opdrachten**, submap **bevestigingen**.

De submap is bewust: de wortel van "Claude opdrachten" is de opdrachtenwachtrij met de
menukaartjes (`_naam.txt`). Daar hoort geen datavolume tussen. Bestaat de submap nog niet,
dan maakt `bevestigingen-lijst` ze aan.

Zoek het bestand nooit op map, maar altijd op titel:

```
title contains 'Bevestigingen_' and title contains '<JJJJ>-W<NN>'
```

Zo blijft alles werken als een bestand ooit verplaatst wordt.

## Bestandsnaam

```
Bevestigingen_<ISO-jaar>-W<ISO-weeknummer>.xlsx      bv. Bevestigingen_2026-W35.xlsx
```

Het weeknummer is dat van de **maandag** van de doelweek, altijd berekend met bash in
`Europe/Brussels`, nooit uit het hoofd:

```bash
TZ=Europe/Brussels date -d "next monday" +%G-W%V     # 2026-W35
TZ=Europe/Brussels date -d "next monday" +%Y-%m-%d   # 2026-08-24
```

De lijst loopt van **maandag tot en met vrijdag**. Zaterdag en zondag staan er nooit in.

Oude lijsten blijven staan. Er wordt nooit een lijst overschreven van een andere week.

## Formaat

Eén tabblad, **"Bevestigingen"**. Rij 1 is de kopregel, vanaf rij 2 de gegevens.

| Kolom | Kop | Inhoud | Gevuld door |
|---|---|---|---|
| A | dag | `DD/MM/JJJJ (ma)` — de dag waarop de job staat | skill 1 |
| B | klantnummer | de Squeegee-klantreferentie, `CUS…` | skill 1 |
| C | naam | klantnaam **exact** zoals in Squeegee, inclusief haakjes en tekens | skill 1 |
| D | telefoonnummer | in internationaal formaat waar mogelijk (`+32…`) | skill 1 |
| E | mailadres | leeg als de klant er geen heeft | skill 1 |
| F | dienst | de dienst van de job, bv. `Ramen wassen`, `Zonnepanelen poetsen` | skill 1 |
| G | teken | `✅`, `❌`, `❎` of `❓` | skill 1 zet `❓`, skill 2 werkt bij |
| H | antwoord | bron, tijdstip en kern van het antwoord, bv. `sms 25/08 07:14 — kan niet, week opschuiven` | skill 2 |
| I | herinnering | `herinnerd DD/MM JJ:MM` of `NIET GELUKT: <reden>` | skill 3 |

Kolommen H en I staan niet in de blauwdruk. Ze zijn toegevoegd omdat skill 2 elk uur
opnieuw draait en skill 3 nooit twee keer dezelfde klant mag mailen: zonder die twee
kolommen kan geen van beide zien wat er al gebeurd is. Ze staan achteraan zodat de zeven
kolommen uit de blauwdruk vooraan blijven staan.

### Eén rij per klant per dag

Heeft een klant op dinsdag drie jobs, dan is dat **één** rij. Staat dezelfde klant ook op
donderdag, dan zijn dat **twee** rijen (dag is immers een kolom). Ontdubbelen gebeurt op
klantnummer + dag, nooit op naam of adres.

Heeft een klant op één dag twee verschillende diensten, zet ze dan samen in kolom F,
gescheiden door " + " (`Ramen wassen + Zonnepanelen poetsen`).

## De tekens in kolom G

Kopieer ze letterlijk uit dit bestand. Nooit natypen, nooit een gelijkend teken gebruiken.

| Teken | Unicode | Betekenis | Gevolg |
|---|---|---|---|
| `✅` | U+2705 | klant bevestigt, verder niets te doen | gewoon inplannen |
| `❌` | U+274C | klant wil niet gewassen worden | niet inplannen |
| `❎` | U+274E | klant bevestigt, maar er is actie nodig van Geert | Geert bekijkt het antwoord |
| `❓` | U+2753 | klant heeft nog niet geantwoord | kandidaat voor de herinneringsmail |

Let op `❌` (U+274C, het losse kruis) tegenover `❎` (U+274E, het kruis in een vakje).

Hetzelfde teken staat ook **achter de klantnaam in Squeegee**, zodat de stand van zaken in de
werkplanner zichtbaar is zonder iets open te klikken. `bevestigingen-lijst` zet iedereen op `❓`;
`bevestigingen-opvolgen` vervangt dat teken zodra er een antwoord binnenkomt. Er staat altijd
precies **één** van de vier achter een naam, helemaal achteraan.

Het antwoord zelf komt in de **notitie van de job**, met teken, tijdstip, bron en de woorden van
de klant — zo is het achteraf altijd na te lezen.

## Hoe het bestand bijgewerkt wordt

De Drive-tools kunnen de **inhoud** van een bestaand bestand niet wijzigen — `update_file`
past enkel titel en map aan. Bijwerken gaat daarom altijd zo:

1. Huidige bestand downloaden en volledig inlezen.
2. De volledige nieuwe inhoud in het geheugen opbouwen.
3. Pas als die compleet is: `create_file` met **dezelfde titel** in dezelfde map
   (`disableConversionToGoogleType: true`, anders wordt het een Google Sheet).
4. Het oude bestand naar de prullenbak met `trash_file`.

Lukt stap 4 niet, dan staan er twee bestanden met dezelfde titel. Dat is niet erg, maar
elke skill moet daarom bij het **lezen** altijd het exemplaar met de meest recente
`modifiedTime` nemen, en dat in het eindbericht vermelden.

Bouw nooit een half bestand. Faalt het inlezen of het samenstellen, laat dan het bestaande
bestand ongemoeid en meld het.

> Staat de Drive-map ook lokaal gesynchroniseerd op de pc van Geert, dan is rechtstreeks
> bewerken met openpyxl beter dan vervangen-en-weggooien. Dat pad is nog niet bevestigd;
> tot dan geldt de weg hierboven.
