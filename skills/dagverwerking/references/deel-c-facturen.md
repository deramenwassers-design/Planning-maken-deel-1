# Deel C — facturen aanmaken (Eenvoudig Factureren)

Volledig automatisch: geen login, geen wachtwoord, geen bevestiging. De sleutel staat in
`facturatie\api-sleutel.txt` en gaat mee als header `X-API-Key`. Zet hem nooit in een rapport.

Bij HTTP 401/403: melden dat Geert een nieuwe sleutel moet maken via Toegangsbeheer, C en D2
overslaan, en verder gaan met de rest.

## Wat de API níét kan (niet opnieuw proberen)

`GET /api/v1/invoices` geeft op dit account **altijd HTTP 500** — in elke vorm (plain, met en zonder
Accept-header, sort, page, limit, per_page, date_from, status, client_id). Ook
`/clients/{id}/invoices`, `/invoices/{nummer}`, `/creditnotes`, `/documents` en `/api/v2/invoices`
geven 404. `/quotes` en `/invoices/{invoice_id}` werken wél.

Het laatste factuurnummer is dus **niet opvraagbaar**, en factuur-id's aflopen werkt evenmin (die
zijn globaal gedeeld: opeenvolgende dagen liggen ~30.000 id's uit elkaar). Gebruik daarom het
register.

Het factuurNUMMER wordt door de API toegekend, niet door jou. Je kan het niet kiezen en niet
corrigeren; het is altijd het eerstvolgende in de reeks. Een "verkeerd" nummer bestaat dus niet. De
POST-respons bevat het nummer níét (enkel `invoice_id`) — doe een GET op het nieuwe id om het te
kennen.

## Duplicaatcontrole — verplicht, en ze vraagt nooit iets

1. Lees `cowork\facturatie\gefactureerde_dagen.json`.
2. Staat de werkdag al in `dagen`?
   - status **"voltooid"** → GET `https://eenvoudigfactureren.be/api/v1/invoices/{controle_invoice_id}`.
     Bestaat die factuur en is `date_delivery` gelijk aan die werkdag → de dag is al gefactureerd.
     Maak niets aan, meld het, ga door met deel D.
   - status **"bezig"** → een vorige run is halverwege afgebroken. Maak niets aan, meld welke
     facturen er volgens het register al bestaan, ga door met deel D, en zet dit bovenaan in het
     nakijkrapport.
3. Staat de werkdag er niet in → **factureren, zonder iets te vragen.** Maak eerst één factuur aan,
   doe een GET op het nieuwe `invoice_id` en schrijf **meteen** een blok in `dagen` met
   `"status": "bezig"`, de werkdag en `controle_invoice_id`. Doe dat vóór je de rest aanmaakt:
   crasht de run halverwege, dan weet de volgende run dat er al facturen bestaan. Maak daarna de
   overige facturen aan.
4. Bereken ter informatie het gat = (nummer van je eerste factuur − `laatste_nummer` uit het
   register − 1). Dat gat betekent enkel dat er buiten de taak om facturen gemaakt zijn — meestal
   doet Geert dat zelf, en dat mag. Dit is **geen** fout en geen reden om te stoppen of iets te
   vragen. Vermeld het in het nakijkrapport; is het gat 20 of meer, zet er dan bij dat het de moeite
   is om even na te kijken.
5. Na afloop: vul het blok aan (aantal_facturen, eerste_nummer, laatste_nummer, aaneensluitend,
   totalen, afgeronde_regels, nieuwe_klanten, en per klantnummer invoice_id + nummer), zet
   `"status": "voltooid"` en zet `laatste_nummer` bovenaan gelijk aan het hoogste nieuwe nummer.
   **Zonder deze stap werkt de controle morgen niet meer.**

## Klanten

