import { useState } from "react";

const anim = (v) => ({ animation: v, WebkitAnimation: v });

/* ── Colors ── */
const N = "#1B2A4A";
const G = "#D4A843";
const GR = "#2D6A4F";
const RED = "#c0392b";

/* ── Formatting ── */
const fmt = (n) => isFinite(n) ? Math.round(n).toLocaleString("de-DE") : "—";
const fmtE = (n) => fmt(n) + " €";
const fmtM = (n) => {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(".", ",") + " Mio €";
  if (Math.abs(n) >= 1e3) return Math.round(n / 1e3) + " T€";
  return fmt(n) + " €";
};
const fmtPct = (n) => (n).toFixed(1).replace(".", ",") + " %";
const today = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });

/* ── Inline SVG icon strings for HTML templates ── */
const iconSvg = (name, size = 16, color = N) => {
  const p = {
    search: `<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>`,
    sun: `<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`,
    battery: `<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2" stroke-width="2" stroke-linecap="round"/><rect x="5" y="10" width="6" height="4" rx="0.5" fill="${color}" stroke="none"/>`,
    fire: `<path d="M12 2c.5 3.5-1.5 6-1.5 6 1.5.5 3-1 3.5-2.5C15.5 9 16 12 14 14c3-1 4.5-3.5 4.5-6.5 0-2-1-4.5-3-5.5 0 2-1.5 3-3 3C12 3.5 12 2 12 2ZM10 16c-.5 1.5.5 3 2 3s2.5-1.5 2-3c-.5-1-1-1.5-2-2-1 .5-1.5 1-2 2Z"/>`,
    plug: `<path d="M12 22v-4M7 12V8M17 12V8"/><rect x="5" y="12" width="14" height="4" rx="2"/><path d="M7 8V5M17 8V5" stroke-linecap="round"/>`,
    bolt: `<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>`,
    factory: `<path d="M2 20V8l5 4V8l5 4V8l5 4V4h5v16H2Z"/>`,
    satellite: `<path d="M4 15 1 18M7 12 4 15"/><circle cx="5.5" cy="16.5" r="1.5" fill="${color}" stroke="none"/><path d="M4 15c0 0 1-6 7-6s6 7 6 7"/><path d="M1 18c0 0 1.5-10 11-10s10 10 10 10"/>`,
    chart: `<rect x="3" y="12" width="4" height="8" rx="1"/><rect x="10" y="6" width="4" height="14" rx="1"/><rect x="17" y="2" width="4" height="18" rx="1"/>`,
    microscope: `<path d="M6 18h12M14 4l-4 8M10 12a5 5 0 0 0 5 5"/><circle cx="14" cy="4" r="2"/><path d="M3 18h18" stroke-width="2"/>`,
    chartDown: `<path d="M3 3v18h18"/><path d="m7 10 4 4 3-3 6 6"/><path d="M17 17h3v-3"/>`,
    money: `<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1.5-2-2-3.5-2H10c-1.5 0-2.5 1-2.5 2.25S8.5 12 10 12h3c1.5 0 2.5 1 2.5 2.25S14 16.5 12.5 16.5H10c-1.5 0-3-.5-3.5-2"/><path d="M12 6v1.5M12 16.5V18"/>`,
    leaf: `<path d="M12 22c-4-3-8-7.5-8-13C4 5.5 7.5 2 12 2s8 3.5 8 7c0 5.5-4 10-8 13Z"/><path d="M12 22V10M8 14c2-2 4-2 4-2s2 0 4 2"/>`,
    bank: `<path d="M3 21h18M12 3 2 9h20L12 3Z"/><path d="M5 9v9M9 9v9M15 9v9M19 9v9" stroke-linecap="round"/>`,
    document: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>`,
    globe: `<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10A15 15 0 0 1 12 2Z"/>`,
    chartUp: `<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 6-6"/><path d="M17 7h3v3"/>`,
    car: `<path d="M5 17h14V12l-2-5H7L5 12v5Z"/><path d="M3 17h2v2H3v-2ZM19 17h2v2h-2v-2Z"/><circle cx="7.5" cy="17" r="1.5" fill="${color}" stroke="none"/><circle cx="16.5" cy="17" r="1.5" fill="${color}" stroke="none"/><path d="M5 12h14"/>`,
    pin: `<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/>`,
    check: `<path d="M20 6 9 17l-5-5"/>`,
  };
  const d = p[name];
  if (!d) return name;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">${d}</svg>`;
};

/* ── Export Sections ── */
const SECTIONS = [
  { key: "cover", label: "Deckblatt", group: "p", def: true, locked: true },
  { key: "overview", label: "Auf einen Blick (Key Facts)", group: "p", def: true },
  { key: "phases", label: "Phasenübersicht (I–VI)", group: "p", def: true },
  { key: "roadmap", label: "Investitions-Roadmap", group: "w", def: true },
  { key: "finanzierung", label: "Finanzierung & Kreditstruktur", group: "w", def: true },
  { key: "cashflow", label: "20-Jahres Cashflow-Projektion", group: "w", def: true },
  { key: "savings", label: "Jährliche Einsparungen & Erlöse", group: "w", def: true },
  { key: "regulatorik", label: "Regulatorik & Compliance", group: "w", def: true },
  { key: "foerdermittel", label: "Fördermittel je Phase", group: "w", def: true },
  { key: "risiko", label: "Risikomanagement", group: "w", def: false },
  { key: "konfiguration", label: "Individuelle Kalkulation", group: "w", def: false },
];

/* ── 20-Year Projection (with optional financing) ── */
function project20Years(calc, config) {
  const rows = [];
  let cumCf = 0, cumCfFin = 0;
  const zinsRate = config.kreditZins / 100;
  const tilgungsfrei = config.tilgungsfrei;
  const tilgungsJahre = Math.max(1, config.kreditLaufzeit - tilgungsfrei);

  // Build amortization schedule
  let restschuld = calc.kreditBetrag;
  const debtSchedule = [];
  for (let y = 0; y <= 20; y++) {
    if (y === 0) { debtSchedule.push({ zins: 0, tilgung: 0, annuitaet: 0, rest: restschuld }); continue; }
    if (restschuld <= 0) { debtSchedule.push({ zins: 0, tilgung: 0, annuitaet: 0, rest: 0 }); continue; }
    const zins = restschuld * zinsRate;
    let tilgung = 0;
    if (y > tilgungsfrei && restschuld > 0) {
      // Annuity-based tilgung
      const annui = calc.annuitaet;
      tilgung = Math.min(restschuld, annui - zins);
      if (tilgung < 0) tilgung = 0;
    }
    restschuld = Math.max(0, restschuld - tilgung);
    debtSchedule.push({ zins: r(zins), tilgung: r(tilgung), annuitaet: r(zins + tilgung), rest: r(restschuld) });
  }

  for (let y = 0; y <= 20; y++) {
    if (y === 0) {
      cumCf = -(calc.investGesamt);
      cumCfFin = -(calc.ekBetrag); // Only equity portion at start
      rows.push({ y, inv: -calc.investGesamt, invFin: -calc.ekBetrag, strom: 0, einsp: 0, peak: 0, gas: 0, mob: 0, bess: 0, wart: 0, cf: -calc.investGesamt, cum: cumCf, debt: 0, cfFin: -calc.ekBetrag, cumFin: cumCfFin, restschuld: calc.kreditBetrag });
      continue;
    }
    const pvF = Math.pow(0.995, y);
    const pF = Math.pow(1.02, y);
    const strom = calc.stromEinsparung * pvF * pF;
    const einsp = calc.einspeiseErloese * pvF;
    const peak = calc.peakShavingSavings * pF;
    const gas = calc.gasEinsparung * Math.pow(1.025, y);
    const mob = calc.mobilitaetEinsparung * pF;
    const bess = calc.bessErloes * Math.pow(1.01, y);
    const wart = calc.investStandort * 0.015 + calc.investPhase6 * 0.008;
    const cf = strom + einsp + peak + gas + mob + bess - wart;
    cumCf += cf;
    const debt = debtSchedule[y].annuitaet;
    const cfFin = cf - debt;
    cumCfFin += cfFin;
    rows.push({ y, inv: 0, invFin: 0, strom: r(strom), einsp: r(einsp), peak: r(peak), gas: r(gas), mob: r(mob), bess: r(bess), wart: r(wart), cf: r(cf), cum: r(cumCf), debt: r(debt), cfFin: r(cfFin), cumFin: r(cumCfFin), restschuld: debtSchedule[y].rest });
  }
  return { rows, debtSchedule };
}
function r(n) { return Math.round(n); }

