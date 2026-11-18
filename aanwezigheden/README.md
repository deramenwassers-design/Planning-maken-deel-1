# Aanwezigheden

Online aanwezigheidsregistratie voor de kinderopvang: jaarkalender, maandinvoer per kindje, standaarddagen
per kindje met start- en einddatum, halve dagen en de kwartaalnorm (gemiddeld minstens 4 kindjes per gewerkte dag).

Draait op Netlify: een statische pagina (`public/`) en één Netlify Function (`netlify/functions/api.mjs`)
met de gegevens in Netlify Blobs en een login per gebruiker.

## Op Netlify zetten

1. Netlify, Add new site, Import an existing project, kies GitHub en deze repo.
2. Branch: `ccr-964e6e13-5g7reo` (of `main` na het samenvoegen). **Base directory: `aanwezigheden`**. Build command leeg laten, Publish directory `public` (staat al in `netlify.toml`).
3. Site configuration, Environment variables, voeg toe: `USERS` = `geert:kiesEenWachtwoord,sanne:kiesEenWachtwoord`.
4. Deploy opnieuw (Deploys, Trigger deploy). Open de link, meld je aan.
5. Eerste keer: kies "Back-up inlezen" en het bestand `startgegevens.json` (staat niet in deze repo, want het bevat de namen van de kindjes).

Zonder `USERS` weigert de server alles. Er staan geen gegevens in deze repo.

## Aanpassen

De bronbestanden staan in `src/`. Na een wijziging: `node src/build.mjs` bouwt `public/index.html` opnieuw.

- `src/calc.js`: alle rekenregels (feestdagen, werkdagen, standaarddagen, kwartaalnorm).
- `src/app.template.html`: de pagina.
- `src/shim.js`: verbindt de pagina met `/api`.
