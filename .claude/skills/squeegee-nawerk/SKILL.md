---
name: squeegee-nawerk
description: ⭐ squeegee-nawerk — Werkt in Squeegee (sqgee.com) het nawerk van een gereden dag af - klantnamen opschonen en/of betalingen registreren. Gebruik deze skill wanneer Geert vraagt om "de namen opschonen", "klantnamen opkuisen", "betalingen registreren", "betalingen aanduiden", "Squeegee opkuisen" of "/squeegee-nawerk" oproept, met vermelding van een of meer dagen (bv. "doe van 28 juli de betalingen en van 29 juli het opschonen").
---

Je bent een automatiseringsassistent voor "De Ramenwassers", een raamwasbedrijf van Geert (deramenwassers@gmail.com). Je voert in Squeegee (https://sqgee.com) één of meer van de hieronder beschreven bewerkingen uit. Doe NIETS anders — geen tijdscontrole met Metatrak, geen dagnotitie bijwerken, geen facturen aanmaken, geen Excel-rapport.

WELKE BEWERKING VOOR WELKE DAG
Bij het starten geeft Geert mee wat er moet gebeuren, bv. "doe van 28 juli de betalingen en van 29 juli het opschonen". Volg die instructie letterlijk; er kunnen meerdere data en meerdere bewerkingen in één opdracht zitten. Staat er niets bij, doe dan enkel BEWERKING A (klantnamen opschonen) voor vandaag. Wordt een bewerking genoemd zonder datum, gebruik dan vandaag. Bevestig aan het begin van je eindbericht kort welke bewerking je voor welke datum hebt uitgevoerd.

STAP 0A — EERST KIJKEN OF SQUEEGEE AL OPEN STAAT
Open nooit blind een nieuwe tab. Squeegee is offline-first: een verse tab kost 30-60 sec sync en soms een nieuwe login, terwijl een reeds geopend tabblad meteen bruikbaar is.
  1. Vraag met `tabs_context_mcp` de lijst van open tabbladen op.
  2. Zit daar een tab met `sqgee.com` in de URL? Gebruik die en werk daarin verder. Niet herladen — een herlaad start de volledige cloudsync opnieuw.
  3. Staat die tab op een andere Squeegee-pagina (bv. een klantfiche), gebruik dan `navigate` naar `https://sqgee.com/schedule` binnen datzelfde tabblad (geef de tabId expliciet mee).
  4. Alleen als er geen sqgee.com-tab bestaat: `tabs_create_mcp` + `navigate` naar `https://sqgee.com/schedule`.
  5. Vermeld in je eindbericht in enkele woorden wat het geworden is: "bestaand tabblad hergebruikt" of "nieuw tabblad geopend".
Geen browser verbonden of geen enkel tabblad bereikbaar: stop, wijzig niets, en verwittig Geert per mail (onderwerp "CLAUDE WACHT: ..."). Is de sessie vanaf zijn gsm gestart, vermeld er dan bij dat de browsertoegang eerst op de pc goedgekeurd moet worden — die toestemmingsvraag verschijnt daar en blijft anders onbeantwoord staan.

STAP 0B — SCHERM WAKKER HOUDEN (meteen na STAP 0A)
Vraag in het Squeegee-tabblad uit STAP 0A meteen een schermvergrendeling-blokkade aan, zodat het scherm tijdens de run niet uitvalt. Voer met javascript_tool uit:

let uit; try{ if(!('wakeLock' in navigator)){uit='niet ondersteund'} else { window.__wl = await navigator.wakeLock.request('screen'); if(!window.__wlHandler){window.__wlHandler=async()=>{if(document.visibilityState==='visible'){try{window.__wl=await navigator.wakeLock.request('screen')}catch(e){}}};document.addEventListener('visibilitychange',window.__wlHandler)} uit='wake lock actief' } }catch(e){ uit='geweigerd: '+e.name } uit

De tweede helft zorgt dat de blokkade zichzelf herstelt als het tabblad even verborgen is geweest. Lukt dit niet, ga dan gewoon verder maar vermeld het in je eindbericht. Let op: een wake lock vervalt zodra het tabblad verborgen is (venster geminimaliseerd) of als Windows vergrendeld wordt met Win+L — dat kan hij niet opvangen.

VOORWAARDEN VOOR HET SCHERM (BELANGRIJK — hier loopt het anders op vast)
Er is geen API; alles gaat via de Claude-in-Chrome browsertools (tabs_context_mcp, tabs_create_mcp, navigate, computer, get_page_text, find, javascript_tool). De sessie is normaal al ingelogd.
- Het Chrome-venster met Squeegee moet OPEN, ZICHTBAAR en GEMAXIMALISEERD staan zolang de taak loopt. Chrome vertraagt geminimaliseerde of verborgen vensters; Squeegee opent zijn panelen met animaties die dan blijven hangen, waardoor kliks op de verkeerde plek belanden.
- Controleer dit meteen bij de start met javascript_tool: `JSON.stringify({b:window.innerWidth,z:document.visibilityState})`. Is de breedte kleiner dan ongeveer 1300 of is zichtbaarheid niet "visible", vraag Geert dan het venster te maximaliseren en zo te laten staan voor je verdergaat. Bij een smal venster valt de drie-puntjesknop van de klantkaart (rond x=1320) buiten beeld en is de taak onmogelijk.
- Werk rustig: laat na elke klik 5 à 7 seconden voor het paneel opent. Gaat een paneel na 2-3 pogingen niet open, sla die klant/job over, noteer hem en ga verder. Blijf niet eindeloos herproberen.
- Weergavefout om te kennen: na het opslaan van een klantnaam blijft de titelbalk van de klantkaart de OUDE naam tonen. Dat is een bug in Squeegee. De klantenlijst links toont wel de nieuwe waarde — controleer daar, niet in de titelbalk.

BEWERKING A — KLANTNAMEN OPSCHONEN
Doorloop alle jobs van de gevraagde dag met status "Gedaan"/DONE — de volledige lijst, niet enkel wat er verdacht uitziet. Bij SKIPPED of "Niet klaar"/not-done jobs NOOIT iets wijzigen. Pauze-jobs (bv. "Pauze Dimas") hebben geen echte klant en tellen niet mee.

Regels voor het Naam-veld:
Vaste emoji-uitzonderingen: 🧽 (spons), ❗ (rood uitroepteken), 📷 (fototoestel). Deze drie blijven ALTIJD en OVERAL staan waar ze letterlijk in het Naam-veld voorkomen — ook los buiten de haakjes (bv. "Mieke Geuens 🧽 50€" → 🧽 blijft, enkel "50€" verdwijnt). Verwijder ze nooit.

Bevestigingstekens ✅ (U+2705), ❌ (U+274C), ❎ (U+274E) en ❓ (U+2753) moeten WEG. Die zetten de skills `bevestigingen-lijst` en `bevestigingen-opvolgen` achteraan de naam om te tonen of de klant bevestigd heeft voor die week. Zodra de dag gereden is heeft dat teken zijn werk gedaan, en als het blijft staan hangt de week erna het teken van de vorige keer er nog achter. Haal ze dus weg, ook als er meerdere achter elkaar staan.
- Blijft staan: voor- en achternaam, alles tussen haakjes () (ongeacht inhoud), en de emoji-uitzonderingen.
- Weg moet: al de rest buiten haakjes en buiten de emoji-uitzonderingen (bv. "NM", "72€", "OCHTEND", "VOOR 11U", "OK BEVESTIGD", "JULI PROBEREN INPLANNEN", "????????", een los pijltje "⤵️" als dat letterlijk als tekst in het veld staat — komt vaak voor, altijd verwijderen — en de bevestigingstekens ✅ ❌ ❎ ❓).
- Kloppen de haakjes niet (bv. twee keer openen, één keer sluiten), dan is niet eenduidig wat binnen of buiten valt: wijzig NIETS en zet die klant in het eindbericht bij "zelf bekijken".

Stap 1 — triage zonder te openen: haal met get_page_text de volledige dagplanning op (Werkplanner, juiste dag). Noteer per Gedaan-klantjob: job-nummer, adres, zichtbare naam. Kandidaat = alles wat niet uitsluitend bestaat uit naam + eventueel haakjes-inhoud + eventueel emoji-uitzonderingen. Namen die 100% clean ogen sla je over zonder ze te openen.

Stap 2 — enkel de kandidaten aanpassen, via het KLANTEN-menu (dit is de betrouwbaarste weg, betrouwbaarder dan via het jobpaneel):
  1. Klik "Klanten" in het linkermenu.
  2. Klik het vergrootglas rechtsboven in de balk "Alfabetisch" en typ een stuk van de achternaam. Wacht tot de lijst gefilterd is (controleer dat de teller boven de lijst het aantal treffers toont) — klik NIET te vroeg, anders open je de eerste klant van de volledige lijst.
  3. Klik de juiste klant in de resultatenlijst. De klantkaart opent rechts.
  4. Klik de drie puntjes rechtsboven in de klantkaart-header en kies "Klant bewerken".
  5. Lees eerst de letterlijke waarde van het Naam-veld: `JSON.stringify([...document.querySelectorAll('input')].filter(x=>{const r=x.getBoundingClientRect();return r.x>800&&r.y>85&&r.y<120}).map(x=>x.value))`. Klopt de naam niet met de klant die je zocht, sluit dan af en probeer opnieuw.
  6. Klik in het Naam-veld, selecteer alles (Ctrl+A), typ de opgeschoonde waarde, controleer met dezelfde javascript-uitlezing dat de nieuwe waarde er effectief staat, en klik pas dan "OPSLAAN" rechtsboven.
  7. Controleer in de klantenlijst links dat de nieuwe naam er staat (niet in de titelbalk — zie de weergavefout hierboven).
Vraag GEEN bevestiging per wijziging; dit is vooraf goedgekeurd door Geert.

SNELLERE EN VEILIGERE ROUTE (aanbevolen, geen naamgenotenrisico): ga niet via het Klanten-menu maar vertrek van de job zelf.
  1. Klik in de dagplanning het `.item-header` van de job aan; het jobpaneel opent.
  2. Zoek in dat paneel de regel met het icoon "person" (de klantnaam met een chevron rechts) en klik de hele rij aan - de klantkaart opent.
  3. Klik in de balk van die klantkaart op "more_vert" en daarna op "Klant bewerken".
  4. Het Naam-veld is de tekstinput bovenaan rechts (x>700, breedte>300, y<120). Lees zijn waarde, bereken de opgeschoonde naam, zet hem met de native setter en klik "OPSLAAN".
  5. Sluit daarna alle dialogen (knoppen "close"/"arrow_back" in elke zichtbare `.context-menu-bar`) voor je aan de volgende job begint.
Deze weg opent altijd de juiste klantfiche, ook bij naamgenoten. Controleer achteraf in de dagplanning dat de header de nieuwe naam toont.

BEWERKING B — BETALINGEN REGISTREREN
Best-effort met tijdslimiet van ongeveer 10 minuten per dag. Screenshots van de volledige klikroute staan in de map "facturatie/betaling registreren screenshots/" (stap1 t/m stap10) — raadpleeg die via de Read-tool bij twijfel over een specifiek scherm.

Eenmalig per dag (niet per job herhalen):
  1. Klik "Werkplanner" in het linkermenu (stap1).
  2. Klik in de weekbalk bovenaan op de betreffende dag, bv. "24" (stap2).
  3. Klik het chart-icoon (het linkerste van de 3 icoontjes onder "Werkplanner", blauw vakje) om de dag-joblijst te tonen/verversen (stap3).

Per job — herhaal voor elke gefactureerde job in de "Done"-lijst:
  4. Klik in de "Done"-lijst op de klantnaam van de job (stap4). Dit opent het job-detailpaneel met oranje kop.
  5. Klik de ronde roze knop rechtsonder (FAB) — die staat altijd in beeld, ook met het job-detailpaneel open (stap5).
  6. Kies in het geopende menu "Betaling" (blauw bank-icoontje) (stap6).
  7. BELANGRIJK — bovenaan de betaalmodal staat "Betalings- of laadbedrag" met drie bolletjes: "Eindbalans", "Onbetaalde facturen"/"Taakprijs voor [datum]" en "Ander bedrag". Vaak staat er NIETS aangevinkt. Klik dan zelf op "Eindbalans". Zolang er geen bedrag gekozen is, staat de knop onderaan op "VOER HET BETALINGSBEDRAG IN" of "SELECTEER DE BETALINGSMETHODE" en verschijnt de RECORD-knop niet. Dit is de meest voorkomende reden dat het vastloopt.
     In JS: `[...dlg.querySelectorAll('input')].find(e=>e.type==='radio'&&e.value==='fullBalance')` — klik het bijhorende lijstitem (het label "Eindbalans"), niet de verborgen radio zelf.
  8. Controleer in het middenblok (het tabje met het POTLOOD-icoon) dat "Bank Transfer" het groene bolletje heeft. Staat er een andere methode aan, klik dan de rij "Bank Transfer" aan. Het veld "Payment Account" mag LEEG blijven en de keuzelijst daar mag "Not found" tonen — dat is een aparte, optionele rekening en géén probleem. De betaaldatum staat op vandaag; laat die zo.
  9. Klik onderaan de knop "RECORD €[bedrag] AS BANK TRANSFER" (stap9). Het paneel toont daarna een paarse kop met "INVOICE [nr] PAID TODAY" ter bevestiging.
  10. Ga direct door naar de volgende job: het klantpaneel hoeft niet gesloten te worden, de onderliggende joblijst blijft klikbaar — klik meteen de volgende job aan en herhaal vanaf stap 4 (stap10).

Werk bij voorkeur volledig met javascript_tool in plaats van met muiscoordinaten (klikken op coordinaten gaat mis bij een andere zoom of schermschaal). Bruikbare bouwstenen: open jobs = `[...document.querySelectorAll('.multi-day-view-day-item')].filter(x=>/Invoiced/i.test(x.innerText)&&!/Paid/i.test(x.innerText))`; job openen via `.item-header`; FAB = de knop met "fab" in de class die het verst rechts staat; daarna het menu-item "Betaling"; dan het bolletje "Eindbalans"; dan pollen tot er een knop is waarvan de tekst met "RECORD" begint en die aanklikken. Houd elke javascript_tool-aanroep onder ~35 seconden (anders time-out) — doe dus 2 à 3 jobs per aanroep.
Raakt de app in de knoop (panelen die niet meer opengaan, oude dialogen die blijven staan): sluit alle openstaande dialogen (knoppen "close"/"arrow_back" in de `.context-menu-bar`), of herlaad https://sqgee.com/schedule en kies opnieuw de week en de dag.

Lukt de UI niet vlot bij een job: sla die job over en ga verder. Stop bij de tijdscap. Vermeld niet-geregistreerde jobs als "nog manueel te registreren" — dat blokkeert de facturatie niet en veroorzaakt geen dubbele facturatie.

AFRONDING
Geef één BEKNOPT bericht in het Nederlands (Geert houdt niet van lange uitleg):
- welke bewerking je voor welke datum hebt uitgevoerd;
- bij opschonen: hoeveel Gedaan-klantjobs beoordeeld zijn en hoeveel er geopend zijn, de lijst opgeschoonde klanten in het formaat "van → naar", en de klanten die je bij "zelf bekijken" zet;
- bij betalingen: hoeveel betalingen geregistreerd zijn en welke jobs nog manueel moeten;
- alles wat niet gelukt is, met de reden (bv. venster te smal, paneel opende niet, wake lock geweigerd).
Geen opsomming van alles wat al klopte.