Opzoeken: `GET https://eenvoudigfactureren.be/api/v1/clients` geeft de volledige lijst (~4 MB, ~2600
klanten) — filter in code op `number === 'CUS...'` en geef enkel de treffers terug. Zet álle
CUS-nummers van de dag in één zoeklijst; op 17/08/2026 werd er één vergeten en moest die apart
opgehaald worden.

Niet gevonden? **Maak de klant aan** (niet overslaan, niets vragen): POST naar
`https://eenvoudigfactureren.be/api/v1/clients` met
`{number, name, street, city, postal_code, country_code:'BE'}` — naam en adres uit het
Squeegee-rapport, telefoon en e-mail laat je leeg. Gebruik het teruggekregen `client_id` meteen voor
de factuur, en vermeld elke nieuwe klant in het nakijkrapport én in het register, met de vermelding
dat telefoon en e-mail nog aangevuld moeten worden.

## Aanmaken

POST naar `https://eenvoudigfactureren.be/api/v1/invoices` met JSON-body
`{client_id, date_delivery, items:[...]}`. Doe dit in blokken van ongeveer **14 facturen per
oproep**, anders loop je tegen de CDP-timeout van 45 s aan.

Regels, geverifieerd op live facturen:

- `amount` = bedrag **exclusief** btw (= "subtotaal" uit Squeegee), niet het totaal.
- **Afronding:** ligt het incl.-bedrag van een factuurREGEL binnen € 0,01 van een geheel getal (bv.
  99,99 of 35,01), geef dan voor die regel geen `amount` maar `amount_with_tax` met het ronde
  bedrag. Meer dan één cent verschil: niet afronden. Vermeld elke afronding in het nakijkrapport
  (oud → nieuw).
- `general_ledger_account` altijd expliciet per item: `"700300"` (Verkopen 21%) of `"700500"`
  (Verkopen medecontractant). Er is **geen** 6%-rekening — kom je een 6%-job tegen: die ene factuur
  niet aanmaken, de rest wel, en het melden.
- Bij elke 0%-lijn óók `tax_rate_special_status: "MC"` meegeven (samen met 700500). Enkel
  `tax_rate: 0` geeft "Geen BTW", en dat is fout.  Bij 21% laat je dit veld weg.
- `quantity: 1` per item.
- `date_delivery` = de verwerkte werkdag (bv. `"2026-07-29"`). Zonder dit veld zet de API vandaag.
- `days_due` niet meegeven (accountstandaard 15 dagen is correct).
- `description` = uitsluitend de dienst uit "Uitgevoerde taken". Nooit adres of datum erbij. Enige
  uitzondering: bundelt een factuur meerdere ADRESSEN van dezelfde klant, dan mag de straatnaam
  blijven staan.
- Groeperen: per klant op datum voltooid tot 1 factuur met meerdere regels. BTW% =
  `round(100 × belasting / subtotaal)`.
- Void-rijen die elkaar opheffen (+X en −X) niet factureren.

## Nooit een PUT op een bestaande factuur

Een PUT op `/invoices/{id}` nult alle bedragen én kan de factuur **hernummeren** (gebeurde op
29/07/2026). Zet dus alles meteen goed in de POST. Moet er toch iets aan één regel wijzigen: enkel
PUT op `/invoices/{id}/items/{item_id}`, met het volledige setje velden. Iets op factuurniveau: niet
zelf doen, melden.

## Verificatie na afloop (verplicht)

GET per factuur en controleer `date_delivery`, `description`, `amount`, `tax_rate`,
`tax_rate_special_status` (moet "MC" zijn bij elke 0%-lijn), `general_ledger_account` en het
incl.-totaal tegenover wat je verstuurd hebt.

Controleer ook dat de toegekende nummers aaneensluitend zijn; zijn ze dat niet, dan was er iemand
gelijktijdig aan het factureren — melden. Wijkt een bedrag af van wat jij stuurde: melden, niet
overschrijven.

Bij testen: herkenbare omschrijving "TEST - te verwijderen" en dat expliciet melden.
