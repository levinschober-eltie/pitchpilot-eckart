import { defaultCalcConfig } from "./siteConfig";

/* ── Default Configuration ── */
export const defaultConfig = defaultCalcConfig;

/* ── Formatting ── */
export function fmtEuro(n) {
  if (!isFinite(n)) return "0 €";
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1).replace(".", ",")} Mio €`;
  if (Math.abs(n) >= 1e3) return `${Math.round(n / 1e3)} T€`;
  return `${Math.round(n).toLocaleString("de-DE")} €`;
}

export function fmtVal(v, dec = 0) {
  if (typeof v === "number" && !isFinite(v)) return "0";
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
    ekAnteil, kreditZins, kreditLaufzeit, tilgungsfrei,
  } = cfg;

  /* ── PV ── */
  const totalPV = pvDach + pvFassade + pvCarport + pvBestand;
  const pvErzeugung = totalPV * 950; // MWh/a (specific yield Bavaria)

  /* ── Self-consumption ── */
  const baseRatio = pvErzeugung > 0 ? Math.max(0, Math.min(0.55, (stromverbrauch / pvErzeugung) * 0.55)) : 0;
  const bessBoost = standortBESS > 0 && pvErzeugung > 0
    ? Math.max(0, Math.min(0.25, (standortBESS / pvErzeugung) * 3)) : 0;
  const eigenverbrauchsquote = Math.max(0, Math.min(0.93, baseRatio + bessBoost));
  const eigenverbrauch = pvErzeugung * eigenverbrauchsquote;
  const einspeisung = pvErzeugung - eigenverbrauch;
  const restbezug = Math.max(0, stromverbrauch - eigenverbrauch);

  /* ── Strom savings ── */
  const stromEinsparung = eigenverbrauch * strompreis * 10; // €/a (MWh × ct/kWh × 10)
  const einspeiseErloese = einspeisung * 70; // €/a (7 ct/kWh)

  /* ── Peak Shaving ── */
  const peakShavingRate = standortBESS > 0 && stromverbrauch > 0
    ? Math.max(0, Math.min(0.15, (standortBESS / stromverbrauch) * 8)) : 0;
  const peakShavingSavings = stromverbrauch * strompreis * 10 * peakShavingRate * 0.12;

  /* ── Wärme ── */
  const wpErzeugung = wpLeistung * 2200; // MWh therm /a
  const gasErsatzRate = gasverbrauch > 0 ? Math.max(0, Math.min(0.85, wpErzeugung / gasverbrauch)) : 0;
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
  const investPhase4 = wpLeistung > 0
    ? wpLeistung * 400000 + 1000000 + pufferspeicher * 600 + 800000
    : 0;
  const hasVehicles = anzahlPKW > 0 || anzahlLKW > 0;
  const investPhase5 = hasVehicles
    ? anzahlPKW * 2500
      + (anzahlPKW > 0 ? 5 * 75000 : 0)
      + (anzahlLKW > 0 ? Math.max(1, Math.ceil(anzahlLKW * 0.5)) * 200000 : 0)
      + 350000 + 40000
    : 0;
  const investPhase6 = graustromBESS > 0
    ? graustromBESS * 175000 + 6500000
    : 0;
  const investStandort = investPhase1 + investPhase2 + investPhase3 + investPhase4 + investPhase5;
  const investGesamt = investStandort + investPhase6;

  /* ── Zusammenfassung ── */
  const einsparungStandort = stromEinsparung + einspeiseErloese + peakShavingSavings + gasEinsparung + mobilitaetEinsparung;
  const amortisationStandort = einsparungStandort > 0 ? investStandort / einsparungStandort : 99;
  const bessRenditeRaw = investPhase6 > 0 ? (bessErloes / investPhase6) * 100 : 0;
  const bessRendite = isFinite(bessRenditeRaw) ? bessRenditeRaw : 0;
  const gesamtertrag = einsparungStandort + bessErloes;
  const autarkieRaw = stromverbrauch > 0
    ? Math.min(95, Math.round(Math.max(0, Math.min(1, eigenverbrauch / stromverbrauch)) * 60 + gasErsatzRate * 30 + 5))
    : 0;
  const autarkie = isFinite(autarkieRaw) ? autarkieRaw : 0;

  /* ── Finanzierung / Kredit ── */
  const ekBetrag = investGesamt * (ekAnteil / 100);
  const kreditBetrag = investGesamt - ekBetrag;
  const zinsRate = kreditZins / 100;
  const tilgungsJahre = Math.max(1, kreditLaufzeit - tilgungsfrei);
  const zinsTilgungsfrei = kreditBetrag * zinsRate; // annual interest during grace period
  const annuitaetRaw = tilgungsJahre > 0 && zinsRate > 0
    ? kreditBetrag * (zinsRate * Math.pow(1 + zinsRate, tilgungsJahre)) / (Math.pow(1 + zinsRate, tilgungsJahre) - 1)
    : tilgungsJahre > 0 ? kreditBetrag / tilgungsJahre : 0;
  const annuitaet = isFinite(annuitaetRaw) ? annuitaetRaw : 0;
  // Total debt service over life
  const totalSchuldendienst = zinsTilgungsfrei * tilgungsfrei + annuitaet * tilgungsJahre;
  const totalZinskosten = totalSchuldendienst - kreditBetrag;
  // Leveraged equity return (annual cashflow after debt service / equity)
  const cfNachSchuldendienst = gesamtertrag - annuitaet;
  const ekRenditeRaw = ekBetrag > 0 ? (cfNachSchuldendienst / ekBetrag) * 100 : 0;
  const ekRendite = isFinite(ekRenditeRaw) ? ekRenditeRaw : 0;
  // DSCR (Debt Service Coverage Ratio)
  const dscrRaw = annuitaet > 0 ? gesamtertrag / annuitaet : 99;
  const dscr = isFinite(dscrRaw) ? dscrRaw : 99;

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
    // Finanzierung
    ekBetrag: Math.round(ekBetrag),
    kreditBetrag: Math.round(kreditBetrag),
    zinsTilgungsfrei: Math.round(zinsTilgungsfrei),
    annuitaet: Math.round(annuitaet),
    totalZinskosten: Math.round(totalZinskosten),
    cfNachSchuldendienst: Math.round(cfNachSchuldendienst),
    ekRendite: Math.round(ekRendite * 10) / 10,
    dscr: Math.round(dscr * 100) / 100,
    tilgungsJahre,
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
      icon: "leaf", accent: "#2D6A4F",
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
      icon: "money", accent: "#D4A843",
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
