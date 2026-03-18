import { useState, useRef, useCallback } from "react";

/* ── Colors (matches EckartTimeline) ── */
const C = {
  navy: "#1B2A4A", navyLight: "#253757", navyMid: "#1E3050",
  green: "#2D6A4F", greenLight: "#3A8A66",
  gold: "#D4A843", goldLight: "#E8C97A",
  midGray: "#9A9A90", white: "#FFFFFF",
};

/* ── Default Configuration ── */
export const defaultConfig = {
  stromverbrauch: 20000,  // MWh/a
  gasverbrauch: 10000,    // MWh/a
  strompreis: 22,         // ct/kWh
  gaspreis: 7,            // ct/kWh
  pvDach: 3.5,            // MWp
  pvFassade: 0.7,         // MWp
  pvCarport: 2.0,         // MWp
  pvBestand: 2.0,         // MWp (fixed)
  standortBESS: 8,        // MWh
  graustromBESS: 200,     // MWh
  wpLeistung: 7.5,        // MW
  pufferspeicher: 350,    // m³
  anzahlPKW: 60,
  anzahlLKW: 6,
  kmPKW: 15000,           // km/a
  kmLKW: 60000,           // km/a
  dieselpreis: 1.55,      // €/l
  lastgangFile: null,
  lastgangData: null,
  stromrechnungFile: null,
};

