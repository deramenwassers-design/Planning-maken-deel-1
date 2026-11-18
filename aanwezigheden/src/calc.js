/* Rekenregels van de aanwezigheidsregistratie (zelfde regels als het Excel-bestand). */
const Calc = (() => {
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  const utc = (y, m, d) => Date.UTC(y, m - 1, d);
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return { y, m, d }; };
  const dayNum = (s) => { const p = parse(s); return Math.round(utc(p.y, p.m, p.d) / 86400000); };
  const fromDayNum = (n) => { const t = new Date(n * 86400000); return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); };
  const addDays = (s, n) => fromDayNum(dayNum(s) + n);
  const weekday = (s) => { const p = parse(s); return (new Date(utc(p.y, p.m, p.d)).getUTCDay() + 6) % 7; }; // 0 = maandag
  const daysInMonth = (y, m) => new Date(utc(y, m + 1, 0)).getUTCDate();

  function easter(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
    return iso(y, mo, da);
  }
  const holCache = {};
  function holidays(y) {
    if (holCache[y]) return holCache[y];
    const e = easter(y);
    const list = [[iso(y, 1, 1), "Nieuwjaar"], [addDays(e, 1), "Paasmaandag"], [iso(y, 5, 1), "Dag van de Arbeid"],
      [addDays(e, 39), "O.H. Hemelvaart"], [addDays(e, 50), "Pinkstermaandag"], [iso(y, 7, 21), "Nationale feestdag"],
      [iso(y, 8, 15), "O.L.V. Hemelvaart"], [iso(y, 11, 1), "Allerheiligen"], [iso(y, 11, 11), "Wapenstilstand"],
      [iso(y, 12, 25), "Kerstmis"]];
    return (holCache[y] = new Map(list));
  }

  /* data = { config:{norm,open:[{from,days[7]}],codes:[{code,label,counts}]}, kids:{id:{name,periods:[{from,to,days[5]}]}},
              months:{"YYYY-MM":{codes:{"DD":code},kids:{id:{"DD":waarde}}}} } */
  function openFlag(cfg, s) {
    let flags = null;
    for (const p of cfg.open) if (p.from <= s && (!flags || p.from >= flags.from)) flags = p;
    return flags ? flags.days[weekday(s)] === 1 : false;
  }
  function typedCode(data, s) {
    const m = data.months[s.slice(0, 7)];
    return m && m.codes ? m.codes[s.slice(8, 10)] || "" : "";
  }
  function status(data, s) {
    const t = typedCode(data, s);
    if (t) return t;
    if (holidays(+s.slice(0, 4)).has(s)) return "FD";
    return openFlag(data.config, s) ? "W" : "";
  }
  function counts(data, code) {
    const c = data.config.codes.find((x) => x.code === code);
    return c ? c.counts === 1 : false;
  }
  const worked = (data, s) => { const st = status(data, s); return st !== "" && counts(data, st); };
  function planned(data, id, s) {
    const wd = weekday(s);
    if (wd > 4 || !worked(data, s)) return 0;
    const k = data.kids[id];
    if (!k) return 0;
    for (const p of k.periods) {
      if (p.from && p.from <= s && (!p.to || p.to >= s) && p.days[wd] === 1) return 1;
    }
    return 0;
  }
  function typed(data, id, s) {
    const m = data.months[s.slice(0, 7)];
    if (!m || !m.kids || !m.kids[id]) return null;
    const v = m.kids[id][s.slice(8, 10)];
    return typeof v === "number" ? v : null;
  }
  function value(data, id, s) {
    const t = typed(data, id, s);
    return t === null ? planned(data, id, s) : t;
  }
  function dayTotal(data, s) {
    let t = 0;
    for (const id of Object.keys(data.kids)) t += value(data, id, s);
    return t;
  }

  function kidStart(k) { return k.periods.reduce((a, p) => (p.from && (!a || p.from < a) ? p.from : a), null) || "9999-12-31"; }
  function kidActive(k, today) {
    return k.periods.some((p) => p.from && p.from <= today && (!p.to || p.to >= today)) ||
      k.periods.some((p) => p.from && p.from > today);
  }
  function sortedKids(data, today) {
    const ids = Object.keys(data.kids);
    const key = (id) => { const k = data.kids[id]; return [kidActive(k, today) ? 0 : 1, kidStart(k), k.name.toLowerCase()]; };
    return ids.sort((a, b) => { const x = key(a), y = key(b); return x[0] - y[0] || (x[1] < y[1] ? -1 : x[1] > y[1] ? 1 : 0) || (x[2] < y[2] ? -1 : x[2] > y[2] ? 1 : 0); });
  }
  /* kindjes die in een maand zichtbaar zijn: periode overlapt de maand, of er staat iets getypt */
  function monthKids(data, y, m, today) {
    const first = iso(y, m, 1), last = iso(y, m, daysInMonth(y, m));
    const mk = data.months[`${y}-${pad(m)}`];
    return sortedKids(data, today).filter((id) => {
      const k = data.kids[id];
      if (k.periods.some((p) => p.from && p.from <= last && (!p.to || p.to >= first))) return true;
      return !!(mk && mk.kids && mk.kids[id] && Object.values(mk.kids[id]).some((v) => typeof v === "number"));
    });
  }

  function month(data, y, m, today) {
    const n = daysInMonth(y, m);
    let w = 0, kids = 0, empty = 0;
    const perKid = {};
    for (let d = 1; d <= n; d++) {
      const s = iso(y, m, d);
      const isW = worked(data, s);
      const tot = dayTotal(data, s);
      if (isW) w++;
      kids += tot;
      if (isW && tot === 0 && s <= today) empty++;
      for (const id of Object.keys(data.kids)) perKid[id] = (perKid[id] || 0) + value(data, id, s);
    }
    const future = kids === 0 && iso(y, m, 1) > today;
    const norm = future ? null : w * data.config.norm;
    return { worked: w, kids, avg: w ? kids / w : null, norm, diff: future ? null : kids - norm, empty, perKid };
  }

  function year(data, y, today) {
    const months = [];
    for (let m = 1; m <= 12; m++) months.push(month(data, y, m, today));
    const sum = (arr, f) => arr.reduce((a, x) => a + (x[f] || 0), 0);
    const quarters = [];
    for (let q = 0; q < 4; q++) {
      const ms = months.slice(q * 3, q * 3 + 3);
      const w = sum(ms, "worked"), kids = sum(ms, "kids");
      quarters.push({ worked: w, kids, avg: w ? kids / w : null, norm: sum(ms, "norm"), diff: sum(ms, "diff"), empty: sum(ms, "empty") });
    }
    const w = sum(quarters, "worked"), kids = sum(quarters, "kids");
    const total = { worked: w, kids, avg: w ? kids / w : null, norm: sum(quarters, "norm"), diff: sum(quarters, "diff"), empty: sum(quarters, "empty") };
    let run = 0;
    months.forEach((x) => { if (x.diff === null) x.run = null; else { run += x.diff; x.run = run; } });
    const perKid = {};
    months.forEach((x) => { for (const id in x.perKid) perKid[id] = (perKid[id] || 0) + x.perKid[id]; });
    /* dagen per code: enkel dagen waarop je open bent (W = gewerkte dagen) */
    const perCode = data.config.codes.map((c) => {
      const q = [0, 0, 0, 0];
      for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= daysInMonth(y, m); d++) {
          const s = iso(y, m, d);
          if (c.code === "W") { if (worked(data, s)) q[Math.floor((m - 1) / 3)]++; continue; }
          if (status(data, s) === c.code && openFlag(data.config, s)) q[Math.floor((m - 1) / 3)]++;
        }
      }
      return { code: c.code, label: c.label, q, total: q.reduce((a, b) => a + b, 0) };
    });
    return { months, quarters, total, perKid, perCode };
  }

  return { pad, iso, parse, dayNum, addDays, weekday, daysInMonth, easter, holidays, openFlag, status, counts, worked, planned, typed, value,
    dayTotal, kidStart, kidActive, sortedKids, monthKids, month, year, typedCode };
})();
if (typeof module !== "undefined") module.exports = Calc;
