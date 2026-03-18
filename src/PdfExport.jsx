import { useState } from "react";

const anim = (v) => ({ animation: v, WebkitAnimation: v });

/* ── Colors ── */
const N = "#1B2A4A";
const G = "#D4A843";
const GR = "#2D6A4F";

/* ── Formatting ── */
const fmt = (n) => isFinite(n) ? Math.round(n).toLocaleString("de-DE") : "—";
const fmtE = (n) => fmt(n) + " €";
const fmtM = (n) => {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(".", ",") + " Mio €";
  if (Math.abs(n) >= 1e3) return Math.round(n / 1e3) + " T€";
  return fmt(n) + " €";
};
const today = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });

/* ── Export Sections ── */
const SECTIONS = [
  { key: "cover", label: "Deckblatt", group: "p", def: true, locked: true },
  { key: "overview", label: "Auf einen Blick (Key Facts)", group: "p", def: true },
  { key: "phases", label: "Phasenübersicht (I–VI)", group: "p", def: true },
  { key: "roadmap", label: "Investitions-Roadmap", group: "w", def: true },
  { key: "cashflow", label: "20-Jahres Cashflow-Projektion", group: "w", def: true },
  { key: "savings", label: "Jährliche Einsparungen & Erlöse", group: "w", def: true },
  { key: "regulatorik", label: "Regulatorik & Compliance", group: "w", def: true },
  { key: "foerdermittel", label: "Fördermittel je Phase", group: "w", def: true },
  { key: "risiko", label: "Risikomanagement", group: "w", def: false },
  { key: "konfiguration", label: "Individuelle Kalkulation", group: "w", def: false },
];

/* ── 20-Year Projection ── */
function project20Years(calc) {
  const rows = [];
  let cumCf = 0;
  for (let y = 0; y <= 20; y++) {
    if (y === 0) {
      cumCf = -(calc.investGesamt);
      rows.push({ y, inv: -calc.investGesamt, strom: 0, einsp: 0, peak: 0, gas: 0, mob: 0, bess: 0, wart: 0, cf: -calc.investGesamt, cum: cumCf });
      continue;
    }
    const pvF = Math.pow(0.995, y); // 0.5%/a degradation
    const pF = Math.pow(1.02, y);   // 2%/a price escalation
    const strom = calc.stromEinsparung * pvF * pF;
    const einsp = calc.einspeiseErloese * pvF;
    const peak = calc.peakShavingSavings * pF;
    const gas = calc.gasEinsparung * Math.pow(1.025, y); // gas +2.5%
    const mob = calc.mobilitaetEinsparung * pF;
    const bess = calc.bessErloes * Math.pow(1.01, y); // slight growth
    const wart = calc.investStandort * 0.015 + calc.investPhase6 * 0.008;
    const cf = strom + einsp + peak + gas + mob + bess - wart;
    cumCf += cf;
    rows.push({ y, inv: 0, strom: r(strom), einsp: r(einsp), peak: r(peak), gas: r(gas), mob: r(mob), bess: r(bess), wart: r(wart), cf: r(cf), cum: r(cumCf) });
  }
  return rows;
}
function r(n) { return Math.round(n); }

