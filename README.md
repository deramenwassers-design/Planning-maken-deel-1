# dag-afwerken — één knop voor de vier taken na een gereden dag

Deze repo bevat de skill **`dag-afwerken`**: één commando dat de vier bestaande taken
achter mekaar uitvoert voor dezelfde werkdag, in deze vaste volgorde:

1. **klantnamen opschonen** — `squeegee-nawerk`, bewerking A
2. **dagverwerking** — `dagverwerking`, delen A t/m E
3. **tijden overzetten** — `squeegee-tijden`
4. **betalingen aanduiden** — `squeegee-nawerk`, bewerking B

De skill doet zelf geen nieuw werk: ze roept de vier bestaande skills op en regelt
volgorde, gedeelde context (dezelfde datum, dezelfde browsertab, dezelfde wake lock),
foutafhandeling en het eindrapport.

## Wat je ermee wint

- **Eén commando** in plaats van vier keer starten en tussendoor wachten.
- **Alle toestemmingen in één blok aan het begin** — daarna kan je wegstappen.
- **Eén eindbericht en één mail** in plaats van vier aparte verslagen.
- **Nooit stilvallen**: mislukt een stap, dan gaat de rest gewoon door en staat in het
  eindbericht wat er is blijven liggen.

## Gebruiken

```
/dag-afwerken
/dag-afwerken van 19 augustus
```

Of gewoon vragen: "doe alles van gisteren", "werk de hele dag van maandag af",
"alles in 1 keer".

Geef je geen datum mee, dan bepaalt de skill zelf de meest recente volledige werkdag
(uit het Squeegee-rapport en de Metatrak-gegevens) en zegt ze in de eerste zin welke
datum ze verwerkt.

## Installeren als knop

**In Claude Code (deze repo):** niets te doen — de skill staat in
`.claude/skills/dag-afwerken/` en is meteen beschikbaar als `/dag-afwerken`.

**In Cowork / claude.ai, naast de andere sterretjes-skills:** upload
`dag-afwerken.zip` bij Instellingen → Vaardigheden (Skills) → Vaardigheid uploaden.
Daarna staat `dag-afwerken` in dezelfde lijst als `dagverwerking`, `squeegee-tijden`
en `squeegee-nawerk`.

Wil je er een echte knop van maken die elke ochtend vanzelf loopt: maak in Cowork een
geplande taak met als opdracht `/dag-afwerken`.

## De knop op het opdrachtenbord

De knop **Dag afwerken** staat bovenaan bij "Na de werkdag" op het opdrachtenbord:
https://claude.ai/code/artifact/06f9ca0b-929c-4a42-9b31-1847e98de982

Hoe hij werkt, net als de andere knoppen:

1. Start kopieert het menukaartje `_dag afwerken [datum].txt` uit de Drive-map
   "Claude opdrachten" naar een nieuw bestand `dag afwerken <gisteren>.txt`.
2. De pc pikt dat bestand binnen twee minuten op en voert de opdracht uit.
3. De bestandsnaam is de opdracht — pas de dag in het veld aan voor je op Start tikt.

De inhoud van het menukaartje staat hier ook, als reservekopie:
[`opdrachtenbord/menukaartje-dag-afwerken.txt`](opdrachtenbord/menukaartje-dag-afwerken.txt).
De HTML van het bord staat in
[`opdrachtenbord/opdrachtenbord.html`](opdrachtenbord/opdrachtenbord.html).

Voor Cowork of claude.ai kan je de skill zelf uploaden: `dag-afwerken.zip` bij
Instellingen → Vaardigheden (Skills). De losse opdrachttekst staat in
[`opdrachtenbord/dag-afwerken-opdracht.md`](opdrachtenbord/dag-afwerken-opdracht.md).

## Voorwaarden tijdens de run

- Chrome open, **zichtbaar en gemaximaliseerd** (minstens ~1300 px breed), met Squeegee ingelogd.
- De Excel-bestanden (`facturenlijst.xlsm`, `ingave werk.xlsm`, `stortingen vs kosten - nieuw.xlsx`,
  `Nakijken_*.xlsx`) **gesloten** laten.
- Tijdens de dagverwerking neemt Excel de muis over — blijf dan best van de pc.

## Volgorde niet omgooien

- namen vóór dagverwerking, anders staat de rommel mee op de facturen;
- dagverwerking vóór tijden, want die leest `Nakijken_[datum].xlsx`;
- dagverwerking vóór betalingen, want je kan enkel betalen wat gefactureerd is.