/* ── SVG Chart: Dual Cashflow ── */
function cashflowSvg(proj, hasFinancing) {
  const w = 520, h = 220, pad = { t: 20, r: 15, b: 35, l: 65 };
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
  const valsA = proj.map(p => p.cum);
  const valsB = hasFinancing ? proj.map(p => p.cumFin) : valsA;
  const allVals = [...valsA, ...valsB];
  const minV = Math.min(...allVals), maxV = Math.max(...allVals);
  const range = maxV - minV || 1;
  const x = (i) => pad.l + (i / 20) * pw;
  const yy = (v) => pad.t + ph - ((v - minV) / range) * ph;
  const ptsA = proj.map((p, i) => `${x(i).toFixed(1)},${yy(p.cum).toFixed(1)}`).join(" ");
  const ptsB = hasFinancing ? proj.map((p, i) => `${x(i).toFixed(1)},${yy(p.cumFin).toFixed(1)}`).join(" ") : "";
  const zeroY = yy(0);
  const yTicks = [];
  const step = niceStep(range, 5);
  for (let v = Math.ceil(minV / step) * step; v <= maxV; v += step) yTicks.push(v);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="width:100%;max-width:520px;height:auto;">
    <defs>
      <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${GR}" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="${GR}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#fafafa" rx="6"/>
    ${yTicks.map(v => `<line x1="${pad.l}" x2="${w - pad.r}" y1="${yy(v).toFixed(1)}" y2="${yy(v).toFixed(1)}" stroke="#e8e8e8" stroke-width="0.5"/>
    <text x="${pad.l - 6}" y="${yy(v).toFixed(1)}" text-anchor="end" font-size="6.5" fill="#999" font-family="Calibri,sans-serif" dominant-baseline="middle">${fmtM(v)}</text>`).join("")}
    ${minV < 0 && maxV > 0 ? `<line x1="${pad.l}" x2="${w - pad.r}" y1="${zeroY.toFixed(1)}" y2="${zeroY.toFixed(1)}" stroke="#888" stroke-width="0.8" stroke-dasharray="4,3"/>` : ""}
    <polyline points="${ptsA}" fill="none" stroke="${N}" stroke-width="2.5" stroke-linejoin="round"/>
    ${proj.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${yy(p.cum).toFixed(1)}" r="3" fill="${p.cum >= 0 ? GR : RED}" stroke="white" stroke-width="1.2"/>`).join("")}
    ${hasFinancing ? `<polyline points="${ptsB}" fill="none" stroke="${G}" stroke-width="2" stroke-dasharray="6,3" stroke-linejoin="round"/>
    ${proj.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${yy(p.cumFin).toFixed(1)}" r="2.5" fill="${p.cumFin >= 0 ? G : RED}" stroke="white" stroke-width="0.8"/>`).join("")}` : ""}
    ${[0, 5, 10, 15, 20].map(i => `<text x="${x(i).toFixed(1)}" y="${h - 12}" text-anchor="middle" font-size="7" fill="#888" font-family="Calibri,sans-serif">${proj[i].y === 0 ? "Start" : proj[i].y + ". J."}</text>`).join("")}
    <text x="${w / 2}" y="${h - 2}" text-anchor="middle" font-size="6.5" fill="#aaa" font-family="Calibri,sans-serif">Kumulierter Cashflow — ${hasFinancing ? "durchgezogen: vor Finanzierung · gestrichelt: nach Schuldendienst" : "vor Steuer"}</text>
    ${hasFinancing ? `<rect x="${pad.l + 5}" y="${pad.t}" width="8" height="2.5" fill="${N}" rx="1"/>
    <text x="${pad.l + 16}" y="${pad.t + 2.5}" font-size="6.5" fill="#555" font-family="Calibri,sans-serif">Ohne Kredit</text>
    <rect x="${pad.l + 70}" y="${pad.t}" width="8" height="2.5" fill="${G}" rx="1" stroke-dasharray="3,2"/>
    <text x="${pad.l + 81}" y="${pad.t + 2.5}" font-size="6.5" fill="#555" font-family="Calibri,sans-serif">Mit Kredit (EK-Sicht)</text>` : ""}
  </svg>`;
}
function niceStep(range, ticks) {
  const raw = range / ticks;
  if (!isFinite(raw) || raw <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  if (!isFinite(mag) || mag <= 0) return 1;
  const norm = raw / mag;
  if (norm <= 1.5) return mag;
  if (norm <= 3) return 2 * mag;
  if (norm <= 7) return 5 * mag;
  return 10 * mag;
}

/* ── Stacked Bar chart: Annual Revenue Breakdown ── */
function revenueSvg(proj) {
  const w = 520, h = 175, pad = { t: 18, r: 15, b: 30, l: 65 };
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
  const vals = proj.slice(1).map(p => p.strom + p.einsp + p.peak + p.gas + p.mob + p.bess);
  const maxV = Math.max(...vals, 1);
  const barW = pw / 20 * 0.75;
  const gap = pw / 20 * 0.25;
  const colors = [
    { key: "strom", color: GR, label: "Strom" },
    { key: "gas", color: "#8B6914", label: "Gas" },
    { key: "bess", color: G, label: "BESS" },
    { key: "mob", color: "#3A8A66", label: "Mob." },
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="width:100%;max-width:520px;height:auto;">
    <rect width="${w}" height="${h}" fill="#fafafa" rx="6"/>
    ${proj.slice(1).map((p, i) => {
      const total = p.strom + p.einsp + p.peak + p.gas + p.mob + p.bess;
      const bx = pad.l + i * (pw / 20) + gap / 2;
      let cy = pad.t + ph;
      const segments = [
        { v: p.strom + p.einsp + p.peak, c: GR },
        { v: p.gas, c: "#8B6914" },
        { v: p.bess, c: G },
        { v: p.mob, c: "#3A8A66" },
      ];
      return segments.map(s => {
        const bh = (s.v / maxV) * ph;
        cy -= bh;
        return bh > 0.5 ? `<rect x="${bx.toFixed(1)}" y="${cy.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" fill="${s.c}" rx="1" opacity="0.85"/>` : "";
      }).join("");
    }).join("")}
    ${[1, 5, 10, 15, 20].map(i => `<text x="${(pad.l + (i - 1) * (pw / 20) + (pw / 20) / 2).toFixed(1)}" y="${h - 10}" text-anchor="middle" font-size="7" fill="#888" font-family="Calibri,sans-serif">${i}. J.</text>`).join("")}
    <text x="${w / 2}" y="${h - 1}" text-anchor="middle" font-size="6.5" fill="#aaa" font-family="Calibri,sans-serif">Jährliche Erlöse nach Kategorie</text>
    ${colors.map((c, i) => `<rect x="${pad.l + 5 + i * 60}" y="${pad.t - 2}" width="8" height="6" fill="${c.color}" rx="1" opacity="0.85"/>
    <text x="${pad.l + 16 + i * 60}" y="${pad.t + 3.5}" font-size="6" fill="#777" font-family="Calibri,sans-serif">${c.label}</text>`).join("")}
  </svg>`;
}

/* ── SVG: Debt Service Chart ── */
function debtSvg(debtSchedule, kreditLaufzeit) {
  const w = 520, h = 160, pad = { t: 15, r: 15, b: 30, l: 65 };
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
  const n = Math.min(kreditLaufzeit, 20);
  const data = debtSchedule.slice(1, n + 1);
  const maxV = Math.max(...data.map(d => d.zins + d.tilgung), 1);
  const barW = (pw / n) * 0.7;
  const gap = (pw / n) * 0.3;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="width:100%;max-width:520px;height:auto;">
    <rect width="${w}" height="${h}" fill="#fafafa" rx="6"/>
    ${data.map((d, i) => {
      const bx = pad.l + i * (pw / n) + gap / 2;
      const hZins = (d.zins / maxV) * ph;
      const hTilg = (d.tilgung / maxV) * ph;
      const yTilg = pad.t + ph - hTilg - hZins;
      const yZins = pad.t + ph - hZins;
      return `<rect x="${bx.toFixed(1)}" y="${yTilg.toFixed(1)}" width="${barW.toFixed(1)}" height="${hTilg.toFixed(1)}" fill="${N}" rx="1" opacity="0.7"/>
      <rect x="${bx.toFixed(1)}" y="${yZins.toFixed(1)}" width="${barW.toFixed(1)}" height="${hZins.toFixed(1)}" fill="${RED}" rx="1" opacity="0.6"/>`;
    }).join("")}
    ${[1, Math.round(n / 2), n].filter((v, i, a) => a.indexOf(v) === i).map(i => `<text x="${(pad.l + (i - 1) * (pw / n) + (pw / n) / 2).toFixed(1)}" y="${h - 10}" text-anchor="middle" font-size="7" fill="#888" font-family="Calibri,sans-serif">${i}. J.</text>`).join("")}
    <rect x="${pad.l + 5}" y="${pad.t - 1}" width="8" height="5" fill="${N}" rx="1" opacity="0.7"/>
    <text x="${pad.l + 16}" y="${pad.t + 3}" font-size="6" fill="#777" font-family="Calibri,sans-serif">Tilgung</text>
    <rect x="${pad.l + 60}" y="${pad.t - 1}" width="8" height="5" fill="${RED}" rx="1" opacity="0.6"/>
    <text x="${pad.l + 71}" y="${pad.t + 3}" font-size="6" fill="#777" font-family="Calibri,sans-serif">Zinsen</text>
    <text x="${w / 2}" y="${h - 1}" text-anchor="middle" font-size="6.5" fill="#aaa" font-family="Calibri,sans-serif">Schuldendienst nach Jahren</text>
  </svg>`;
}

/* ── Page Header ── */
const hdr = `<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid ${N};padding-bottom:4mm;margin-bottom:5mm;">
  <div><div style="font-size:7pt;letter-spacing:2.5px;color:${G};font-weight:bold;font-family:Calibri,sans-serif;">ECKART WERKE · ENERGIETRANSFORMATION</div>
  <div style="font-size:8.5pt;color:#666;font-family:Calibri,sans-serif;">Güntersthal 4, 91235 Hartenstein</div></div>
  <div style="text-align:right;"><div style="font-size:6.5pt;color:#aaa;letter-spacing:1px;font-family:Calibri,sans-serif;">ERSTELLT DURCH</div>
  <div style="font-size:8pt;font-weight:bold;font-family:Calibri,sans-serif;">Elite PV GmbH · Levin Schober</div></div></div>`;

/* ── CSS ── */
const css = `
@page { size: A4 portrait; margin: 12mm 14mm 15mm 14mm; }
@media print { .no-print { display: none !important; } }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Calibri, Arial, Helvetica, sans-serif; color: #2B2B2B; font-size: 9pt; line-height: 1.5; }
.page { page-break-after: always; min-height: 100vh; }
.page:last-child { page-break-after: auto; }
h2 { font-family: Georgia, 'Times New Roman', serif; font-size: 14pt; color: ${N}; margin-bottom: 3.5mm; font-weight: 700; letter-spacing: 0.3px; }
h3 { font-family: Calibri, sans-serif; font-size: 9pt; color: ${N}; margin: 5mm 0 2.5mm; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; }
table { width: 100%; border-collapse: collapse; font-size: 8.5pt; font-family: Calibri, sans-serif; }
th { background: ${N}; color: white; padding: 2.5mm 3mm; text-align: left; font-size: 7pt; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 700; }
td { padding: 2.2mm 3mm; border-bottom: 0.5px solid #e5e5e5; }
tr:nth-child(even) td { background: #f9f9f8; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.bold { font-weight: bold; }
.green { color: ${GR}; }
.gold { color: ${G}; }
.navy { color: ${N}; }
.red { color: ${RED}; }
.right { text-align: right; }
.pill { display: inline-block; background: #f0f0f0; border: 1px solid #ddd; border-radius: 3mm; padding: 1mm 3mm; margin: 1mm 1mm 1mm 0; font-size: 7pt; }
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 3mm; margin-bottom: 4mm; }
.kpi-box { background: linear-gradient(135deg, #f8f8f6, #f0f0ec); border-left: 2.5px solid ${G}; padding: 2.5mm 3.5mm; border-radius: 0 2.5mm 2.5mm 0; }
.kpi-label { font-size: 6pt; color: #999; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; }
.kpi-val { font-size: 11pt; font-weight: bold; color: ${N}; line-height: 1.3; }
.hero { border: 1.5px solid; border-radius: 3.5mm; padding: 5mm 6mm; background: linear-gradient(135deg, #fafafa, #f5f5f0); }
.hero-val { font-family: Georgia, serif; font-size: 20pt; font-weight: bold; line-height: 1.1; }
.total-row td { border-top: 2px solid ${N}; font-weight: bold; background: #f0f0ee !important; }
.sub-row td { padding-left: 6mm; font-size: 8pt; color: #666; }
.phase-card { border: 1px solid #e0e0dc; border-radius: 2.5mm; padding: 3mm 4mm; break-inside: avoid; margin-bottom: 3mm; border-left: 2.5px solid ${N}; }
.phase-title { font-size: 10pt; font-weight: bold; color: ${N}; margin-bottom: 1mm; }
.phase-quote { font-family: Georgia, serif; font-style: italic; color: ${G}; font-size: 8.5pt; margin-bottom: 2mm; }
.accent-box { padding: 3.5mm 5mm; border-radius: 2.5mm; border-left: 3px solid; margin-bottom: 3mm; }
.info-text { font-size: 8pt; color: #777; line-height: 1.55; }
.section-divider { height: 0.5px; background: linear-gradient(90deg, transparent, #ddd, transparent); margin: 4mm 0; }
`;

/* ════════════════════════════════════════════════════ */
/*  PAGE GENERATORS                                     */
/* ════════════════════════════════════════════════════ */

function coverPage(phases, calc, cfgActive, config) {
  return `<div class="page" style="display:flex;flex-direction:column;height:100vh;padding:0;">
    <div style="background:linear-gradient(160deg, ${N} 0%, #0F1D35 100%);color:white;padding:30mm 20mm 20mm;flex:0 0 auto;position:relative;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${G},${G}80,transparent);"></div>
      <div style="font-family:Calibri,sans-serif;font-size:7.5pt;letter-spacing:4px;color:${G};font-weight:bold;margin-bottom:3mm;">ECKART WERKE · ALTANA AG</div>
      <div style="width:40mm;height:0.7mm;background:linear-gradient(90deg,${G},transparent);margin-bottom:8mm;"></div>
      <div style="font-family:Georgia,serif;font-size:28pt;font-weight:bold;line-height:1.15;margin-bottom:4mm;">Energietransformation<br>Phasenkonzept</div>
      <div style="font-family:Calibri,sans-serif;font-size:10pt;color:rgba(255,255,255,0.65);letter-spacing:0.5px;">50 Hektar Industriestandort · 6 Phasen · Integriertes Energiesystem</div>
    </div>
    <div style="flex:1;padding:10mm 20mm;display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3.5mm;margin-bottom:7mm;">
          ${phases.slice(0, 6).map((p) => `<div style="border:1px solid #e0e0dc;border-radius:3mm;padding:3.5mm 4.5mm;border-top:2.5px solid ${N};background:linear-gradient(180deg,#fafafa,#f5f5f2);">
            <div style="margin-bottom:0.5mm;">${iconSvg(p.icon, 18, N)}</div>
            <div style="font-family:Calibri,sans-serif;font-size:6.5pt;letter-spacing:1.5px;color:${G};font-weight:700;">PHASE ${p.num}</div>
            <div style="font-family:Calibri,sans-serif;font-size:9pt;font-weight:bold;color:${N};">${p.title}</div>
            <div style="font-family:Calibri,sans-serif;font-size:7pt;color:#999;margin-top:0.5mm;">${p.investTotal}</div>
          </div>`).join("")}
        </div>

        <div style="background:linear-gradient(135deg,#f8f8f6,#f0f0ec);border:1px solid #e5e5e0;border-radius:3mm;padding:5mm 6mm;margin-bottom:6mm;">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5mm;">
            <div><div style="font-family:Calibri,sans-serif;font-size:6pt;color:#999;letter-spacing:1px;font-weight:600;">GESAMTINVESTITION</div><div style="font-family:Georgia,serif;font-size:14pt;font-weight:bold;color:${N};">${cfgActive ? fmtM(calc.investGesamt) : "43–70 Mio €"}</div></div>
            <div><div style="font-family:Calibri,sans-serif;font-size:6pt;color:#999;letter-spacing:1px;font-weight:600;">JÄHRL. EINSPARUNG</div><div style="font-family:Georgia,serif;font-size:14pt;font-weight:bold;color:${GR};">${cfgActive ? fmtM(calc.einsparungStandort) + "/a" : "1,4–2,5 Mio €"}</div></div>
            <div><div style="font-family:Calibri,sans-serif;font-size:6pt;color:#999;letter-spacing:1px;font-weight:600;">CO₂-REDUKTION</div><div style="font-family:Georgia,serif;font-size:14pt;font-weight:bold;color:${GR};">${cfgActive ? "~" + fmt(calc.co2Gesamt) + " t/a" : "~4.800 t/a"}</div></div>
            <div><div style="font-family:Calibri,sans-serif;font-size:6pt;color:#999;letter-spacing:1px;font-weight:600;">AUTARKIE-ZIEL</div><div style="font-family:Georgia,serif;font-size:14pt;font-weight:bold;color:${G};">${cfgActive ? calc.autarkie + " %" : "~95 %"}</div></div>
          </div>
        </div>

        ${cfgActive && config.ekAnteil < 100 ? `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3.5mm;">
          <div style="background:#f8f8f6;border-left:2.5px solid ${G};padding:3mm 4mm;border-radius:0 2mm 2mm 0;">
            <div style="font-family:Calibri,sans-serif;font-size:6pt;color:#999;letter-spacing:1px;font-weight:600;">EIGENKAPITAL</div>
            <div style="font-family:Georgia,serif;font-size:12pt;font-weight:bold;color:${N};">${fmtM(calc.ekBetrag)}</div>
            <div style="font-family:Calibri,sans-serif;font-size:7pt;color:#888;">${config.ekAnteil} % EK-Quote</div>
          </div>
          <div style="background:#f8f8f6;border-left:2.5px solid ${N};padding:3mm 4mm;border-radius:0 2mm 2mm 0;">
            <div style="font-family:Calibri,sans-serif;font-size:6pt;color:#999;letter-spacing:1px;font-weight:600;">KREDIT</div>
            <div style="font-family:Georgia,serif;font-size:12pt;font-weight:bold;color:${N};">${fmtM(calc.kreditBetrag)}</div>
            <div style="font-family:Calibri,sans-serif;font-size:7pt;color:#888;">${fmtPct(config.kreditZins)} · ${config.kreditLaufzeit} J.</div>
          </div>
          <div style="background:#f8f8f6;border-left:2.5px solid ${GR};padding:3mm 4mm;border-radius:0 2mm 2mm 0;">
            <div style="font-family:Calibri,sans-serif;font-size:6pt;color:#999;letter-spacing:1px;font-weight:600;">EK-RENDITE</div>
            <div style="font-family:Georgia,serif;font-size:12pt;font-weight:bold;color:${GR};">${fmtPct(calc.ekRendite)} p.a.</div>
            <div style="font-family:Calibri,sans-serif;font-size:7pt;color:#888;">DSCR ${calc.dscr.toFixed(1).replace(".",",")}x</div>
          </div>
        </div>` : ""}
      </div>

      <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1.5px solid ${N};padding-top:4mm;">
        <div><div style="font-family:Calibri,sans-serif;font-size:6.5pt;color:#aaa;letter-spacing:1.5px;font-weight:600;">ERSTELLT DURCH</div>
          <div style="font-weight:bold;font-size:9.5pt;">Elite PV GmbH</div><div style="font-size:8pt;color:#666;">Levin Schober · levinschober@elite-pv.de</div></div>
        <div style="text-align:center;"><div style="font-family:Calibri,sans-serif;font-size:6.5pt;color:#aaa;letter-spacing:1.5px;font-weight:600;">ERSTELLT FÜR</div>
          <div style="font-weight:bold;font-size:9.5pt;">ECKART GmbH</div><div style="font-size:8pt;color:#666;">Güntersthal 4, 91235 Hartenstein</div></div>
        <div style="text-align:right;"><div style="font-family:Calibri,sans-serif;font-size:6.5pt;color:#aaa;letter-spacing:1.5px;font-weight:600;">DATUM</div>
          <div style="font-weight:bold;font-size:9.5pt;">${today}</div><div style="font-size:8pt;color:#666;">Vertraulich</div></div>
      </div>
    </div>
  </div>`;
}

function overviewPage(phases, calc, cfgActive) {
  const fin = phases[6];
  return `<div class="page">${hdr}
    <h2>Auf einen Blick</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-bottom:5mm;">
      <div class="hero" style="border-color:${GR};">
        <div style="font-size:6.5pt;letter-spacing:2.5px;color:${GR};font-weight:bold;margin-bottom:2mm;">CO₂-EINSPARUNG PRO JAHR</div>
        <div class="hero-val green">${cfgActive ? "~" + fmt(calc.co2Gesamt) + " t" : "~4.800 t"}</div>
        <div class="info-text" style="margin:2mm 0 3mm;">CO₂ weniger pro Jahr${cfgActive ? " · " + fmtM(calc.co2Kosten) + "/a vermiedene CO₂-Kosten" : ""}</div>
        <table style="font-size:8pt;"><tr><td>Strom (PV statt Netz)</td><td class="num bold green">${cfgActive ? "–" + fmt(calc.co2Strom) + " t" : "–2.100 t"}</td></tr>
        <tr><td>Wärme (WP statt Gas)</td><td class="num bold green">${cfgActive ? "–" + fmt(calc.co2Waerme) + " t" : "–2.400 t"}</td></tr>
        <tr><td>Mobilität (E statt Diesel)</td><td class="num bold green">${cfgActive ? "–" + fmt(calc.co2PKW + calc.co2LKW) + " t" : "–300 t"}</td></tr></table>
      </div>
      <div class="hero" style="border-color:${G};">
        <div style="font-size:6.5pt;letter-spacing:2.5px;color:${G};font-weight:bold;margin-bottom:2mm;">JÄHRLICHER GESAMTERTRAG</div>
        <div class="hero-val gold">${cfgActive ? fmtM(calc.gesamtertrag) : "6,4–14,5 Mio €"}</div>
        <div class="info-text" style="margin:2mm 0 3mm;">Einsparung + Erlöse pro Jahr</div>
        <table style="font-size:8pt;"><tr><td>Standort-Einsparungen (I–V)</td><td class="num bold gold">${cfgActive ? fmtM(calc.einsparungStandort) + "/a" : "1,4–2,5 Mio €/a"}</td></tr>
        <tr><td>Graustrom-BESS Erlöse (VI)</td><td class="num bold gold">${cfgActive ? fmtM(calc.bessErloes) + "/a" : "5,0–12,0 Mio €/a"}</td></tr></table>
      </div>
    </div>
    <h3>Systemkennzahlen im Vollausbau</h3>
    <div class="kpi-grid" style="grid-template-columns:1fr 1fr 1fr;">
      ${fin.systemKpis.map(k => `<div class="kpi-box"><div class="kpi-label">${k.label}</div><div class="kpi-val">${k.value}</div><div style="font-size:7pt;color:#999;">${k.sub}</div></div>`).join("")}
    </div>
    <h3>Sechs Hebel · Ein integriertes Energiesystem</h3>
    <table><thead><tr><th style="width:30px;"></th><th>Hebel</th><th>Wirkung</th></tr></thead><tbody>
      ${fin.levers.map(l => `<tr><td style="text-align:center;">${iconSvg(l.icon, 16, N)}</td><td class="bold">${l.title}</td><td>${l.desc}</td></tr>`).join("")}
    </tbody></table>
    ${cfgActive ? `<div class="accent-box" style="border-left-color:${G};background:linear-gradient(135deg,#f8f8f4,#f5f5f0);margin-top:4mm;">
      <div style="font-size:6.5pt;letter-spacing:2px;color:${G};font-weight:bold;margin-bottom:2mm;">IHRE BERECHNUNG</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:3mm;font-size:8.5pt;">
        <div><span style="color:#999;">Investition:</span> <b>${fmtM(calc.investGesamt)}</b></div>
        <div><span style="color:#999;">Einsparung:</span> <b class="green">${fmtM(calc.einsparungStandort)}/a</b></div>
        <div><span style="color:#999;">Amortisation:</span> <b>${calc.amortisationStandort} J.</b></div>
        <div><span style="color:#999;">Autarkie:</span> <b class="gold">${calc.autarkie} %</b></div>
      </div></div>` : ""}
  </div>`;
}

function phasesPage(phases) {
  return `<div class="page">${hdr}
    <h2>Phasenübersicht</h2>
    ${phases.slice(0, 6).map((p) => `<div class="phase-card">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <div class="phase-title">${iconSvg(p.icon, 14, N)} Phase ${p.num} — ${p.title}</div>
        <div style="font-size:7.5pt;color:#999;font-weight:600;">${p.months}</div>
      </div>
      <div class="phase-quote">„${p.headline}"</div>
      <div style="display:grid;grid-template-columns:${p.kpis.length >= 4 ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr"};gap:2mm;margin-bottom:2mm;">
        ${p.kpis.map(k => `<div style="background:linear-gradient(135deg,#f8f8f6,#f3f3f0);padding:1.5mm 2.5mm;border-radius:1.5mm;"><div style="font-size:5.5pt;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${k.label}</div><div style="font-size:9pt;font-weight:bold;color:${N};">${k.value}</div></div>`).join("")}
      </div>
      <div style="display:flex;gap:6mm;font-size:8pt;">
        <div><span style="color:#999;">Investment:</span> <b>${p.investTotal}</b></div>
        <div><span style="color:#999;">Rendite:</span> <b class="green">${p.roiValue}</b></div>
        ${p.funding ? `<div style="display:flex;gap:1mm;flex-wrap:wrap;">${p.funding.map(f => `<span class="pill">${f.label}</span>`).join("")}</div>` : ""}
      </div>
    </div>`).join("")}
  </div>`;
}

function roadmapPage(phases, calc, cfgActive) {
  const fin = phases[6];
  return `<div class="page">${hdr}
    <h2>Investitions-Roadmap</h2>
    <table>
      <thead><tr><th>Phase</th><th>Baustein</th><th>Zeitraum</th><th class="num">Investition</th><th class="num">Rendite-Hebel</th><th class="num">Autarkie</th></tr></thead>
      <tbody>
        ${fin.investmentSummary.map(item => `<tr>
          <td class="bold" style="width:35px;">${item.phase}</td>
          <td>${item.label}</td>
          <td style="font-size:7.5pt;color:#999;">${phases.slice(0, 6).find(p => p.num === item.phase)?.months || "—"}</td>
          <td class="num bold">${item.range}</td>
          <td class="num green">${item.roi}</td>
          <td class="num gold">${item.score} %</td>
        </tr>`).join("")}
        <tr class="total-row"><td colspan="3">Gesamtinvestition</td><td class="num">${cfgActive ? fmtM(calc.investGesamt) : fin.investTotal}</td><td class="num green">${cfgActive ? fmtM(calc.einsparungStandort) + "/a + BESS" : "1,4–2,5 Mio €/a + BESS"}</td><td class="num gold">${cfgActive ? calc.autarkie + " %" : "95 %"}</td></tr>
      </tbody>
    </table>
    <div style="margin-top:5mm;display:grid;grid-template-columns:1fr 1fr 1fr;gap:3mm;">
      <div class="kpi-box"><div class="kpi-label">Standort-Invest (I–V)</div><div class="kpi-val">${cfgActive ? fmtM(calc.investStandort) : "8,5–22 Mio €"}</div></div>
      <div class="kpi-box"><div class="kpi-label">Graustrom-BESS (VI)</div><div class="kpi-val">${cfgActive ? fmtM(calc.investPhase6) : "35–48 Mio €"}</div></div>
      <div class="kpi-box" style="border-left-color:${GR};"><div class="kpi-label">Amortisation Standort</div><div class="kpi-val green">${cfgActive ? calc.amortisationStandort + " Jahre" : "~6–9 Jahre"}</div></div>
    </div>
    <h3 style="margin-top:6mm;">Jährliche Einsparungen & Erlöse (Phasen I–V)</h3>
    <table>
      <thead><tr><th>Position</th><th class="num">Jährliche Einsparung</th></tr></thead>
      <tbody>
        ${(cfgActive ? [
          { l: "PV-Eigenverbrauch (Stromkosten-Reduktion)", v: fmtE(calc.stromEinsparung) },
          { l: "Einspeiseerlöse (EEG 7 ct/kWh)", v: fmtE(calc.einspeiseErloese) },
          { l: "Peak Shaving & Spotmarkt-Optimierung", v: fmtE(calc.peakShavingSavings) },
          { l: "Gaskosten-Reduktion (WP-Kaskade)", v: fmtE(calc.gasEinsparung) },
          { l: "Mobilitäts-Einsparung (PKW + LKW)", v: fmtE(calc.mobilitaetEinsparung) },
        ] : fin.economicSummary.savings.map(s => ({ l: s.label, v: s.value }))).map(s =>
          `<tr><td>${s.l}</td><td class="num bold green">${s.v}</td></tr>`
        ).join("")}
        <tr class="total-row"><td>Gesamt jährliche Einsparung</td><td class="num bold">${cfgActive ? fmtM(calc.einsparungStandort) + "/a" : fin.economicSummary.totals.annualSavings}</td></tr>
        <tr><td class="bold">Zusätzlich: BESS-Erlöse (Phase VI)</td><td class="num bold gold">${cfgActive ? fmtM(calc.bessErloes) + "/a" : fin.economicSummary.totals.bessRevenue}</td></tr>
      </tbody>
    </table>
  </div>`;
}

/* ── NEW: Finanzierung & Kreditstruktur ── */
function finanzierungPage(calc, config, cfgActive, debtSchedule) {
  if (!cfgActive) {
    // Generic version without specific calculation
    return `<div class="page">${hdr}
      <h2>Finanzierung & Kreditstruktur</h2>
      <p class="info-text" style="margin-bottom:4mm;">Darstellung einer möglichen Fremdfinanzierungsstruktur. Individuelle Parameter können über den Kalkulator angepasst werden.</p>

      <h3>Typische Finanzierungsstruktur Energieprojekte</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-bottom:5mm;">
        <div class="hero" style="border-color:${G};">
          <div style="font-size:6.5pt;letter-spacing:2px;color:${G};font-weight:bold;margin-bottom:2mm;">EIGENKAPITAL</div>
          <div class="hero-val navy">20–40 %</div>
          <div class="info-text" style="margin-top:2mm;">8,6–28 Mio € EK-Bedarf</div>
          <div class="info-text">Je nach Risikoappetit und Bilanzstruktur</div>
        </div>
        <div class="hero" style="border-color:${N};">
          <div style="font-size:6.5pt;letter-spacing:2px;color:${N};font-weight:bold;margin-bottom:2mm;">FREMDKAPITAL</div>
          <div class="hero-val navy">60–80 %</div>
          <div class="info-text" style="margin-top:2mm;">25,8–56 Mio € Kreditvolumen</div>
          <div class="info-text">KfW + Geschäftsbank + Projektfinanzierung</div>
        </div>
      </div>

      <h3>Finanzierungsoptionen</h3>
      <table>
        <thead><tr><th>Instrument</th><th>Konditionen</th><th>Eignung</th><th>Bemerkung</th></tr></thead>
        <tbody>
          <tr><td class="bold">KfW 270 (PV/Speicher)</td><td>ab 3,5 % eff. · 20 J.</td><td class="green bold">Phase II, III</td><td>Tilgungszuschuss möglich</td></tr>
          <tr><td class="bold">KfW 295 (Effizienz)</td><td>ab 2,8 % eff. · 20 J.</td><td class="green bold">Phase IV, V</td><td>Bis 55 % Tilgungszuschuss</td></tr>
          <tr><td class="bold">Geschäftsbank Senior</td><td>4–6 % · 10–15 J.</td><td class="gold bold">Phase I–V</td><td>Besicherung über Assets</td></tr>
          <tr><td class="bold">Projektfinanzierung</td><td>Non-Recourse · 5–8 %</td><td class="gold bold">Phase VI (BESS)</td><td>Separates SPV möglich</td></tr>
          <tr><td class="bold">Contracting/Leasing</td><td>Ratenbasiert · 4–7 %</td><td>Phase II, V</td><td>Bilanzschonend (off-balance)</td></tr>
          <tr><td class="bold">Mezzanine / Nachrang</td><td>8–12 % · 5–7 J.</td><td>Alle Phasen</td><td>Ergänzung bei EK-Lücke</td></tr>
        </tbody>
      </table>

      <div class="accent-box" style="border-left-color:${GR};background:linear-gradient(135deg,#f5faf8,#f0f5f2);margin-top:5mm;">
        <div style="font-size:6.5pt;letter-spacing:2px;color:${GR};font-weight:bold;margin-bottom:1.5mm;">EMPFEHLUNG</div>
        <div class="info-text" style="color:#555;">
          <b>Optimale Struktur:</b> 70 % Fremdkapital (KfW-Mix + Geschäftsbank) mit 2 J. tilgungsfreier Anlaufphase.
          Phase VI (BESS) kann als separate Projektfinanzierung (SPV) strukturiert werden —
          Non-Recourse, besichert durch Cashflows aus Arbitrage und Regelenergie.
          DSCR-Anforderung typisch: >1,3x. Bei ${fmtM(7000000)} jährl. Gesamtertrag und ${fmtM(4000000)} Schuldendienst: DSCR ~1,75x.
        </div>
      </div>

      <div class="info-text" style="margin-top:3mm;font-style:italic;color:#999;">
        Aktivieren Sie den Kalkulator für eine individuelle Kreditberechnung mit anpassbaren Parametern (EK-Quote, Zinssatz, Laufzeit, tilgungsfreie Jahre).
      </div>
    </div>`;
  }

  // Individual calculation with financing
  const hasCredit = config.ekAnteil < 100;
  const cols = [0, 1, 2, 3, 5, 10, Math.min(config.kreditLaufzeit, 20)];
  const uniqueCols = [...new Set(cols)].filter(c => c <= 20).sort((a, b) => a - b);

  return `<div class="page">${hdr}
    <h2>Finanzierung & Kreditstruktur</h2>
    <p class="info-text" style="margin-bottom:4mm;">Individuelle Finanzierungsberechnung basierend auf Ihren Parametern.</p>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4mm;margin-bottom:5mm;">
      <div class="hero" style="border-color:${G};padding:4mm 5mm;">
        <div style="font-size:6pt;letter-spacing:2px;color:${G};font-weight:bold;margin-bottom:1.5mm;">EIGENKAPITAL</div>
        <div style="font-family:Georgia,serif;font-size:16pt;font-weight:bold;color:${N};">${fmtM(calc.ekBetrag)}</div>
        <div class="info-text">${config.ekAnteil} % der Gesamtinvestition</div>
      </div>
      <div class="hero" style="border-color:${N};padding:4mm 5mm;">
        <div style="font-size:6pt;letter-spacing:2px;color:${N};font-weight:bold;margin-bottom:1.5mm;">FREMDKAPITAL</div>
        <div style="font-family:Georgia,serif;font-size:16pt;font-weight:bold;color:${N};">${fmtM(calc.kreditBetrag)}</div>
        <div class="info-text">${100 - config.ekAnteil} % · ${fmtPct(config.kreditZins)} · ${config.kreditLaufzeit} J.</div>
      </div>
      <div class="hero" style="border-color:${GR};padding:4mm 5mm;">
        <div style="font-size:6pt;letter-spacing:2px;color:${GR};font-weight:bold;margin-bottom:1.5mm;">EK-RENDITE (LEVERED)</div>
        <div style="font-family:Georgia,serif;font-size:16pt;font-weight:bold;color:${GR};">${fmtPct(calc.ekRendite)} p.a.</div>
        <div class="info-text">nach Schuldendienst</div>
      </div>
    </div>

    <h3>Kreditkonditionen</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:4mm;">
      <table><thead><tr><th colspan="2">Kreditparameter</th></tr></thead><tbody>
        <tr><td>Kreditvolumen</td><td class="num bold">${fmtM(calc.kreditBetrag)}</td></tr>
        <tr><td>Zinssatz (nominal)</td><td class="num bold">${fmtPct(config.kreditZins)} p.a.</td></tr>
        <tr><td>Gesamtlaufzeit</td><td class="num bold">${config.kreditLaufzeit} Jahre</td></tr>
        <tr><td>Tilgungsfreie Jahre</td><td class="num bold">${config.tilgungsfrei} Jahre</td></tr>
        <tr><td>Tilgungsdauer</td><td class="num bold">${calc.tilgungsJahre} Jahre</td></tr>
      </tbody></table>
      <table><thead><tr><th colspan="2">Schuldendienst</th></tr></thead><tbody>
        <tr><td>Zins (tilgungsfreie Phase)</td><td class="num bold">${fmtE(calc.zinsTilgungsfrei)}/a</td></tr>
        <tr><td>Annuität (Tilgungsphase)</td><td class="num bold">${fmtE(calc.annuitaet)}/a</td></tr>
        <tr><td>Gesamte Zinskosten</td><td class="num bold red">${fmtM(calc.totalZinskosten)}</td></tr>
        <tr><td>Cashflow nach Schulden</td><td class="num bold green">${fmtE(calc.cfNachSchuldendienst)}/a</td></tr>
        <tr><td>DSCR (Debt Coverage)</td><td class="num bold ${calc.dscr >= 1.3 ? "green" : "red"}">${calc.dscr.toFixed(2).replace(".",",")}x</td></tr>
      </tbody></table>
    </div>

    ${hasCredit ? `<h3>Schuldendienst-Verlauf</h3>
    ${debtSvg(debtSchedule, config.kreditLaufzeit)}` : ""}

    <h3 style="margin-top:4mm;">Tilgungsplan (Auszug)</h3>
    <table style="font-size:7.5pt;">
      <thead><tr><th>Jahr</th><th class="num">Zinsen</th><th class="num">Tilgung</th><th class="num">Annuität</th><th class="num">Restschuld</th></tr></thead>
      <tbody>
        ${uniqueCols.map(c => {
          const d = debtSchedule[c];
          const isLast = c === uniqueCols[uniqueCols.length - 1];
          return `<tr ${isLast ? 'class="total-row"' : ""}><td class="bold">${c === 0 ? "Start" : c + ". Jahr"}</td>
            <td class="num ${c > 0 ? "red" : ""}">${c === 0 ? "—" : fmtE(d.zins)}</td>
            <td class="num">${c === 0 ? "—" : fmtE(d.tilgung)}</td>
            <td class="num bold">${c === 0 ? "—" : fmtE(d.annuitaet)}</td>
            <td class="num bold">${fmtE(d.rest)}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>

    <div class="accent-box" style="border-left-color:${GR};background:linear-gradient(135deg,#f5faf8,#f0f5f2);margin-top:4mm;">
      <div style="font-size:6.5pt;letter-spacing:2px;color:${GR};font-weight:bold;margin-bottom:1.5mm;">BEWERTUNG</div>
      <div class="info-text" style="color:#555;">
        ${calc.dscr >= 1.3
          ? `Mit einem DSCR von ${calc.dscr.toFixed(1).replace(".",",")}x liegt die Kapitaldienstfähigkeit deutlich über dem banküblichen Minimum von 1,3x. Die jährlichen Erlöse von ${fmtM(calc.gesamtertrag)} decken den Schuldendienst von ${fmtE(calc.annuitaet)}/a komfortabel ab. Die EK-Rendite von ${fmtPct(calc.ekRendite)} p.a. profitiert vom Leverage-Effekt.`
          : `Der DSCR von ${calc.dscr.toFixed(1).replace(".",",")}x liegt unter dem banküblichen Minimum von 1,3x. Empfehlung: Eigenkapitalanteil erhöhen oder Kreditlaufzeit verlängern, um die Kapitaldienstfähigkeit zu verbessern.`}
      </div>
    </div>
  </div>`;
}

function cashflowPage(proj, hasFinancing) {
  const cols = [0, 1, 2, 3, 5, 7, 10, 15, 20];
  const colLabel = (y) => y === 0 ? "Start" : y + ". J.";
  return `<div class="page">${hdr}
    <h2>20-Jahres Cashflow-Projektion</h2>
    <p class="info-text" style="margin-bottom:3mm;">Annahmen: PV-Degradation 0,5 %/a · Strompreis +2 %/a · Gaspreis +2,5 %/a · Wartung 1,5 % (Standort) / 0,8 % (BESS) p.a.</p>
    <table style="font-size:7pt;">
      <thead><tr><th style="min-width:80px;">Position</th>${cols.map(c => `<th class="num" style="min-width:50px;">${colLabel(c)}</th>`).join("")}</tr></thead>
      <tbody>
        <tr><td class="bold">Investition</td>${cols.map(c => `<td class="num">${proj[c].inv !== 0 ? fmtE(proj[c].inv) : "—"}</td>`).join("")}</tr>
        <tr class="sub-row"><td>Stromersparnis</td>${cols.map(c => `<td class="num">${c === 0 ? "—" : fmtE(proj[c].strom)}</td>`).join("")}</tr>
        <tr class="sub-row"><td>Einspeiseerlöse</td>${cols.map(c => `<td class="num">${c === 0 ? "—" : fmtE(proj[c].einsp)}</td>`).join("")}</tr>
        <tr class="sub-row"><td>Peak Shaving</td>${cols.map(c => `<td class="num">${c === 0 ? "—" : fmtE(proj[c].peak)}</td>`).join("")}</tr>
        <tr class="sub-row"><td>Gasersparnis</td>${cols.map(c => `<td class="num">${c === 0 ? "—" : fmtE(proj[c].gas)}</td>`).join("")}</tr>
        <tr class="sub-row"><td>Mobilitätseinsparung</td>${cols.map(c => `<td class="num">${c === 0 ? "—" : fmtE(proj[c].mob)}</td>`).join("")}</tr>
        <tr><td class="bold">BESS-Erlöse</td>${cols.map(c => `<td class="num bold gold">${c === 0 ? "—" : fmtE(proj[c].bess)}</td>`).join("")}</tr>
        <tr><td>./. Wartung</td>${cols.map(c => `<td class="num red">${c === 0 ? "—" : "–" + fmtE(proj[c].wart)}</td>`).join("")}</tr>
        <tr class="total-row"><td>Cashflow (brutto)</td>${cols.map(c => `<td class="num">${fmtE(proj[c].cf)}</td>`).join("")}</tr>
        <tr style="background:#f0f0ef;"><td class="bold">Kumuliert</td>${cols.map(c => `<td class="num bold" style="color:${proj[c].cum >= 0 ? GR : RED}">${fmtE(proj[c].cum)}</td>`).join("")}</tr>
        ${hasFinancing ? `<tr><td>./. Schuldendienst</td>${cols.map(c => `<td class="num red">${c === 0 ? "—" : proj[c].debt > 0 ? "–" + fmtE(proj[c].debt) : "—"}</td>`).join("")}</tr>
        <tr style="background:#f8f5ee;"><td class="bold gold">CF nach Finanzierung</td>${cols.map(c => `<td class="num bold" style="color:${proj[c].cfFin >= 0 ? GR : RED}">${fmtE(proj[c].cfFin)}</td>`).join("")}</tr>
        <tr style="background:#f8f5ee;"><td class="bold">Kumuliert (EK)</td>${cols.map(c => `<td class="num bold" style="color:${proj[c].cumFin >= 0 ? G : RED}">${fmtE(proj[c].cumFin)}</td>`).join("")}</tr>` : ""}
      </tbody>
    </table>
    <div style="margin-top:5mm;">${cashflowSvg(proj, hasFinancing)}</div>
    <div style="margin-top:4mm;">${revenueSvg(proj)}</div>
    <div class="section-divider"></div>
    <div class="info-text" style="font-style:italic;">
      Alle Cashflows vor Ertragsteuer. Abschreibungseffekte (Sonder-AfA PV, lineare AfA Gebäudetechnik) reduzieren die effektive Steuerlast erheblich — nicht separat ausgewiesen.
      ${hasFinancing ? " Kreditfinanzierung: Zinsen als Betriebsausgabe steuerlich absetzbar." : ""}
    </div>
  </div>`;
}

function savingsPage(phases, calc, cfgActive) {
  const fin = phases[6];
  return `<div class="page">${hdr}
    <h2>Wirtschaftlichkeitsberechnung</h2>
    <h3>Investitionsaufstellung je Phase</h3>
    ${phases.slice(0, 6).map((p) => `<div style="margin-bottom:3mm;">
      <div style="font-size:8.5pt;font-weight:bold;color:${N};margin-bottom:1mm;">Phase ${p.num} — ${p.title} <span style="color:#999;font-weight:normal;font-size:7.5pt;">(${p.months})</span></div>
      <table style="margin-left:4mm;width:calc(100% - 4mm);"><tbody>
        ${p.investment.map(inv => `<tr><td>${inv.label}</td><td class="num" style="width:110px;">${inv.range}</td></tr>`).join("")}
        <tr class="total-row"><td>Summe Phase ${p.num}</td><td class="num">${p.investTotal}</td></tr>
      </tbody></table>
    </div>`).join("")}
    <div style="margin-top:4mm;padding:4mm 6mm;background:linear-gradient(135deg,${N},#0F1D35);color:white;border-radius:3mm;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4mm;">
      <div><div style="font-size:6pt;letter-spacing:2px;opacity:0.6;font-weight:600;">GESAMTINVESTITION</div><div style="font-family:Georgia,serif;font-size:14pt;font-weight:bold;">${cfgActive ? fmtM(calc.investGesamt) : fin.investTotal}</div></div>
      <div style="text-align:center;"><div style="font-size:6pt;letter-spacing:2px;opacity:0.6;font-weight:600;">DAVON BESS</div><div style="font-family:Georgia,serif;font-size:14pt;font-weight:bold;color:${G};">${cfgActive ? fmtM(calc.investPhase6) : "35–48 Mio €"}</div></div>
      <div style="text-align:right;"><div style="font-size:6pt;letter-spacing:2px;opacity:0.6;font-weight:600;">AMORTISATION</div><div style="font-family:Georgia,serif;font-size:14pt;font-weight:bold;color:${G};">${cfgActive ? calc.amortisationStandort + " J." : "6–9 J."}</div></div>
    </div>
    <div class="accent-box" style="margin-top:4mm;border-left-color:${GR};background:linear-gradient(135deg,#f5faf8,#f0f5f2);">
      <div class="info-text" style="color:#555;font-style:italic;">
        ${fin.economicSummary.conclusion}
      </div>
    </div>
  </div>`;
}

function regulatorikPage(phases) {
  const fin = phases[6];
  if (!fin.regulatorik) return "";
  return `<div class="page">${hdr}
    <h2>Regulatorik & Compliance</h2>
    <p class="info-text" style="margin-bottom:4mm;">Konzernanforderungen, die durch das Energietransformations-Konzept vollständig adressiert werden.</p>
    <table>
      <thead><tr><th style="width:30px;"></th><th>Anforderung</th><th style="width:45%;">Beschreibung</th><th>Status</th></tr></thead>
      <tbody>
        ${fin.regulatorik.map(r => `<tr>
          <td style="text-align:center;">${iconSvg(r.icon, 15, N)}</td>
          <td class="bold">${r.title}</td>
          <td style="font-size:8pt;color:#666;">${r.desc}</td>
          <td><span style="background:${GR};color:white;padding:1mm 2.5mm;border-radius:1.5mm;font-size:6.5pt;font-weight:bold;white-space:nowrap;letter-spacing:0.3px;">${iconSvg("check", 10, "white")} ${r.status}</span></td>
        </tr>`).join("")}
      </tbody>
    </table>
    ${fin.riskManagement ? `<h3 style="margin-top:6mm;">Risikomanagement</h3>
    <table>
      <thead><tr><th style="width:30px;"></th><th>Risiko</th><th style="width:45%;">Beschreibung</th><th>Wirkung</th></tr></thead>
      <tbody>
        ${fin.riskManagement.map(r => `<tr>
          <td style="text-align:center;">${iconSvg(r.icon, 15, N)}</td>
          <td class="bold">${r.title}</td>
          <td style="font-size:8pt;color:#666;">${r.desc}</td>
          <td class="bold gold" style="white-space:nowrap;">${r.impact}</td>
        </tr>`).join("")}
      </tbody>
    </table>` : ""}
  </div>`;
}

function foerdermittelPage(phases) {
  return `<div class="page">${hdr}
    <h2>Fördermittel & Finanzierungshebel</h2>
    <p class="info-text" style="margin-bottom:4mm;">Übersicht aller relevanten Förderprogramme und Finanzierungsoptionen je Projektphase.</p>
    <table>
      <thead><tr><th>Phase</th><th>Förderprogramm</th><th>Art / Konditionen</th></tr></thead>
      <tbody>
        ${phases.slice(0, 6).map(p => {
          if (!p.funding || p.funding.length === 0) return "";
          return p.funding.map((f, fi) => `<tr>
            ${fi === 0 ? `<td rowspan="${p.funding.length}" class="bold" style="vertical-align:top;border-right:1px solid #e5e5e5;">${p.num} — ${p.title}</td>` : ""}
            <td>${f.label}</td>
            <td class="bold">${f.value}</td>
          </tr>`).join("");
        }).join("")}
      </tbody>
    </table>
    <div class="accent-box" style="margin-top:5mm;border-left-color:${G};background:linear-gradient(135deg,#f8f8f4,#f5f5f0);">
      <div class="info-text" style="color:#666;">
        <b>Hinweis:</b> Förderbedingungen unterliegen laufenden Änderungen. Aktuelle Konditionen werden im Rahmen der Detailplanung (Phase I) geprüft und beantragt. Alle genannten Programme basieren auf dem Stand ${today}.
      </div>
    </div>
  </div>`;
}

function risikoPage(phases) {
  const fin = phases[6];
  if (!fin.riskManagement) return "";
  return `<div class="page">${hdr}
    <h2>Risikomanagement — Strategische Absicherung</h2>
    ${fin.riskManagement.map(r => `<div style="margin-bottom:4mm;padding:4mm 5mm;border:1px solid #e5e5e0;border-radius:2.5mm;border-left:3px solid ${N};background:linear-gradient(135deg,#fafafa,#f8f8f6);">
      <div style="display:flex;align-items:center;gap:3mm;margin-bottom:2mm;">
        <span>${iconSvg(r.icon, 20, N)}</span>
        <div><div class="bold" style="font-size:10pt;color:${N};">${r.title}</div></div>
        <div style="margin-left:auto;background:linear-gradient(135deg,${G},${G}dd);color:white;padding:1.5mm 4mm;border-radius:2mm;font-size:7.5pt;font-weight:bold;letter-spacing:0.3px;">${r.impact}</div>
      </div>
      <p class="info-text" style="color:#666;">${r.desc}</p>
    </div>`).join("")}
  </div>`;
}

function konfigurationPage(config, calc) {
  const fmtDec = (v, d) => v.toFixed(d).replace(".", ",");
  return `<div class="page">${hdr}
    <h2>Individuelle Kalkulation</h2>
    <p class="info-text" style="margin-bottom:4mm;">Basierend auf den individuell konfigurierten Parametern. Alle Werte sind Punktschätzungen.</p>
    <h3>Eingabeparameter</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:4mm;">
      <table><thead><tr><th colspan="2">Standort & Verbrauch</th></tr></thead><tbody>
        <tr><td>Jahresstromverbrauch</td><td class="num bold">${fmt(config.stromverbrauch)} MWh/a</td></tr>
        <tr><td>Jahresgasverbrauch</td><td class="num bold">${fmt(config.gasverbrauch)} MWh/a</td></tr>
        <tr><td>Strompreis netto</td><td class="num bold">${fmtDec(config.strompreis, 1)} ct/kWh</td></tr>
        <tr><td>Gaspreis netto</td><td class="num bold">${fmtDec(config.gaspreis, 1)} ct/kWh</td></tr>
      </tbody></table>
      <table><thead><tr><th colspan="2">PV & Speicher</th></tr></thead><tbody>
        <tr><td>PV Dach</td><td class="num bold">${fmtDec(config.pvDach, 1)} MWp</td></tr>
        <tr><td>PV Fassade</td><td class="num bold">${fmtDec(config.pvFassade, 1)} MWp</td></tr>
        <tr><td>PV Carport</td><td class="num bold">${fmtDec(config.pvCarport, 1)} MWp</td></tr>
        <tr><td>Standort-BESS</td><td class="num bold">${fmtDec(config.standortBESS, 1)} MWh</td></tr>
        <tr><td>Graustrom-BESS</td><td class="num bold">${fmt(config.graustromBESS)} MWh</td></tr>
      </tbody></table>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3mm;margin-bottom:4mm;">
      <table><thead><tr><th colspan="2">Wärme</th></tr></thead><tbody>
        <tr><td>WP-Leistung</td><td class="num bold">${fmtDec(config.wpLeistung, 1)} MW</td></tr>
        <tr><td>Pufferspeicher</td><td class="num bold">${fmt(config.pufferspeicher)} m³</td></tr>
      </tbody></table>
      <table><thead><tr><th colspan="2">Mobilität</th></tr></thead><tbody>
        <tr><td>PKW Ladepunkte</td><td class="num bold">${config.anzahlPKW}</td></tr>
        <tr><td>LKW Ladepunkte</td><td class="num bold">${config.anzahlLKW}</td></tr>
        <tr><td>Ø km/a PKW</td><td class="num bold">${fmt(config.kmPKW)} km</td></tr>
        <tr><td>Ø km/a LKW</td><td class="num bold">${fmt(config.kmLKW)} km</td></tr>
      </tbody></table>
      <table><thead><tr><th colspan="2">Finanzierung</th></tr></thead><tbody>
        <tr><td>Eigenkapital</td><td class="num bold">${config.ekAnteil} %</td></tr>
        <tr><td>Kreditzins</td><td class="num bold">${fmtDec(config.kreditZins, 1)} %</td></tr>
        <tr><td>Laufzeit</td><td class="num bold">${config.kreditLaufzeit} J.</td></tr>
        <tr><td>Tilgungsfrei</td><td class="num bold">${config.tilgungsfrei} J.</td></tr>
      </tbody></table>
    </div>
    <h3>Berechnete Ergebnisse</h3>
    <div class="kpi-grid">
      <div class="kpi-box"><div class="kpi-label">Gesamt-PV</div><div class="kpi-val">${calc.totalPV.toFixed(1).replace(".",",")} MWp</div></div>
      <div class="kpi-box"><div class="kpi-label">PV-Erzeugung</div><div class="kpi-val">${fmt(calc.pvErzeugung)} MWh</div></div>
      <div class="kpi-box"><div class="kpi-label">Eigenverbrauch</div><div class="kpi-val">${calc.eigenverbrauchsquote} %</div></div>
      <div class="kpi-box" style="border-left-color:${GR};"><div class="kpi-val green">${calc.autarkie} %</div><div class="kpi-label">Autarkie</div></div>
    </div>
    <table>
      <thead><tr><th>Position</th><th class="num">Invest</th><th class="num">Einsparung/a</th></tr></thead>
      <tbody>
        <tr><td>Phase I — Analyse</td><td class="num">${fmtE(calc.investPhase1)}</td><td class="num">—</td></tr>
        <tr><td>Phase II — PV</td><td class="num">${fmtM(calc.investPhase2)}</td><td class="num green">${fmtE(calc.stromEinsparung)}</td></tr>
        <tr><td>Phase III — Speicher</td><td class="num">${fmtM(calc.investPhase3)}</td><td class="num green">${fmtE(calc.peakShavingSavings)}</td></tr>
        <tr><td>Phase IV — Wärme</td><td class="num">${fmtM(calc.investPhase4)}</td><td class="num green">${fmtE(calc.gasEinsparung)}</td></tr>
        <tr><td>Phase V — Laden</td><td class="num">${fmtM(calc.investPhase5)}</td><td class="num green">${fmtE(calc.mobilitaetEinsparung)}</td></tr>
        <tr class="total-row"><td>Standort (I–V)</td><td class="num">${fmtM(calc.investStandort)}</td><td class="num green">${fmtM(calc.einsparungStandort)}/a</td></tr>
        <tr><td>Phase VI — BESS</td><td class="num">${fmtM(calc.investPhase6)}</td><td class="num gold">${fmtM(calc.bessErloes)}/a</td></tr>
        <tr class="total-row"><td>Gesamt</td><td class="num bold">${fmtM(calc.investGesamt)}</td><td class="num bold green">${fmtM(calc.gesamtertrag)}/a</td></tr>
      </tbody>
    </table>
    <div style="margin-top:4mm;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:3mm;">
      <div class="kpi-box" style="border-left-color:${GR};"><div class="kpi-label">Amortisation</div><div class="kpi-val green">${calc.amortisationStandort} J.</div></div>
      <div class="kpi-box"><div class="kpi-label">BESS-Rendite</div><div class="kpi-val gold">${calc.bessRendite} %</div></div>
      <div class="kpi-box" style="border-left-color:${GR};"><div class="kpi-label">CO₂-Reduktion</div><div class="kpi-val green">${fmt(calc.co2Gesamt)} t/a</div></div>
      <div class="kpi-box"><div class="kpi-label">EK-Rendite</div><div class="kpi-val gold">${fmtPct(calc.ekRendite)}</div></div>
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════════ */
/*  MAIN GENERATOR                                      */
/* ════════════════════════════════════════════════════ */

function generatePdf(phases, config, calc, sel, cfgActive) {
  const { rows: proj, debtSchedule } = project20Years(calc, config);
  const hasFinancing = cfgActive && config.ekAnteil < 100;
  let body = "";
  if (sel.cover) body += coverPage(phases, calc, cfgActive, config);
  if (sel.overview) body += overviewPage(phases, calc, cfgActive);
  if (sel.phases) body += phasesPage(phases);
  if (sel.roadmap) body += roadmapPage(phases, calc, cfgActive);
  if (sel.finanzierung) body += finanzierungPage(calc, config, cfgActive, debtSchedule);
  if (sel.cashflow) body += cashflowPage(proj, hasFinancing);
  if (sel.savings) body += savingsPage(phases, calc, cfgActive);
  if (sel.regulatorik) body += regulatorikPage(phases);
  if (sel.foerdermittel) body += foerdermittelPage(phases);
  if (sel.risiko) body += risikoPage(phases);
  if (sel.konfiguration && cfgActive) body += konfigurationPage(config, calc);

  return `<!DOCTYPE html><html lang="de"><head>
    <meta charset="UTF-8">
    <title>ECKART Werke — Energietransformation</title>
    <style>${css}</style>
  </head><body>${body}</body></html>`;
}

/* ════════════════════════════════════════════════════ */
/*  EXPORT MODAL                                        */
/* ════════════════════════════════════════════════════ */

const MC = {
  navy: "#1B2A4A", gold: "#D4A843", goldLight: "#E8C97A",
  green: "#2D6A4F", greenLight: "#3A8A66", midGray: "#9A9A90", white: "#FFFFFF",
};

export default function ExportModal({ phases, config, calc, configActive, onClose }) {
  const [sel, setSel] = useState(
    Object.fromEntries(SECTIONS.map(s => [s.key, s.def]))
  );

  const toggle = (key) => {
    const sec = SECTIONS.find(s => s.key === key);
    if (sec?.locked) return;
    setSel(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const doExport = () => {
    const html = generatePdf(phases, config, calc, sel, configActive);
    const win = window.open("", "_blank");
    if (!win) { alert("Bitte Pop-ups erlauben für den PDF-Export."); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
    onClose();
  };

  const pSections = SECTIONS.filter(s => s.group === "p");
  const wSections = SECTIONS.filter(s => s.group === "w");

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        zIndex: 2000, ...anim("cpFadeIn 0.3s ease"),
      }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(560px, 92vw)", maxHeight: "85vh",
        background: `linear-gradient(180deg, ${MC.navy}, #1E3050)`,
        borderRadius: "14px", border: `1px solid ${MC.gold}40`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        zIndex: 2001, display: "flex", flexDirection: "column",
        ...anim("cpFadeIn 0.3s ease"),
      }}>
        {/* Header */}
        <div style={{
          padding: "1.2rem 1.5rem 1rem", flexShrink: 0,
          borderBottom: `1px solid ${MC.gold}25`,
        }}>
          <div style={{
            fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
            letterSpacing: "3px", color: MC.gold, fontWeight: 700,
          }}>PDF EXPORT</div>
          <div style={{
            fontFamily: "Georgia, serif", fontSize: "1.15rem",
            fontWeight: 700, color: MC.white, marginTop: "0.15rem",
          }}>Kalkulationsauszug erstellen</div>
          <div style={{
            fontFamily: "Calibri, sans-serif", fontSize: "0.78rem",
            color: MC.midGray, marginTop: "0.2rem",
          }}>Wählen Sie die Inhalte für Ihr PDF-Dokument</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Präsentation */}
            <div>
              <div style={{
                fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
                letterSpacing: "2px", color: MC.gold, fontWeight: 700,
                marginBottom: "0.5rem",
              }}>PRÄSENTATION</div>
              {pSections.map(s => (
                <label key={s.key} style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.35rem 0", cursor: s.locked ? "default" : "pointer",
                  opacity: s.locked ? 0.6 : 1,
                }}>
                  <input
                    type="checkbox" checked={sel[s.key]}
                    onChange={() => toggle(s.key)}
                    disabled={s.locked}
                    style={{ accentColor: MC.gold, width: "14px", height: "14px" }}
                  />
                  <span style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.82rem",
                    color: MC.white,
                  }}>{s.label}</span>
                </label>
              ))}
            </div>

            {/* Wirtschaftlichkeit */}
            <div>
              <div style={{
                fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
                letterSpacing: "2px", color: MC.gold, fontWeight: 700,
                marginBottom: "0.5rem",
              }}>WIRTSCHAFTLICHKEIT</div>
              {wSections.map(s => {
                const disabled = s.key === "konfiguration" && !configActive;
                return (
                  <label key={s.key} style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.35rem 0", cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.35 : 1,
                  }}>
                    <input
                      type="checkbox"
                      checked={disabled ? false : sel[s.key]}
                      onChange={() => !disabled && toggle(s.key)}
                      disabled={disabled}
                      style={{ accentColor: MC.gold, width: "14px", height: "14px" }}
                    />
                    <span style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.82rem",
                      color: MC.white,
                    }}>
                      {s.label}
                      {s.key === "konfiguration" && !configActive && (
                        <span style={{ fontSize: "0.65rem", color: MC.midGray, marginLeft: "0.3rem" }}>(Kalkulator öffnen)</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div style={{
          padding: "1rem 1.5rem", flexShrink: 0,
          borderTop: `1px solid ${MC.gold}20`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "6px", padding: "0.45rem 1rem",
            fontFamily: "Calibri, sans-serif", fontSize: "0.82rem",
            color: MC.midGray, cursor: "pointer",
          }}>Abbrechen</button>
          <button onClick={doExport} style={{
            background: `linear-gradient(135deg, ${MC.gold}, ${MC.goldLight})`,
            border: "none", borderRadius: "6px", padding: "0.5rem 1.4rem",
            fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
            fontWeight: 700, color: MC.navy, cursor: "pointer",
            boxShadow: `0 2px 12px ${MC.gold}30`,
            display: "flex", alignItems: "center", gap: "0.4rem",
          }}>
            PDF erstellen
          </button>
        </div>
      </div>
    </>
  );
}
