# Weg 2 — Scrada via het scherm

Dit is nu de standaardweg. Er is geen API-sleutel, dus alles gaat via de
Claude-in-Chrome-browsertools (`tabs_context_mcp`, `tabs_create_mcp`, `navigate`, `computer`,
`get_page_text`, `find`, `javascript_tool`). De sessie is normaal al ingelogd.

Dit werkt **enkel lokaal** — op de pc van Geert, in Claude Code of in een lokale Cowork-taak, of via
computer-use op zijn toestel vanuit Cowork. Vanuit een gewone cloudsessie is scrada.be niet
bereikbaar (de egress-proxy blokkeert het domein, nagekeken 24/08/2026): stop dan meteen, boek niets
en meld dat deze taak lokaal gestart moet worden.

## STAP 0A — eerst kijken of Scrada al open staat

Open nooit blind een nieuwe tab.

1. Vraag met `tabs_context_mcp` de lijst van open tabbladen op.
2. Zit daar een tab met `scrada.be` in de URL? Gebruik die.
3. Staat die tab op een ander scherm, navigeer dan binnen datzelfde tabblad (geef de tabId expliciet
   mee).
4. Alleen als er geen scrada.be-tab bestaat: `tabs_create_mcp` + `navigate` naar
   `https://scrada.be`.
5. Kom je op een inlogscherm: **stoppen**. Niets typen, geen wachtwoord, geen boeking. Meld dat
   Geert zich eerst moet aanmelden. Is de sessie vanaf zijn gsm gestart, vermeld er dan bij dat de
   browsertoegang op de pc goedgekeurd moet worden — die vraag verschijnt daar en blijft anders
   onbeantwoord staan.

Geen browser verbonden of geen enkel tabblad bereikbaar: stop, boek niets, en verwittig Geert per
mail (onderwerp "CLAUDE WACHT: ...").

## STAP 0B — venster en scherm

Zelfde voorwaarden als bij `squeegee-nawerk`:

- Het Chrome-venster moet OPEN, ZICHTBAAR en GEMAXIMALISEERD staan. Controleer met
  `javascript_tool`: `JSON.stringify({b:window.innerWidth,z:document.visibilityState})`. Breedte
  onder ~1300 of zichtbaarheid niet "visible" → vraag Geert het venster te maximaliseren voor je
  verdergaat.
- Vraag meteen een schermvergrendeling-blokkade aan (het wake-lock-fragment uit STAP 0B van
  `squeegee-nawerk`). Lukt het niet: gewoon verdergaan, wel vermelden.
- Werk rustig: laat na elke klik enkele seconden voor een paneel opent. Gaat het na 2-3 pogingen
  niet open, sla die ontvangst over, noteer ze en ga verder. Blijf niet eindeloos herproberen.
- Werk bij voorkeur met `javascript_tool` in plaats van met muiscoördinaten — klikken op
  coördinaten gaat mis bij een andere zoom of schermschaal. Houd elke aanroep onder ~35 seconden.

## De eerste run is een verkenningsrun

De exacte schermen van Scrada staan hier nog niet vastgelegd. Doe de eerste run daarom **samen met
Geert aan de computer**, en boek pas als de route duidelijk is.

Verken zo:

1. Haal met `get_page_text` de hoofdpagina op en noteer de menu-items.
2. Zoek het scherm voor een **kasverrichting / ontvangst / dagontvangst** — de knop om een nieuwe
   ontvangst toe te voegen.
3. Open dat scherm en lees de velden uit:

```js
JSON.stringify([...document.querySelectorAll('input,select,textarea')]
  .filter(e=>e.offsetParent)
  .map(e=>({t:e.tagName,type:e.type,name:e.name,id:e.id,ph:e.placeholder,
            label:(e.labels&&e.labels[0]||{}).innerText})))
```

4. Zoek per veld uit de tabel in `SKILL.md` (datum, klantnaam, factuurnummer, bedrag incl. btw,
   betaalwijze cash) welk invoerveld erbij hoort.
5. Zoek ook op waar je een **bestaande** ontvangst terugvindt, zodat de duplicaatcontrole kan.
6. Vul de tabel hieronder in en meld de route in je eindbericht, zodat ze hier vastgelegd kan
   worden.

Boek tijdens de verkenning **nooit** een proefbedrag "om te kijken of het werkt". Een kasboek is
wettelijk; een testboeking is geen test maar een fout die je nadien niet zelf mag rechtzetten.

## IN TE VULLEN NA DE EERSTE RUN — de vaste route

| Stap | Wat | Selector / knop |
|---|---|---|
| 1 | Naar het kasboek/dagontvangsten | *(nog in te vullen)* |
| 2 | Nieuwe ontvangst toevoegen | *(nog in te vullen)* |
| 3 | Datum | *(nog in te vullen)* |
| 4 | Klantnaam | *(nog in te vullen)* |
| 5 | Factuurnummer | *(nog in te vullen)* |
| 6 | Bedrag (incl. btw) | *(nog in te vullen)* |
| 7 | Betaalwijze cash | *(nog in te vullen)* |
| 8 | Opslaan | *(nog in te vullen)* |
| 9 | Bevestiging herkennen | *(nog in te vullen)* |
| 10 | Bestaande ontvangst opzoeken | *(nog in te vullen)* |
| | Vastgelegd op | *(datum)* |

## Per ontvangst

1. Controleer eerst in Scrada of die datum + dat factuurnummer er al staat. Ja → overslaan en
   noteren.
2. Vul de velden in. Lees na het invullen de waarden opnieuw uit met `javascript_tool` en vergelijk
   ze met wat je wou invullen — pas dán opslaan. Vooral het bedrag en het factuurnummer.
3. Sla op en wacht op de bevestiging. Geen bevestiging gezien → **niet opnieuw opslaan**. Ga eerst
   in de lijst kijken of de boeking er staat; anders maak je ze dubbel.
4. Schrijf de ontvangst meteen weg in `facturatie\scrada_cash.json`. Niet wachten tot het einde.

## Tijdslimiet

Best-effort, ongeveer 10 minuten per dag. Loopt het scherm vast (panelen die niet meer opengaan,
dialogen die blijven staan): sluit de openstaande dialogen of herlaad de pagina en begin opnieuw bij
de eerstvolgende ontvangst die nog niet in het register staat. Bereik je de tijdscap: stop, en zet
de rest in het rapport als "nog manueel te boeken".
