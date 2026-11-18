// Opslag en login voor de aanwezigheidsregistratie. Draait als Netlify Function, de gegevens staan in Netlify Blobs.
// Gebruikers komen uit de omgevingsvariabele USERS, bv.  geert:wachtwoord1,sanne:wachtwoord2
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const config = { path: "/api/*" };

const KEY = "state";
const json = (code, obj, headers = {}) => new Response(JSON.stringify(obj), { status: code, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });
const merge = (a, b) => {
  for (const k of Object.keys(b)) {
    if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k])) a[k] = merge(a[k] && typeof a[k] === "object" && !Array.isArray(a[k]) ? a[k] : {}, b[k]);
    else a[k] = b[k];
  }
  return a;
};
const safePath = (p) => typeof p === "string" && /^[A-Za-z0-9_\-.~:@+]{1,200}(\/[A-Za-z0-9_\-.~:@+]{1,200}){1,3}$/.test(p) && p.split("/").length % 2 === 0 && !p.split("/").some((x) => x === "." || x === "..");

function users(env) {
  return Object.fromEntries((env || "").split(",").map((p) => p.trim()).filter(Boolean).map((p) => { const i = p.indexOf(":"); return [p.slice(0, i), p.slice(i + 1)]; }));
}
function authorized(req, list) {
  const h = req.headers.get("authorization") || "";
  if (!h.startsWith("Basic ")) return false;
  const dec = Buffer.from(h.slice(6), "base64").toString();
  const i = dec.indexOf(":");
  const u = dec.slice(0, i), pw = dec.slice(i + 1);
  if (!Object.prototype.hasOwnProperty.call(list, u)) return false;
  const a = crypto.createHash("sha256").update(pw).digest(), b = crypto.createHash("sha256").update(list[u]).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function handle(req, store, envUsers) {
  const list = users(envUsers);
  if (!Object.keys(list).length) return json(500, { code: "unavailable", message: "USERS is niet ingesteld in Netlify." });
  if (!authorized(req, list)) return json(401, { code: "unauthenticated" }, { "www-authenticate": 'Basic realm="Aanwezigheden", charset="UTF-8"' });
  const url = new URL(req.url);

  if (url.pathname.endsWith("/api/state") && req.method === "GET") {
    const cur = await store.getWithMetadata(KEY, { type: "json" });
    const st = cur ? cur.data : { version: 1, docs: {} };
    const since = Number(url.searchParams.get("since")) || 0;
    return json(200, since === st.version ? { version: st.version, unchanged: true } : { version: st.version, docs: st.docs });
  }

  if (url.pathname.endsWith("/api/write") && req.method === "POST") {
    let w;
    try { w = await req.json(); } catch { return json(400, { code: "invalid_argument" }); }
    if (!safePath(w.path) || !["set", "update", "delete"].includes(w.op)) return json(400, { code: "invalid_argument" });
    for (let attempt = 0; attempt < 8; attempt++) {
      const cur = await store.getWithMetadata(KEY, { type: "json" });
      const st = cur ? cur.data : { version: 1, docs: {} };
      if (w.op === "set") st.docs[w.path] = w.data && typeof w.data === "object" ? w.data : {};
      else if (w.op === "update") { if (!st.docs[w.path]) return json(400, { code: "invalid_argument" }); merge(st.docs[w.path], w.data || {}); }
      else delete st.docs[w.path];
      st.version++;
      const res = cur ? await store.setJSON(KEY, st, { onlyIfMatch: cur.etag }) : await store.setJSON(KEY, st, { onlyIfNew: true });
      if (res.modified !== false) return json(200, { version: st.version });
    }
    return json(409, { code: "unavailable", message: "Te druk, probeer opnieuw." });
  }
  return json(404, { code: "not_found" });
}

export default async (req) => handle(req, getStore({ name: "aanwezigheden", consistency: "strong" }), process.env.USERS);
