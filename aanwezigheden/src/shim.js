/* Verbindt de pagina met de eigen server in plaats van met claude.ai. Dezelfde interface als de claude.ai-opslag. */
(() => {
  let version = 0, loaded = false, failed = false;
  const store = new Map();
  const subs = [];
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const parent = (p) => p.split("/").slice(0, -1).join("/");
  const snapDoc = (p) => ({ id: p.split("/").pop(), exists: store.has(p), data: () => (store.has(p) ? clone(store.get(p)) : undefined), metadata: { fromCache: false, hasPendingWrites: false } });
  const merge = (a, b) => { for (const k of Object.keys(b)) { if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k])) a[k] = merge(a[k] && typeof a[k] === "object" && !Array.isArray(a[k]) ? a[k] : {}, b[k]); else a[k] = b[k]; } return a; };
  const notify = () => subs.forEach((s) => s.run());
  async function pull() {
    try {
      const r = await fetch("/api/state?since=" + version, { cache: "no-store" });
      if (r.status === 401) { failed = true; subs.forEach((s) => s.err && s.err({ code: "unauthenticated" })); return; }
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      failed = false;
      if (!j.unchanged) { store.clear(); for (const [k, v] of Object.entries(j.docs)) store.set(k, v); version = j.version; loaded = true; notify(); }
      else if (!loaded) { loaded = true; notify(); }
    } catch (e) { failed = true; subs.forEach((s) => s.err && s.err({ code: "unavailable" })); }
  }
  async function write(op, path, data) {
    const r = await fetch("/api/write", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op, path, data }) });
    if (!r.ok) { const j = await r.json().catch(() => ({})); pull(); throw { code: j.code || "unavailable" }; }
    const j = await r.json(); version = j.version;
  }
  const sub = (run, err) => { const s = { run: () => loaded && run(), err }; subs.push(s); if (loaded) setTimeout(s.run, 0); return () => { const i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); }; };
  const db = {
    doc: (p) => ({ path: p, id: p.split("/").pop(),
      get: async () => snapDoc(p),
      set: async (d) => { const prev = store.get(p); store.set(p, clone(d)); notify(); try { await write("set", p, d); } catch (e) { prev === undefined ? store.delete(p) : store.set(p, prev); notify(); throw e; } },
      update: async (d) => { if (!store.has(p)) throw { code: "invalid_argument" }; store.set(p, merge(store.get(p), clone(d))); notify(); await write("update", p, d); },
      delete: async () => { store.delete(p); notify(); await write("delete", p); },
      onSnapshot: (next, err) => sub(() => next(snapDoc(p)), err) }),
    collection: (c) => ({ path: c,
      onSnapshot: (next, err) => sub(() => { const docs = [...store.keys()].filter((k) => parent(k) === c).sort().map(snapDoc); next({ docs, size: docs.length, empty: !docs.length, metadata: { fromCache: false, hasPendingWrites: false } }); }, err) }),
  };
  const downloads = { save: async ({ filename, data }) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "application/json" })); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); return { status: "saved" }; } };
  window.claude = { use: async (n) => (n === "db" ? db : n === "user" ? { can: async () => true } : n === "downloads" ? downloads : null) };
  pull(); setInterval(() => { if (!document.hidden) pull(); }, 30000);
  window.addEventListener("focus", pull);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) pull(); });
})();