/* ── SVG Chart: Cumulative Cashflow ── */
function cashflowSvg(proj) {
  const w = 520, h = 200, pad = { t: 15, r: 15, b: 30, l: 65 };
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
  const vals = proj.map(p => p.cum);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const x = (i) => pad.l + (i / 20) * pw;
  const yy = (v) => pad.t + ph - ((v - minV) / range) * ph;
  const pts = proj.map((p, i) => `${x(i).toFixed(1)},${yy(p.cum).toFixed(1)}`).join(" ");
  // Zero line
  const zeroY = yy(0);
  // Y-axis ticks
  const yTicks = [];
  const step = niceStep(range, 5);
  for (let v = Math.ceil(minV / step) * step; v <= maxV; v += step) {
    yTicks.push(v);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="width:100%;max-width:520px;height:auto;">
    <rect width="${w}" height="${h}" fill="#fafafa" rx="4"/>
    ${yTicks.map(v => `<line x1="${pad.l}" x2="${w - pad.r}" y1="${yy(v).toFixed(1)}" y2="${yy(v).toFixed(1)}" stroke="#e0e0e0" stroke-width="0.5"/>
    <text x="${pad.l - 5}" y="${yy(v).toFixed(1)}" text-anchor="end" font-size="7" fill="#777" dominant-baseline="middle">${fmtM(v)}</text>`).join("")}
    ${minV < 0 && maxV > 0 ? `<line x1="${pad.l}" x2="${w - pad.r}" y1="${zeroY.toFixed(1)}" y2="${zeroY.toFixed(1)}" stroke="#999" stroke-width="0.8" stroke-dasharray="3,2"/>` : ""}
    <polyline points="${pts}" fill="none" stroke="${N}" stroke-width="2"/>
    ${proj.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${yy(p.cum).toFixed(1)}" r="3" fill="${p.cum >= 0 ? GR : '#c0392b'}" stroke="white" stroke-width="1"/>`).join("")}
    ${[0, 5, 10, 15, 20].map(i => `<text x="${x(i).toFixed(1)}" y="${h - 8}" text-anchor="middle" font-size="7" fill="#777">${proj[i].y === 0 ? "Start" : proj[i].y + ". J."}</text>`).join("")}
    <text x="${w / 2}" y="${h - 0}" text-anchor="middle" font-size="7" fill="#999">Kumulierter Cashflow (Kapitalkonto vor Steuer)</text>
  </svg>`;
}
function niceStep(range, ticks) {
  const raw = range / ticks;
  if (!isFinite(raw) || raw <= 0) return 1; // prevent infinite loop
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  if (!isFinite(mag) || mag <= 0) return 1;
  const norm = raw / mag;
  if (norm <= 1.5) return mag;
  if (norm <= 3) return 2 * mag;
  if (norm <= 7) return 5 * mag;
  return 10 * mag;
}

/* ── Bar chart: Annual Revenue ── */
function revenueSvg(proj) {
  const w = 520, h = 160, pad = { t: 10, r: 15, b: 28, l: 65 };
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
  const vals = proj.slice(1).map(p => p.cf);
  const maxV = Math.max(...vals, 1);
  const barW = pw / 20 * 0.7;
  const gap = pw / 20 * 0.3;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="width:100%;max-width:520px;height:auto;">
    <rect width="${w}" height="${h}" fill="#fafafa" rx="4"/>
    ${proj.slice(1).map((p, i) => {
      const bh = (p.cf / maxV) * ph;
      const bx = pad.l + i * (pw / 20) + gap / 2;
      const by = pad.t + ph - bh;
      return `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" fill="${GR}" rx="1" opacity="0.8"/>`;
    }).join("")}
    ${[1, 5, 10, 15, 20].map(i => `<text x="${(pad.l + (i - 1) * (pw / 20) + (pw / 20) / 2).toFixed(1)}" y="${h - 8}" text-anchor="middle" font-size="7" fill="#777">${i}. J.</text>`).join("")}
    <text x="${w / 2}" y="${h - 0}" text-anchor="middle" font-size="7" fill="#999">Jährlicher Cashflow (Erlöse - Kosten)</text>
  </svg>`;
}

/* ── Page Header (not on cover) ── */
const hdr = `<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid ${N};padding-bottom:4mm;margin-bottom:5mm;">
  <div><div style="font-size:7pt;letter-spacing:2px;color:${G};font-weight:bold;">ECKART WERKE · ENERGIETRANSFORMATION</div>
  <div style="font-size:9pt;color:#555;">Güntersthal 4, 91235 Hartenstein</div></div>
  <div style="text-align:right;"><div style="font-size:7pt;color:#999;">Erstellt durch</div>
  <div style="font-size:8pt;font-weight:bold;">Elite PV GmbH · Levin Schober</div></div></div>`;

/* ── CSS ── */
const css = `
@page { size: A4 portrait; margin: 12mm 14mm 15mm 14mm; }
@media print { .no-print { display: none !important; } }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, sans-serif; color: #2B2B2B; font-size: 9pt; line-height: 1.45; }
.page { page-break-after: always; min-height: 100vh; }
.page:last-child { page-break-after: auto; }
h2 { font-size: 13pt; color: ${N}; margin-bottom: 3mm; }
h3 { font-size: 10pt; color: ${N}; margin: 4mm 0 2mm; letter-spacing: 1px; text-transform: uppercase; }
table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
th { background: ${N}; color: white; padding: 2.5mm 3mm; text-align: left; font-size: 7.5pt; letter-spacing: 0.5px; text-transform: uppercase; }
td { padding: 2mm 3mm; border-bottom: 0.5px solid #e5e5e5; }
tr:nth-child(even) td { background: #f8f8f8; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.bold { font-weight: bold; }
.green { color: ${GR}; }
.gold { color: ${G}; }
.navy { color: ${N}; }
.right { text-align: right; }
.pill { display: inline-block; background: #f0f0f0; border: 1px solid #ddd; border-radius: 3mm; padding: 1mm 3mm; margin: 1mm 1mm 1mm 0; font-size: 7.5pt; }
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 3mm; margin-bottom: 4mm; }
.kpi-box { background: #f5f5f5; border-left: 2px solid ${G}; padding: 2.5mm 3mm; border-radius: 0 2mm 2mm 0; }
.kpi-label { font-size: 6.5pt; color: #888; letter-spacing: 0.5px; text-transform: uppercase; }
.kpi-val { font-size: 11pt; font-weight: bold; color: ${N}; }
.hero { border: 1.5px solid; border-radius: 3mm; padding: 5mm 6mm; }
.hero-val { font-size: 20pt; font-weight: bold; line-height: 1.1; }
.total-row td { border-top: 1.5px solid ${N}; font-weight: bold; background: #f0f0ef !important; }
.sub-row td { padding-left: 6mm; font-size: 8pt; color: #555; }
.phase-card { border: 1px solid #ddd; border-radius: 2mm; padding: 3mm 4mm; break-inside: avoid; margin-bottom: 3mm; }
.phase-title { font-size: 10pt; font-weight: bold; color: ${N}; margin-bottom: 1mm; }
.phase-quote { font-style: italic; color: ${G}; font-size: 8.5pt; margin-bottom: 2mm; }
`;

/* ════════════════════════════════════════════════════ */
/*  PAGE GENERATORS                                     */
/* ════════════════════════════════════════════════════ */

function coverPage(phases) {
  return `<div class="page" style="display:flex;flex-direction:column;height:100vh;padding:0;">
    <div style="background:${N};color:white;padding:35mm 20mm 25mm;flex:0 0 auto;">
      <div style="font-size:8pt;letter-spacing:4px;color:${G};font-weight:bold;margin-bottom:3mm;">ECKART WERKE · ALTANA AG</div>
      <div style="width:35mm;height:0.5mm;background:${G};margin-bottom:8mm;"></div>
      <div style="font-family:Georgia,serif;font-size:26pt;font-weight:bold;line-height:1.15;margin-bottom:4mm;">Energietransformation<br>Phasenkonzept</div>
      <div style="font-size:10pt;color:rgba(255,255,255,0.7);">50 Hektar Industriestandort · 6 Phasen · Integriertes Energiesystem</div>
    </div>
    <div style="flex:1;padding:12mm 20mm;display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4mm;margin-bottom:8mm;">
          ${phases.slice(0, 6).map((p, i) => `<div style="border:1px solid #ddd;border-radius:3mm;padding:4mm 5mm;border-top:2px solid ${N};">
            <div style="font-size:14pt;margin-bottom:1mm;">${p.icon}</div>
            <div style="font-size:7pt;letter-spacing:1.5px;color:${G};font-weight:bold;">PHASE ${p.num}</div>
            <div style="font-size:9.5pt;font-weight:bold;color:${N};">${p.title}</div>
            <div style="font-size:7.5pt;color:#888;margin-top:1mm;">${p.investTotal}</div>
          </div>`).join("")}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5mm;padding:5mm 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">
          <div><div style="font-size:7pt;color:#888;">GESAMTINVESTITION</div><div style="font-size:13pt;font-weight:bold;color:${N};">43–70 Mio €</div></div>
          <div><div style="font-size:7pt;color:#888;">JÄHRL. EINSPARUNG</div><div style="font-size:13pt;font-weight:bold;color:${GR};">1,4–2,5 Mio €</div></div>
          <div><div style="font-size:7pt;color:#888;">CO₂-REDUKTION</div><div style="font-size:13pt;font-weight:bold;color:${GR};">~4.800 t/a</div></div>
          <div><div style="font-size:7pt;color:#888;">AUTARKIE-ZIEL</div><div style="font-size:13pt;font-weight:bold;color:${G};">~95 %</div></div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid ${N};padding-top:4mm;">
        <div><div style="font-size:7pt;color:#888;letter-spacing:1px;">ERSTELLT DURCH</div>
          <div style="font-weight:bold;">Elite PV GmbH</div><div style="font-size:8pt;color:#555;">Levin Schober · levinschober@elite-pv.de</div></div>
        <div style="text-align:center;"><div style="font-size:7pt;color:#888;letter-spacing:1px;">ERSTELLT FÜR</div>
          <div style="font-weight:bold;">ECKART GmbH</div><div style="font-size:8pt;color:#555;">Güntersthal 4, 91235 Hartenstein</div></div>
        <div style="text-align:right;"><div style="font-size:7pt;color:#888;letter-spacing:1px;">DATUM</div>
          <div style="font-weight:bold;">${today}</div><div style="font-size:8pt;color:#555;">Vertraulich</div></div>
      </div>
    </div>
  </div>`;
}

function overviewPage(phases, calc, cfgActive) {
  const fin = phases[6]; // Gesamtergebnis
  return `<div class="page">${hdr}
    <h2>Auf einen Blick</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-bottom:5mm;">
      <div class="hero" style="border-color:${GR};">
        <div style="font-size:7pt;letter-spacing:2px;color:${GR};font-weight:bold;margin-bottom:2mm;">CO₂-EINSPARUNG PRO JAHR</div>
        <div class="hero-val green">${cfgActive ? "~" + fmt(calc.co2Gesamt) + " t" : "~4.800 t"}</div>
        <div style="font-size:8pt;color:#888;margin:2mm 0 3mm;">CO₂ weniger pro Jahr${cfgActive ? " · " + fmtM(calc.co2Kosten) + "/a vermiedene CO₂-Kosten" : ""}</div>
        <table style="font-size:8pt;"><tr><td>Strom (PV statt Netz)</td><td class="num bold green">${cfgActive ? "–" + fmt(calc.co2Strom) + " t" : "–2.100 t"}</td></tr>
        <tr><td>Wärme (WP statt Gas)</td><td class="num bold green">${cfgActive ? "–" + fmt(calc.co2Waerme) + " t" : "–2.400 t"}</td></tr>
        <tr><td>Mobilität (E statt Diesel)</td><td class="num bold green">${cfgActive ? "–" + fmt(calc.co2PKW + calc.co2LKW) + " t" : "–300 t"}</td></tr></table>
      </div>
      <div class="hero" style="border-color:${G};">
        <div style="font-size:7pt;letter-spacing:2px;color:${G};font-weight:bold;margin-bottom:2mm;">JÄHRLICHER GESAMTERTRAG</div>
        <div class="hero-val gold">${cfgActive ? fmtM(calc.gesamtertrag) : "6,4–14,5 Mio €"}</div>
        <div style="font-size:8pt;color:#888;margin:2mm 0 3mm;">Einsparung + Erlöse pro Jahr</div>
        <table style="font-size:8pt;"><tr><td>Standort-Einsparungen (I–V)</td><td class="num bold gold">${cfgActive ? fmtM(calc.einsparungStandort) + "/a" : "1,4–2,5 Mio €/a"}</td></tr>
        <tr><td>Graustrom-BESS Erlöse (VI)</td><td class="num bold gold">${cfgActive ? fmtM(calc.bessErloes) + "/a" : "5,0–12,0 Mio €/a"}</td></tr></table>
      </div>
    </div>
    <h3>Systemkennzahlen im Vollausbau</h3>
    <div class="kpi-grid" style="grid-template-columns:1fr 1fr 1fr;">
      ${fin.systemKpis.map(k => `<div class="kpi-box"><div class="kpi-label">${k.label}</div><div class="kpi-val">${k.value}</div><div style="font-size:7pt;color:#888;">${k.sub}</div></div>`).join("")}
    </div>
    <h3>Sechs Hebel · Ein integriertes Energiesystem</h3>
    <table><thead><tr><th style="width:30px;"></th><th>Hebel</th><th>Wirkung</th></tr></thead><tbody>
      ${fin.levers.map(l => `<tr><td style="font-size:12pt;text-align:center;">${l.icon}</td><td class="bold">${l.title}</td><td>${l.desc}</td></tr>`).join("")}
    </tbody></table>
    ${cfgActive ? `<div style="margin-top:4mm;padding:3mm 4mm;background:#f5f5f0;border-left:2px solid ${G};border-radius:0 2mm 2mm 0;">
      <div style="font-size:7pt;letter-spacing:1.5px;color:${G};font-weight:bold;">IHRE BERECHNUNG</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:3mm;margin-top:2mm;font-size:8.5pt;">
        <div><span style="color:#888;">Investition:</span> <b>${fmtM(calc.investGesamt)}</b></div>
        <div><span style="color:#888;">Einsparung:</span> <b class="green">${fmtM(calc.einsparungStandort)}/a</b></div>
        <div><span style="color:#888;">Amortisation:</span> <b>${calc.amortisationStandort} J.</b></div>
        <div><span style="color:#888;">Autarkie:</span> <b class="gold">${calc.autarkie} %</b></div>
      </div></div>` : ""}
  </div>`;
}

function phasesPage(phases) {
  return `<div class="page">${hdr}
    <h2>Phasenübersicht</h2>
    ${phases.slice(0, 6).map((p, i) => `<div class="phase-card">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <div class="phase-title">${p.icon} Phase ${p.num} — ${p.title}</div>
        <div style="font-size:8pt;color:#888;">${p.months}</div>
      </div>
      <div class="phase-quote">„${p.headline}"</div>
      <div style="display:grid;grid-template-columns:${p.kpis.length >= 4 ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr"};gap:2mm;margin-bottom:2mm;">
        ${p.kpis.map(k => `<div style="background:#f8f8f8;padding:1.5mm 2.5mm;border-radius:1.5mm;"><div style="font-size:6pt;color:#999;text-transform:uppercase;">${k.label}</div><div style="font-size:9pt;font-weight:bold;color:${N};">${k.value}</div></div>`).join("")}
      </div>
      <div style="display:flex;gap:6mm;font-size:8pt;">
        <div><span style="color:#888;">Investment:</span> <b>${p.investTotal}</b></div>
        <div><span style="color:#888;">Rendite:</span> <b class="green">${p.roiValue}</b></div>
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
          <td style="font-size:8pt;color:#888;">${phases.slice(0, 6).find(p => p.num === item.phase)?.months || "—"}</td>
          <td class="num bold">${item.range}</td>
          <td class="num green">${item.roi}</td>
          <td class="num gold">${item.score} %</td>
        </tr>`).join("")}
        <tr class="total-row"><td colspan="3">Gesamtinvestition</td><td class="num">${fin.investTotal}</td><td class="num green">1,4–2,5 Mio €/a + BESS</td><td class="num gold">95 %</td></tr>
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
          { l: "Einspeiseerlöse", v: fmtE(calc.einspeiseErloese) },
          { l: "Peak Shaving & Spotmarkt-Optimierung", v: fmtE(calc.peakShavingSavings) },
          { l: "Gaskosten-Reduktion", v: fmtE(calc.gasEinsparung) },
          { l: "Mobilitäts-Einsparung", v: fmtE(calc.mobilitaetEinsparung) },
        ] : fin.economicSummary.savings.map(s => ({ l: s.label, v: s.value }))).map(s =>
          `<tr><td>${s.l}</td><td class="num bold green">${s.v}</td></tr>`
        ).join("")}
        <tr class="total-row"><td>Gesamt jährliche Einsparung</td><td class="num bold">${cfgActive ? fmtM(calc.einsparungStandort) + "/a" : fin.economicSummary.totals.annualSavings}</td></tr>
        <tr><td class="bold">Zusätzlich: BESS-Erlöse (Phase VI)</td><td class="num bold gold">${cfgActive ? fmtM(calc.bessErloes) + "/a" : fin.economicSummary.totals.bessRevenue}</td></tr>
      </tbody>
    </table>
  </div>`;
}

function cashflowPage(proj) {
  const cols = [0, 1, 2, 3, 5, 7, 10, 15, 20];
  const colLabel = (y) => y === 0 ? "Start" : y + ". Jahr";
  return `<div class="page">${hdr}
    <h2>20-Jahres Cashflow-Projektion</h2>
    <p style="font-size:8pt;color:#888;margin-bottom:3mm;">Annahmen: PV-Degradation 0,5 %/a · Strompreis-Eskalation 2 %/a · Gaspreis +2,5 %/a · Wartung 1,5 % (Standort) / 0,8 % (BESS) von Invest p.a.</p>
    <table style="font-size:7.5pt;">
      <thead><tr><th>Position</th>${cols.map(c => `<th class="num" style="min-width:55px;">${colLabel(c)}</th>`).join("")}</tr></thead>
      <tbody>
        <tr><td class="bold">Investition</td>${cols.map(c => `<td class="num">${proj[c].inv !== 0 ? fmtE(proj[c].inv) : "—"}</td>`).join("")}</tr>
        <tr class="sub-row"><td>Stromersparnis</td>${cols.map(c => `<td class="num">${c === 0 ? "—" : fmtE(proj[c].strom)}</td>`).join("")}</tr>
        <tr class="sub-row"><td>Einspeiseerlöse</td>${cols.map(c => `<td class="num">${c === 0 ? "—" : fmtE(proj[c].einsp)}</td>`).join("")}</tr>
        <tr class="sub-row"><td>Peak Shaving</td>${cols.map(c => `<td class="num">${c === 0 ? "—" : fmtE(proj[c].peak)}</td>`).join("")}</tr>
        <tr class="sub-row"><td>Gasersparnis</td>${cols.map(c => `<td class="num">${c === 0 ? "—" : fmtE(proj[c].gas)}</td>`).join("")}</tr>
        <tr class="sub-row"><td>Mobilitätseinsparung</td>${cols.map(c => `<td class="num">${c === 0 ? "—" : fmtE(proj[c].mob)}</td>`).join("")}</tr>
        <tr><td class="bold">BESS-Erlöse</td>${cols.map(c => `<td class="num bold gold">${c === 0 ? "—" : fmtE(proj[c].bess)}</td>`).join("")}</tr>
        <tr><td>./. Wartung & Betrieb</td>${cols.map(c => `<td class="num" style="color:#c0392b;">${c === 0 ? "—" : "–" + fmtE(proj[c].wart)}</td>`).join("")}</tr>
        <tr class="total-row"><td>Jährlicher Cashflow</td>${cols.map(c => `<td class="num">${fmtE(proj[c].cf)}</td>`).join("")}</tr>
        <tr style="background:#f0f0ef;"><td class="bold">Kumuliert</td>${cols.map(c => `<td class="num bold" style="color:${proj[c].cum >= 0 ? GR : "#c0392b"}">${fmtE(proj[c].cum)}</td>`).join("")}</tr>
      </tbody>
    </table>
    <div style="margin-top:5mm;">${cashflowSvg(proj)}</div>
    <div style="margin-top:4mm;">${revenueSvg(proj)}</div>
  </div>`;
}

function savingsPage(phases, calc, cfgActive) {
  const fin = phases[6];
  return `<div class="page">${hdr}
    <h2>Wirtschaftlichkeitsberechnung</h2>
    <h3>Investitionsaufstellung je Phase</h3>
    ${phases.slice(0, 6).map((p, i) => `<div style="margin-bottom:3mm;">
      <div style="font-size:8.5pt;font-weight:bold;color:${N};margin-bottom:1mm;">Phase ${p.num} — ${p.title} <span style="color:#888;font-weight:normal;">(${p.months})</span></div>
      <table style="margin-left:4mm;width:calc(100% - 4mm);"><tbody>
        ${p.investment.map(inv => `<tr><td>${inv.label}</td><td class="num" style="width:100px;">${inv.range}</td></tr>`).join("")}
        <tr class="total-row"><td>Summe Phase ${p.num}</td><td class="num">${p.investTotal}</td></tr>
      </tbody></table>
    </div>`).join("")}
    <div style="margin-top:4mm;padding:3mm 5mm;background:${N};color:white;border-radius:2mm;display:flex;justify-content:space-between;">
      <div><div style="font-size:7pt;letter-spacing:1.5px;opacity:0.7;">GESAMTINVESTITION</div><div style="font-size:14pt;font-weight:bold;">${cfgActive ? fmtM(calc.investGesamt) : fin.investTotal}</div></div>
      <div style="text-align:center;"><div style="font-size:7pt;letter-spacing:1.5px;opacity:0.7;">DAVON BESS</div><div style="font-size:14pt;font-weight:bold;color:${G};">${cfgActive ? fmtM(calc.investPhase6) : "35–48 Mio €"}</div></div>
      <div style="text-align:right;"><div style="font-size:7pt;letter-spacing:1.5px;opacity:0.7;">AMORTISATION</div><div style="font-size:14pt;font-weight:bold;color:${G};">${cfgActive ? calc.amortisationStandort + " J." : "6–9 J."}</div></div>
    </div>
    <p style="margin-top:4mm;font-size:8.5pt;color:#555;font-style:italic;border-left:2px solid ${GR};padding-left:3mm;">
      ${fin.economicSummary.conclusion}
    </p>
  </div>`;
}

function regulatorikPage(phases) {
  const fin = phases[6];
  if (!fin.regulatorik) return "";
  return `<div class="page">${hdr}
    <h2>Regulatorik & Compliance</h2>
    <p style="font-size:8.5pt;color:#555;margin-bottom:4mm;">Konzernanforderungen, die durch das Energietransformations-Konzept vollständig adressiert werden.</p>
    <table>
      <thead><tr><th style="width:30px;"></th><th>Anforderung</th><th style="width:45%;">Beschreibung</th><th>Status</th></tr></thead>
      <tbody>
        ${fin.regulatorik.map(r => `<tr>
          <td style="font-size:12pt;text-align:center;">${r.icon}</td>
          <td class="bold">${r.title}</td>
          <td style="font-size:8pt;color:#555;">${r.desc}</td>
          <td><span style="background:${GR};color:white;padding:1mm 2.5mm;border-radius:1.5mm;font-size:7pt;font-weight:bold;white-space:nowrap;">✓ ${r.status}</span></td>
        </tr>`).join("")}
      </tbody>
    </table>
    ${fin.riskManagement ? `<h3 style="margin-top:6mm;">Risikomanagement</h3>
    <table>
      <thead><tr><th style="width:30px;"></th><th>Risiko</th><th style="width:45%;">Beschreibung</th><th>Wirkung</th></tr></thead>
      <tbody>
        ${fin.riskManagement.map(r => `<tr>
          <td style="font-size:12pt;text-align:center;">${r.icon}</td>
          <td class="bold">${r.title}</td>
          <td style="font-size:8pt;color:#555;">${r.desc}</td>
          <td class="bold gold" style="white-space:nowrap;">${r.impact}</td>
        </tr>`).join("")}
      </tbody>
    </table>` : ""}
  </div>`;
}

function foerdermittelPage(phases) {
  return `<div class="page">${hdr}
    <h2>Fördermittel & Finanzierungshebel</h2>
    <p style="font-size:8.5pt;color:#555;margin-bottom:4mm;">Übersicht aller relevanten Förderprogramme und Finanzierungsoptionen je Projektphase.</p>
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
    <div style="margin-top:5mm;padding:3mm 4mm;background:#f5f5f0;border-radius:2mm;font-size:8pt;color:#555;">
      <b>Hinweis:</b> Förderbedingungen unterliegen laufenden Änderungen. Aktuelle Konditionen werden im Rahmen der Detailplanung (Phase I) geprüft und beantragt. Alle genannten Programme basieren auf dem Stand ${today}.
    </div>
  </div>`;
}

function risikoPage(phases) {
  const fin = phases[6];
  if (!fin.riskManagement) return "";
  return `<div class="page">${hdr}
    <h2>Risikomanagement — Strategische Absicherung</h2>
    ${fin.riskManagement.map(r => `<div style="margin-bottom:4mm;padding:4mm 5mm;border:1px solid #e5e5e5;border-radius:2mm;border-left:3px solid ${N};">
      <div style="display:flex;align-items:center;gap:3mm;margin-bottom:2mm;">
        <span style="font-size:16pt;">${r.icon}</span>
        <div><div class="bold" style="font-size:10pt;color:${N};">${r.title}</div></div>
        <div style="margin-left:auto;background:${G};color:white;padding:1.5mm 4mm;border-radius:2mm;font-size:8pt;font-weight:bold;">${r.impact}</div>
      </div>
      <p style="font-size:8.5pt;color:#555;">${r.desc}</p>
    </div>`).join("")}
  </div>`;
}

function konfigurationPage(config, calc) {
  return `<div class="page">${hdr}
    <h2>Individuelle Kalkulation</h2>
    <p style="font-size:8.5pt;color:#555;margin-bottom:4mm;">Basierend auf den vom Kunden eingegebenen Parametern. Alle Werte sind Punktschätzungen, keine Bandbreiten.</p>
    <h3>Eingabeparameter</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:5mm;">
      <table><thead><tr><th colspan="2">Standort & Verbrauch</th></tr></thead><tbody>
        <tr><td>Jahresstromverbrauch</td><td class="num bold">${fmt(config.stromverbrauch)} MWh/a</td></tr>
        <tr><td>Jahresgasverbrauch</td><td class="num bold">${fmt(config.gasverbrauch)} MWh/a</td></tr>
        <tr><td>Strompreis netto</td><td class="num bold">${config.strompreis.toFixed(1).replace(".",",")} ct/kWh</td></tr>
        <tr><td>Gaspreis netto</td><td class="num bold">${config.gaspreis.toFixed(1).replace(".",",")} ct/kWh</td></tr>
      </tbody></table>
      <table><thead><tr><th colspan="2">PV & Speicher</th></tr></thead><tbody>
        <tr><td>PV Dach</td><td class="num bold">${config.pvDach.toFixed(1).replace(".",",")} MWp</td></tr>
        <tr><td>PV Fassade</td><td class="num bold">${config.pvFassade.toFixed(1).replace(".",",")} MWp</td></tr>
        <tr><td>PV Carport</td><td class="num bold">${config.pvCarport.toFixed(1).replace(".",",")} MWp</td></tr>
        <tr><td>Standort-BESS</td><td class="num bold">${config.standortBESS.toFixed(1).replace(".",",")} MWh</td></tr>
        <tr><td>Graustrom-BESS</td><td class="num bold">${fmt(config.graustromBESS)} MWh</td></tr>
      </tbody></table>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:5mm;">
      <table><thead><tr><th colspan="2">Wärme</th></tr></thead><tbody>
        <tr><td>WP-Leistung</td><td class="num bold">${config.wpLeistung.toFixed(1).replace(".",",")} MW</td></tr>
        <tr><td>Pufferspeicher</td><td class="num bold">${fmt(config.pufferspeicher)} m³</td></tr>
      </tbody></table>
      <table><thead><tr><th colspan="2">Mobilität</th></tr></thead><tbody>
        <tr><td>PKW Ladepunkte</td><td class="num bold">${config.anzahlPKW}</td></tr>
        <tr><td>LKW Ladepunkte</td><td class="num bold">${config.anzahlLKW}</td></tr>
        <tr><td>Ø km/a PKW</td><td class="num bold">${fmt(config.kmPKW)} km</td></tr>
        <tr><td>Ø km/a LKW</td><td class="num bold">${fmt(config.kmLKW)} km</td></tr>
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
    <div style="margin-top:4mm;display:grid;grid-template-columns:1fr 1fr 1fr;gap:3mm;">
      <div class="kpi-box" style="border-left-color:${GR};"><div class="kpi-label">Amortisation Standort</div><div class="kpi-val green">${calc.amortisationStandort} Jahre</div></div>
      <div class="kpi-box"><div class="kpi-label">BESS-Rendite</div><div class="kpi-val gold">${calc.bessRendite} % p.a.</div></div>
      <div class="kpi-box" style="border-left-color:${GR};"><div class="kpi-label">CO₂-Reduktion</div><div class="kpi-val green">${fmt(calc.co2Gesamt)} t/a</div></div>
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════════ */
/*  MAIN GENERATOR                                      */
/* ════════════════════════════════════════════════════ */

function generatePdf(phases, config, calc, sel, cfgActive) {
  const proj = project20Years(calc);
  let body = "";
  if (sel.cover) body += coverPage(phases);
  if (sel.overview) body += overviewPage(phases, calc, cfgActive);
  if (sel.phases) body += phasesPage(phases);
  if (sel.roadmap) body += roadmapPage(phases, calc, cfgActive);
  if (sel.cashflow) body += cashflowPage(proj);
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
            📄 PDF erstellen
          </button>
        </div>
      </div>
    </>
  );
}