/* ── Formatting ── */
export function fmtEuro(n) {
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1).replace(".", ",")} Mio €`;
  if (Math.abs(n) >= 1e3) return `${Math.round(n / 1e3)} T€`;
  return `${Math.round(n).toLocaleString("de-DE")} €`;
}

function fmtVal(v, dec = 0) {
  return typeof v === "number"
    ? v.toLocaleString("de-DE", { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : v;
}

/* ── Calculation Engine ── */
export function calculateAll(cfg) {
  const {
    stromverbrauch, gasverbrauch, strompreis, gaspreis, dieselpreis,
    pvDach, pvFassade, pvCarport, pvBestand,
    standortBESS, graustromBESS,
    wpLeistung, pufferspeicher,
    anzahlPKW, anzahlLKW, kmPKW, kmLKW,
  } = cfg;

  /* ── PV ── */
  const totalPV = pvDach + pvFassade + pvCarport + pvBestand;
  const pvErzeugung = totalPV * 950; // MWh/a (specific yield Bavaria)

  /* ── Self-consumption ── */
  const baseRatio = pvErzeugung > 0 ? Math.min(0.55, (stromverbrauch / pvErzeugung) * 0.55) : 0;
  const bessBoost = standortBESS > 0 && pvErzeugung > 0
    ? Math.min(0.25, (standortBESS / pvErzeugung) * 3) : 0;
  const eigenverbrauchsquote = Math.min(0.93, baseRatio + bessBoost);
  const eigenverbrauch = pvErzeugung * eigenverbrauchsquote;
  const einspeisung = pvErzeugung - eigenverbrauch;
  const restbezug = Math.max(0, stromverbrauch - eigenverbrauch);

  /* ── Strom savings ── */
  const stromEinsparung = eigenverbrauch * strompreis * 10; // €/a (MWh × ct/kWh × 10)
  const einspeiseErloese = einspeisung * 70; // €/a (7 ct/kWh)

  /* ── Peak Shaving ── */
  const peakShavingRate = standortBESS > 0 && stromverbrauch > 0
    ? Math.min(0.15, (standortBESS / stromverbrauch) * 8) : 0;
  const peakShavingSavings = stromverbrauch * strompreis * 10 * peakShavingRate * 0.12;

  /* ── Wärme ── */
  const wpErzeugung = wpLeistung * 2200; // MWh therm /a
  const gasErsatzRate = gasverbrauch > 0 ? Math.min(0.85, wpErzeugung / gasverbrauch) : 0;
  const gasEinsparung = gasverbrauch * gasErsatzRate * gaspreis * 10;

  /* ── Mobilität PKW ── */
  const pkwDieselL = anzahlPKW * kmPKW * 0.07; // 7l/100km
  const pkwDieselKosten = pkwDieselL * dieselpreis;
  const pkwStromMWh = anzahlPKW * kmPKW * 0.0002; // 20kWh/100km
  const pkwStromKosten = pkwStromMWh * 40; // 4ct LCOE × 10
  const pkwEinsparung = Math.max(0, pkwDieselKosten - pkwStromKosten);

  /* ── Mobilität LKW ── */
  const lkwDieselL = anzahlLKW * kmLKW * 0.32; // 32l/100km
  const lkwDieselKosten = lkwDieselL * dieselpreis;
  const lkwStromMWh = anzahlLKW * kmLKW * 0.0012; // 120kWh/100km
  const lkwStromKosten = lkwStromMWh * 40;
  const lkwEinsparung = Math.max(0, lkwDieselKosten - lkwStromKosten);
  const mobilitaetEinsparung = pkwEinsparung + lkwEinsparung;

  /* ── Graustrom-BESS ── */
  const bessLeistung = graustromBESS / 2; // MW (2h system)
  const bessErloes = graustromBESS * 42500; // 42.5k€/MWh/a (calibrated: 200MWh→8.5M)

  /* ── CO₂ ── */
  const co2Strom = eigenverbrauch * 0.382; // t (German grid mix 382g/kWh)
  const co2Waerme = gasverbrauch * gasErsatzRate * 0.201; // t (gas 201g/kWh)
  const co2PKW = pkwDieselL * 2.65 / 1000; // t
  const co2LKW = lkwDieselL * 2.65 / 1000;
  const co2Gesamt = co2Strom + co2Waerme + co2PKW + co2LKW;
  const co2Kosten = co2Gesamt * 60; // €/a at ~60€/t

  /* ── Investitionen ── */
  const investPhase1 = 65000;
  const investPhase2 = pvDach * 650000 + pvFassade * 650000 + pvCarport * 1200000;
  const investPhase3 = standortBESS * 187000 + 185000;
  const investPhase4 = wpLeistung * 400000 + 1000000 + pufferspeicher * 600 + 800000;
  const investPhase5 = anzahlPKW * 2500 + 5 * 75000
    + Math.max(1, Math.ceil(anzahlLKW * 0.5)) * 200000 + 350000 + 40000;
  const investPhase6 = graustromBESS * 175000 + 6500000;
  const investStandort = investPhase1 + investPhase2 + investPhase3 + investPhase4 + investPhase5;
  const investGesamt = investStandort + investPhase6;

  /* ── Zusammenfassung ── */
  const einsparungStandort = stromEinsparung + einspeiseErloese + peakShavingSavings + gasEinsparung + mobilitaetEinsparung;
  const amortisationStandort = einsparungStandort > 0 ? investStandort / einsparungStandort : 99;
  const bessRendite = investPhase6 > 0 ? (bessErloes / investPhase6) * 100 : 0;
  const gesamtertrag = einsparungStandort + bessErloes;
  const autarkie = stromverbrauch > 0
    ? Math.min(95, Math.round((eigenverbrauch / stromverbrauch) * 60 + gasErsatzRate * 30 + 5))
    : 0;

  return {
    totalPV, pvErzeugung: Math.round(pvErzeugung),
    eigenverbrauchsquote: Math.round(eigenverbrauchsquote * 100),
    eigenverbrauch: Math.round(eigenverbrauch),
    einspeisung: Math.round(einspeisung),
    restbezug: Math.round(restbezug),
    stromEinsparung: Math.round(stromEinsparung),
    einspeiseErloese: Math.round(einspeiseErloese),
    peakShavingSavings: Math.round(peakShavingSavings),
    gasErsatzRate: Math.round(gasErsatzRate * 100),
    gasEinsparung: Math.round(gasEinsparung),
    pkwEinsparung: Math.round(pkwEinsparung),
    lkwEinsparung: Math.round(lkwEinsparung),
    mobilitaetEinsparung: Math.round(mobilitaetEinsparung),
    bessLeistung, bessErloes: Math.round(bessErloes),
    bessRendite: Math.round(bessRendite * 10) / 10,
    co2Strom: Math.round(co2Strom), co2Waerme: Math.round(co2Waerme),
    co2PKW: Math.round(co2PKW), co2LKW: Math.round(co2LKW),
    co2Gesamt: Math.round(co2Gesamt), co2Kosten: Math.round(co2Kosten),
    investPhase1, investPhase2, investPhase3, investPhase4, investPhase5, investPhase6,
    investStandort, investGesamt,
    einsparungStandort: Math.round(einsparungStandort),
    amortisationStandort: Math.round(amortisationStandort * 10) / 10,
    gesamtertrag: Math.round(gesamtertrag),
    autarkie,
  };
}

/* ── Phase-specific calculated items ── */
export function getPhaseCalcItems(phaseIdx, calc, config) {
  const items = {
    0: [
      { label: "Investition", value: fmtEuro(calc.investPhase1) },
    ],
    1: [
      { label: "Gesamt-PV (inkl. Bestand)", value: `${calc.totalPV.toFixed(1).replace(".", ",")} MWp`, accent: true },
      { label: "Jahreserzeugung", value: `${fmtVal(calc.pvErzeugung)} MWh/a` },
      { label: "Eigenverbrauch", value: `${calc.eigenverbrauchsquote} %` },
      { label: "Investition", value: fmtEuro(calc.investPhase2) },
      { label: "Stromersparnis", value: `${fmtEuro(calc.stromEinsparung)}/a`, accent: true },
    ],
    2: [
      { label: "BESS Kapazität", value: `${fmtVal(config.standortBESS, 1)} MWh` },
      { label: "Peak Shaving", value: `${fmtEuro(calc.peakShavingSavings)}/a`, accent: true },
      { label: "Investition", value: fmtEuro(calc.investPhase3) },
    ],
    3: [
      { label: "WP-Leistung", value: `${fmtVal(config.wpLeistung, 1)} MW` },
      { label: "Gasreduktion", value: `${calc.gasErsatzRate} %` },
      { label: "Gasersparnis", value: `${fmtEuro(calc.gasEinsparung)}/a`, accent: true },
      { label: "Investition", value: fmtEuro(calc.investPhase4) },
    ],
    4: [
      { label: "PKW Ladepunkte", value: config.anzahlPKW },
      { label: "LKW Ladepunkte", value: config.anzahlLKW },
      { label: "Mobilitäts-Einsparung", value: `${fmtEuro(calc.mobilitaetEinsparung)}/a`, accent: true },
      { label: "Investition", value: fmtEuro(calc.investPhase5) },
    ],
    5: [
      { label: "Leistung / Kapazität", value: `${fmtVal(calc.bessLeistung)} MW / ${fmtVal(config.graustromBESS)} MWh` },
      { label: "Jährliche Erlöse", value: `${fmtEuro(calc.bessErloes)}/a`, accent: true },
      { label: "Rendite", value: `${fmtVal(calc.bessRendite, 1)} % p.a.`, accent: true },
      { label: "Investition", value: fmtEuro(calc.investPhase6) },
    ],
  }[phaseIdx];
  return items || null;
}

/* ── Dynamic Hero Cards for Gesamtergebnis ── */
export function getDynamicHeroCards(calc) {
  return [
    {
      icon: "🌿", accent: "#2D6A4F",
      label: "CO₂-EINSPARUNG PRO JAHR",
      value: `~${fmtVal(calc.co2Gesamt)} t`,
      sub: `CO₂/Jahr weniger · ${fmtEuro(calc.co2Kosten)}/a vermiedene CO₂-Kosten`,
      details: [
        { label: "Strom (PV statt Netz)", value: `–${fmtVal(calc.co2Strom)} t` },
        { label: "Wärme (WP statt Gas)", value: `–${fmtVal(calc.co2Waerme)} t` },
        { label: "Mobilität (E statt Diesel)", value: `–${fmtVal(calc.co2PKW + calc.co2LKW)} t` },
        { label: "CO₂-Preis (~60 €/t)", value: `${fmtEuro(calc.co2Kosten)}/a` },
      ],
    },
    {
      icon: "💰", accent: "#D4A843",
      label: "JÄHRLICHER GESAMTERTRAG",
      value: fmtEuro(calc.gesamtertrag),
      sub: "Einsparung + Erlöse pro Jahr",
      details: [
        { label: "Standort-Einsparungen (I–V)", value: `${fmtEuro(calc.einsparungStandort)}/a` },
        { label: "Graustrom-BESS Erlöse (VI)", value: `${fmtEuro(calc.bessErloes)}/a` },
      ],
    },
  ];
}

/* ── Slider Group Definitions ── */
const GROUPS = [
  {
    key: "standort", title: "STANDORT & VERBRAUCH", icon: "🏭",
    sliders: [
      { key: "stromverbrauch", label: "Jahresstromverbrauch", unit: "MWh/a", min: 2000, max: 60000, step: 500 },
      { key: "gasverbrauch", label: "Jahresgasverbrauch", unit: "MWh/a", min: 0, max: 40000, step: 500 },
      { key: "strompreis", label: "Strompreis (netto)", unit: "ct/kWh", min: 8, max: 40, step: 0.5, dec: 1 },
      { key: "gaspreis", label: "Gaspreis (netto)", unit: "ct/kWh", min: 2, max: 18, step: 0.5, dec: 1 },
    ],
    hasUploads: true,
  },
  {
    key: "pv", title: "PV-AUSBAU", icon: "☀️",
    sliders: [
      { key: "pvDach", label: "PV Dach", unit: "MWp", min: 0, max: 6, step: 0.1, dec: 1 },
      { key: "pvFassade", label: "PV Fassade", unit: "MWp", min: 0, max: 2, step: 0.1, dec: 1 },
      { key: "pvCarport", label: "PV Carport", unit: "MWp", min: 0, max: 4, step: 0.1, dec: 1 },
    ],
    note: "Bestand Freifläche: 2,0 MWp (bereits installiert)",
  },
  {
    key: "speicher", title: "SPEICHER", icon: "🔋",
    sliders: [
      { key: "standortBESS", label: "Standort-BESS (Grünstrom)", unit: "MWh", min: 0, max: 20, step: 0.5, dec: 1 },
      { key: "graustromBESS", label: "Graustrom-BESS (Utility)", unit: "MWh", min: 0, max: 400, step: 10 },
    ],
  },
  {
    key: "waerme", title: "WÄRMEKONZEPT", icon: "🔥",
    sliders: [
      { key: "wpLeistung", label: "Wärmepumpen-Leistung", unit: "MW", min: 0, max: 15, step: 0.5, dec: 1 },
      { key: "pufferspeicher", label: "Pufferspeicher", unit: "m³", min: 0, max: 800, step: 50 },
    ],
  },
  {
    key: "mobilitaet", title: "MOBILITÄT", icon: "🚗",
    sliders: [
      { key: "anzahlPKW", label: "E-PKW Ladepunkte", unit: "Stk", min: 0, max: 200, step: 5 },
      { key: "anzahlLKW", label: "E-LKW Ladepunkte", unit: "Stk", min: 0, max: 30, step: 1 },
      { key: "kmPKW", label: "Ø Fahrleistung PKW", unit: "km/a", min: 5000, max: 40000, step: 1000 },
      { key: "kmLKW", label: "Ø Fahrleistung LKW", unit: "km/a", min: 10000, max: 120000, step: 5000 },
      { key: "dieselpreis", label: "Dieselpreis", unit: "€/l", min: 1.0, max: 2.5, step: 0.05, dec: 2 },
    ],
  },
];

/* ── CSV Parser ── */
function parseLastgangCSV(text) {
  try {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 10) return null;
    const sep = lines[0].includes(";") ? ";" : ",";
    const startIdx = /^[a-zA-Z"Datum]/.test(lines[0]) ? 1 : 0;
    let values = [];
    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(sep);
      for (let j = parts.length - 1; j >= 0; j--) {
        const val = parseFloat(parts[j].replace(",", ".").replace(/[^\d.\-]/g, ""));
        if (!isNaN(val) && val >= 0) { values.push(val); break; }
      }
    }
    if (values.length < 100) return null;
    const total = values.reduce((a, b) => a + b, 0);
    const peak = Math.max(...values.slice(0, 50000)); // limit for perf
    let annualMWh;
    if (values.length > 30000) {
      annualMWh = total * 0.25 / 1000; // 15-min kW intervals
    } else if (values.length > 7000) {
      annualMWh = total / 1000; // hourly kWh
    } else {
      annualMWh = total / 1000;
    }
    return { annualMWh: Math.round(annualMWh), peakKW: Math.round(peak), dataPoints: values.length };
  } catch { return null; }
}

/* ── ConfigPanel Component ── */
export default function ConfigPanel({ config, setConfig, calc, onClose }) {
  const [openGroups, setOpenGroups] = useState(
    Object.fromEntries(GROUPS.map(g => [g.key, true]))
  );
  const fileRef = useRef(null);
  const billRef = useRef(null);

  const update = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, [setConfig]);

  const toggleGroup = useCallback((key) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleLastgang = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseLastgangCSV(e.target.result);
      if (parsed) {
        setConfig(prev => ({
          ...prev, lastgangFile: file.name, lastgangData: parsed,
          stromverbrauch: parsed.annualMWh,
        }));
      } else {
        setConfig(prev => ({ ...prev, lastgangFile: file.name + " (Format nicht erkannt)" }));
      }
    };
    reader.readAsText(file);
  }, [setConfig]);

  const handleBill = useCallback((file) => {
    if (!file) return;
    setConfig(prev => ({ ...prev, stromrechnungFile: file.name }));
  }, [setConfig]);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 1000, animation: "cpFadeIn 0.3s ease",
      }} />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px, 92vw)",
        background: `linear-gradient(180deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
        borderLeft: `1px solid ${C.gold}30`,
        zIndex: 1001, display: "flex", flexDirection: "column",
        animation: "cpSlideIn 0.3s ease",
        boxShadow: `-8px 0 40px rgba(0,0,0,0.5)`,
      }}>
        {/* ── Header with live results ── */}
        <div style={{
          padding: "1rem 1.2rem", flexShrink: 0,
          borderBottom: `1px solid ${C.gold}25`,
          background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "0.75rem",
          }}>
            <div>
              <div style={{
                fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
                letterSpacing: "3px", color: C.gold, fontWeight: 700,
              }}>INTERAKTIVER KALKULATOR</div>
              <div style={{
                fontFamily: "Georgia, serif", fontSize: "1.05rem",
                fontWeight: 700, color: C.white, marginTop: "0.1rem",
              }}>Ihre Konfiguration</div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px", width: "32px", height: "32px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: C.midGray, fontSize: "1rem",
            }}>✕</button>
          </div>

          {/* Key results */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem" }}>
            {[
              { label: "Einsparung/a", value: `${fmtEuro(calc.einsparungStandort)}/a`, color: C.greenLight },
              { label: "CO₂-Reduktion", value: `${fmtVal(calc.co2Gesamt)} t/a`, color: C.greenLight },
              { label: "Amortisation", value: `${fmtVal(calc.amortisationStandort, 1)} J.`, color: C.goldLight },
              { label: "BESS-Rendite", value: `${fmtVal(calc.bessRendite, 1)} %`, color: C.goldLight },
              { label: "Gesamtinvest", value: fmtEuro(calc.investGesamt), color: C.white },
              { label: "Autarkie", value: `${calc.autarkie} %`, color: C.goldLight },
            ].map((r, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "0.35rem 0.5rem",
              }}>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                  letterSpacing: "1px", color: C.midGray, textTransform: "uppercase",
                }}>{r.label}</div>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.95rem",
                  fontWeight: 700, color: r.color,
                }}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrollable slider groups ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.2rem 2rem" }}>
          {GROUPS.map((group) => (
            <div key={group.key} style={{ marginBottom: "0.4rem" }}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.key)}
                style={{
                  width: "100%", background: "none", border: "none",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.5rem 0", cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span style={{ fontSize: "0.85rem" }}>{group.icon}</span>
                <span style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
                  letterSpacing: "2px", color: C.gold, fontWeight: 700,
                  flex: 1, textAlign: "left",
                }}>{group.title}</span>
                <span style={{
                  color: C.midGray, fontSize: "0.75rem",
                  transform: openGroups[group.key] ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}>▾</span>
              </button>

              {/* Sliders */}
              {openGroups[group.key] && (
                <div style={{ padding: "0.5rem 0" }}>
                  {group.sliders.map((s) => (
                    <div key={s.key} style={{ marginBottom: "0.5rem" }}>
                      <div style={{
                        display: "flex", justifyContent: "space-between", marginBottom: "0.15rem",
                      }}>
                        <span style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.78rem",
                          color: "rgba(255,255,255,0.65)",
                        }}>{s.label}</span>
                        <span style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.82rem",
                          fontWeight: 700, color: C.goldLight,
                        }}>{fmtVal(config[s.key], s.dec || 0)} {s.unit}</span>
                      </div>
                      <input
                        type="range"
                        min={s.min} max={s.max} step={s.step}
                        value={config[s.key]}
                        onChange={(e) => update(s.key, parseFloat(e.target.value))}
                        className="cp-slider"
                        style={{ width: "100%" }}
                      />
                    </div>
                  ))}

                  {group.note && (
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                      color: C.midGray, fontStyle: "italic", padding: "0.2rem 0",
                    }}>{group.note}</div>
                  )}

                  {/* File uploads for Standort group */}
                  {group.hasUploads && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.3rem" }}>
                      {/* Lastgang */}
                      <div
                        onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => { e.preventDefault(); handleLastgang(e.dataTransfer.files[0]); }}
                        style={{
                          border: `2px dashed ${config.lastgangFile ? C.green + "50" : "rgba(255,255,255,0.12)"}`,
                          borderRadius: "8px", padding: "0.55rem", textAlign: "center",
                          cursor: "pointer", background: config.lastgangFile ? `${C.green}08` : "transparent",
                          transition: "all 0.2s",
                        }}
                      >
                        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls"
                          style={{ display: "none" }}
                          onChange={(e) => handleLastgang(e.target.files[0])} />
                        <div style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.72rem",
                          color: config.lastgangFile ? C.greenLight : C.midGray,
                        }}>
                          {config.lastgangFile
                            ? `✓ ${config.lastgangFile}${config.lastgangData ? ` → ${fmtVal(config.lastgangData.annualMWh)} MWh/a` : ""}`
                            : "📊 Lastgang-CSV hochladen (15-Min-Intervall)"}
                        </div>
                      </div>

                      {/* Stromrechnung */}
                      <div
                        onClick={() => billRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => { e.preventDefault(); handleBill(e.dataTransfer.files[0]); }}
                        style={{
                          border: `2px dashed ${config.stromrechnungFile ? C.green + "50" : "rgba(255,255,255,0.12)"}`,
                          borderRadius: "8px", padding: "0.55rem", textAlign: "center",
                          cursor: "pointer", background: config.stromrechnungFile ? `${C.green}08` : "transparent",
                        }}
                      >
                        <input ref={billRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: "none" }}
                          onChange={(e) => handleBill(e.target.files[0])} />
                        <div style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.72rem",
                          color: config.stromrechnungFile ? C.greenLight : C.midGray,
                        }}>
                          {config.stromrechnungFile
                            ? `✓ ${config.stromrechnungFile}`
                            : "📄 Stromrechnung hochladen (PDF/Bild)"}
                        </div>
                      </div>

                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.62rem",
                        color: "rgba(255,255,255,0.3)", fontStyle: "italic",
                      }}>Alle Daten bleiben lokal in Ihrem Browser — kein Upload an Server</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Reset */}
          <button
            onClick={() => setConfig({ ...defaultConfig })}
            style={{
              width: "100%", marginTop: "0.5rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px", padding: "0.5rem",
              fontFamily: "Calibri, sans-serif", fontSize: "0.78rem",
              color: C.midGray, cursor: "pointer",
            }}
          >↺ Auf Standardwerte zurücksetzen</button>
        </div>

        {/* Slider styles */}
        <style>{`
          .cp-slider {
            -webkit-appearance: none;
            appearance: none;
            height: 5px;
            border-radius: 3px;
            background: rgba(255,255,255,0.08);
            outline: none;
            cursor: pointer;
          }
          .cp-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px; height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${C.gold}, ${C.goldLight});
            cursor: pointer;
            box-shadow: 0 0 8px rgba(212,168,67,0.3);
            border: 2px solid ${C.navy};
          }
          .cp-slider::-moz-range-thumb {
            width: 14px; height: 14px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${C.gold}, ${C.goldLight});
            cursor: pointer;
            border: 2px solid ${C.navy};
          }
          .cp-slider::-webkit-slider-runnable-track {
            height: 5px; border-radius: 3px;
          }
          @keyframes cpSlideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes cpFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}
