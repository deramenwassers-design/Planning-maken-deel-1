// Bouwt public/index.html uit src/app.template.html, src/calc.js en src/shim.js.   Gebruik:  node src/build.mjs
import { readFileSync, writeFileSync } from "node:fs";
const dir = new URL(".", import.meta.url).pathname;
const tpl = readFileSync(dir + "app.template.html", "utf8");
const calc = readFileSync(dir + "calc.js", "utf8"), shim = readFileSync(dir + "shim.js", "utf8");
const body = tpl.replace("/*__CALC__*/", () => calc);
const i = body.indexOf("<script>");
const m = body.slice(0, i).match(/^(<title>[\s\S]*?<\/title>\s*<meta name="claude:viewport-fit-sides"[^>]*>\s*<style>[\s\S]*?<\/style>\s*<link[^>]*>)([\s\S]*)$/);
if (!m) throw new Error("Sjabloon heeft niet de verwachte opbouw");
const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%232f5597'/%3E%3Cpath d='M16 24h32M22 14v10M42 14v10M18 24v26h28V24' stroke='white' stroke-width='5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";
const head = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#2f5597"><link rel="icon" href="${icon}">`;
writeFileSync(dir + "../public/index.html", head + m[1] + "</head><body>" + m[2] + "\n<script>\n" + shim + "\n</script>\n" + body.slice(i) + "</body></html>");
console.log("public/index.html gebouwd");
