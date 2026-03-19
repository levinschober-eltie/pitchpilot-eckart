import { useState, useMemo, useCallback } from "react";
import { Icon } from "./Icons";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1 — CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */
const RAD = Math.PI / 180;
const C = {
  navy: "#1B2A4A", navyLight: "#253757", gold: "#D4A843", goldLight: "#E8C97A",
  green: "#2D6A4F", greenLight: "#3A8A66", white: "#F5F5F0", darkText: "#2B2B2B",
};
const F = "Calibri, sans-serif";
const MONTHS = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
const HARTENSTEIN = { lat: 49.63, lon: 11.52, tz: 1 }; // CET offset

const DIRECTIONS = [
  { label: "Süd",       az: 0 },
  { label: "Süd-Ost",   az: -45 },
  { label: "Ost",        az: -90 },
  { label: "Nord-Ost",  az: -135 },
  { label: "Nord",       az: 180 },
  { label: "Nord-West", az: 135 },
  { label: "West",       az: 90 },
  { label: "Süd-West",  az: 45 },
];

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2 — SOLAR ENGINE
   ═══════════════════════════════════════════════════════════════════════ */

// Cloud / clearness factors per month (calibrated for Oberfranken, ~980 kWh/kWp/a South 30°)
const CLOUD = [0.30, 0.36, 0.44, 0.48, 0.52, 0.54, 0.54, 0.52, 0.47, 0.38, 0.30, 0.26];

function sunPosition(dayOfYear, hour, lat, lon, tzOff) {
  const dayAngle = 2 * Math.PI * (dayOfYear - 1) / 365;
  const decl = (0.006918 - 0.399912*Math.cos(dayAngle) + 0.070257*Math.sin(dayAngle)
    - 0.006758*Math.cos(2*dayAngle) + 0.000907*Math.sin(2*dayAngle)
    - 0.002697*Math.cos(3*dayAngle) + 0.00148*Math.sin(3*dayAngle));
  const eot = 229.18 * (0.000075 + 0.001868*Math.cos(dayAngle) - 0.032077*Math.sin(dayAngle)
    - 0.014615*Math.cos(2*dayAngle) - 0.04089*Math.sin(2*dayAngle));
  const solarTime = hour + eot / 60 + (lon - tzOff * 15) / 15;
  const ha = (solarTime - 12) * 15 * RAD;
  const sinAlt = Math.sin(lat*RAD)*Math.sin(decl) + Math.cos(lat*RAD)*Math.cos(decl)*Math.cos(ha);
  const alt = Math.asin(sinAlt);
  if (alt <= 0.01) return { alt: 0, az: 0 };
  const cosAz = (sinAlt*Math.sin(lat*RAD) - Math.sin(decl)) / (Math.cos(alt)*Math.cos(lat*RAD));
  const sinAz = -Math.cos(decl)*Math.sin(ha) / Math.cos(alt);
  const az = Math.atan2(sinAz, Math.max(-1, Math.min(1, cosAz)));
  return { alt: alt / RAD, az: az / RAD }; // degrees, 0=South
}

function pvHour(dayOfYear, hour, lat, lon, tz, tiltDeg, azDeg) {
  const sun = sunPosition(dayOfYear, hour + 0.5, lat, lon, tz); // mid-hour
  if (sun.alt <= 1) return 0;
  const altR = sun.alt * RAD, tiltR = tiltDeg * RAD;
  const cosInc = Math.sin(altR)*Math.cos(tiltR) +
    Math.cos(altR)*Math.sin(tiltR)*Math.cos((sun.az - azDeg)*RAD);
  if (cosInc <= 0) return 0;
  const am = 1 / Math.sin(Math.max(sun.alt, 2) * RAD);
  const dni = 1367 * Math.pow(0.7, Math.pow(am, 0.678)); // W/m²
  const ghi = dni * Math.sin(altR);
  const beam = dni * cosInc;
  const diffuse = ghi * 0.22 * (1 + Math.cos(tiltR)) / 2;
  const reflected = ghi * 0.04 * (1 - Math.cos(tiltR)) / 2;
  return Math.max(0, (beam + diffuse + reflected) / 1000 * 0.85); // kW per kWp
}

function generateAnnualPV(arrays, lat, lon, tz) {
  const hourly = new Float64Array(8760);
  const monthly = new Float64Array(12);
  let idx = 0, doy = 1;
  for (let m = 0; m < 12; m++) {
    const cloud = CLOUD[m];
    for (let d = 0; d < DAYS_IN_MONTH[m]; d++) {
      for (let h = 0; h < 24; h++) {
        let total = 0;
        for (const arr of arrays) {
          total += pvHour(doy, h, lat, lon, tz, arr.tilt, arr.azimuth) * arr.kwp * cloud;
        }
        hourly[idx] = total;
        monthly[m] += total;
        idx++;
      }
      doy++;
    }
  }
  const total = monthly.reduce((s, v) => s + v, 0);
  return { hourly, monthly, total };
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3 — ELECTRICITY PRICE MODEL (EPEX SPOT Day-Ahead)
   ═══════════════════════════════════════════════════════════════════════ */

// Monthly average prices €/MWh (representative German 2024 level)
const PRICE_MONTHLY = [72, 55, 52, 38, 45, 58, 65, 72, 70, 78, 88, 80];

// Hourly shape multipliers [summer Apr-Sep, winter Oct-Mar]
const PRICE_SHAPE = {
  summer: [0.72,0.68,0.65,0.64,0.67,0.76,0.89,1.03,1.12,1.08,0.95,0.84,
           0.78,0.76,0.82,0.96,1.08,1.22,1.35,1.30,1.16,1.02,0.88,0.77],
  winter: [0.78,0.75,0.73,0.72,0.76,0.86,0.99,1.16,1.24,1.20,1.12,1.08,
           1.04,1.01,0.99,1.06,1.18,1.32,1.38,1.28,1.14,0.98,0.87,0.81],
};

function generateAnnualPrices(seed) {
  const hourly = new Float64Array(8760);
  let idx = 0, doy = 1;
  const rng = mulberry32(seed || 42);
  for (let m = 0; m < 12; m++) {
    const avg = PRICE_MONTHLY[m];
    const shape = (m >= 3 && m <= 8) ? PRICE_SHAPE.summer : PRICE_SHAPE.winter;
    for (let d = 0; d < DAYS_IN_MONTH[m]; d++) {
      const dayFactor = 0.85 + rng() * 0.30; // ±15% daily variation
      const isWeekend = ((doy - 1) % 7) >= 5;
      const weFactor = isWeekend ? 0.88 : 1.0;
      for (let h = 0; h < 24; h++) {
        const noise = 0.92 + rng() * 0.16; // ±8% hourly noise
        hourly[idx] = avg * shape[h] * dayFactor * weFactor * noise;
        idx++;
      }
      doy++;
    }
  }
  return hourly; // €/MWh
}

function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Try to fetch live prices from energy-charts.info (Fraunhofer ISE)
async function fetchLivePrices() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    const resp = await fetch(
      `https://api.energy-charts.info/price?bzn=DE-LU&start=${start}&end=${end}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!resp.ok) throw new Error("API error");
    const data = await resp.json();
    if (!data.price || data.price.length < 2000) throw new Error("Insufficient data");
    // energy-charts returns { unix_seconds: [...], price: [...] } in €/MWh
    const hourly = new Float64Array(8760);
    const len = Math.min(data.price.length, 8760);
    for (let i = 0; i < len; i++) hourly[i] = data.price[i] ?? 60;
    // Fill remaining with average if partial year
    if (len < 8760) {
      const avg = hourly.slice(0, len).reduce((s, v) => s + v, 0) / len;
      for (let i = len; i < 8760; i++) hourly[i] = avg;
    }
    return hourly;
  } catch {
    return null; // fallback to generated
  }
}

// Fetch real solar irradiance from Open-Meteo (CORS-friendly, free)
async function fetchSolarIrradiance(lat, lon, arrays) {
  try {
    const year = new Date().getFullYear() - 1; // last full year
    const url = new URL("https://archive-api.open-meteo.com/v1/archive");
    url.searchParams.set("latitude", lat.toFixed(2));
    url.searchParams.set("longitude", lon.toFixed(2));
    url.searchParams.set("start_date", `${year}-01-01`);
    url.searchParams.set("end_date", `${year}-12-31`);
    url.searchParams.set("hourly", "direct_radiation,diffuse_radiation,direct_normal_irradiance,temperature_2m");
    url.searchParams.set("timezone", "Europe/Berlin");

    const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) throw new Error("API error");
    const data = await resp.json();
    const { direct_radiation, diffuse_radiation, direct_normal_irradiance, temperature_2m } = data.hourly;
    const hours = data.hourly.time;
    if (!direct_radiation || direct_radiation.length < 8000) throw new Error("Insufficient data");

    // Compute PV output for each array using real irradiance
    const hourly = new Float64Array(8760);
    const monthly = new Float64Array(12);
    const len = Math.min(hours.length, 8760);

    for (let i = 0; i < len; i++) {
      const dt = new Date(hours[i]);
      const month = dt.getMonth();
      const dayOfYear = Math.floor((dt - new Date(dt.getFullYear(), 0, 0)) / 86400000);
      const hour = dt.getHours();

      const sun = sunPosition(dayOfYear, hour + 0.5, lat, lon, 1);
      if (sun.alt <= 1) continue;

      const dni = direct_normal_irradiance[i] || 0;
      const dhi = diffuse_radiation[i] || 0;
      const temp = temperature_2m[i] || 25;
      const tempLoss = 1 - 0.004 * Math.max(0, temp - 25); // Temp coefficient

      for (const arr of arrays) {
        const tiltR = arr.tilt * RAD;
        const cosInc = Math.sin(sun.alt * RAD) * Math.cos(tiltR) +
          Math.cos(sun.alt * RAD) * Math.sin(tiltR) * Math.cos((sun.az - arr.azimuth) * RAD);
        if (cosInc <= 0) continue;

        const beam = dni * Math.max(0, cosInc);
        const diffuse = dhi * (1 + Math.cos(tiltR)) / 2;
        const reflected = (direct_radiation[i] || 0) * 0.04 * (1 - Math.cos(tiltR)) / 2;
        const irradiance = beam + diffuse + reflected;

        const output = irradiance / 1000 * arr.kwp * 0.85 * tempLoss; // kW
        hourly[i] += output;
        monthly[month] += output;
      }
    }

    const total = monthly.reduce((s, v) => s + v, 0);
    return { hourly, monthly, total, source: "Open-Meteo " + year };
  } catch {
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 4 — LOAD PROFILE
   ═══════════════════════════════════════════════════════════════════════ */

function generateIndustrialLoad(annualMWh) {
  // Industrial load: relatively flat, slight weekday peak, reduced weekends
  const hourly = new Float64Array(8760);
  const baseKW = (annualMWh * 1000) / 8760;
  let idx = 0, doy = 1;
  const hourShape = [0.75,0.72,0.70,0.70,0.72,0.80,0.95,1.10,1.18,1.20,
                     1.20,1.18,1.10,1.15,1.18,1.18,1.15,1.05,0.92,0.85,
                     0.82,0.80,0.78,0.76];
  for (let m = 0; m < 12; m++) {
    for (let d = 0; d < DAYS_IN_MONTH[m]; d++) {
      const isWeekend = ((doy - 1) % 7) >= 5;
      const weFactor = isWeekend ? 0.55 : 1.0;
      for (let h = 0; h < 24; h++) {
        hourly[idx] = baseKW * hourShape[h] * weFactor;
        idx++;
      }
      doy++;
    }
  }
  return hourly; // kW
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 5 — BESS OPTIMIZATION ENGINE
   ═══════════════════════════════════════════════════════════════════════ */

function optimizeBESS(prices, pvSurplus, capacity, chargeRateKW, efficiency) {
  // Day-by-day greedy optimization: charge when cheap/surplus, discharge when expensive
  const schedule = new Float64Array(8760); // + = charge, - = discharge
  const soc = new Float64Array(8760);
  let currentSoc = capacity * 0.5;
  const maxCharge = chargeRateKW;
  const maxDischarge = chargeRateKW;

  for (let day = 0; day < 365; day++) {
    const start = day * 24;
    // Collect day prices and surplus
    const dayData = [];
    for (let h = 0; h < 24; h++) {
      dayData.push({ h, price: prices[start + h], surplus: pvSurplus[start + h] });
    }
    const avgPrice = dayData.reduce((s, d) => s + d.price, 0) / 24;
    const chargeThresh = avgPrice * 0.78;
    const dischThresh = avgPrice * 1.12;

    // Forward pass
    for (let h = 0; h < 24; h++) {
      const idx = start + h;
      const p = prices[idx];
      const surp = pvSurplus[idx];
      let action = 0;

      // Priority 1: Charge from PV surplus (free energy)
      if (surp > 0 && currentSoc < capacity) {
        const charge = Math.min(surp, maxCharge, (capacity - currentSoc) / efficiency);
        action = charge;
        currentSoc += charge * efficiency;
      }
      // Priority 2: Charge from grid when cheap
      else if (p < chargeThresh && currentSoc < capacity * 0.92) {
        const charge = Math.min(maxCharge, (capacity - currentSoc) / efficiency);
        action = charge;
        currentSoc += charge * efficiency;
      }
      // Priority 3: Discharge when expensive (apply efficiency on discharge side too)
      else if (p > dischThresh && currentSoc > capacity * 0.08) {
        const discharge = Math.min(maxDischarge, currentSoc);
        action = -discharge * efficiency; // net output after losses
        currentSoc -= discharge;
      }

      schedule[idx] = action;
      soc[idx] = currentSoc;
    }
  }

  // Calculate revenue & costs
  let chargeFromGrid = 0, chargeFromPV = 0, dischargeRevenue = 0;
  let chargeCostGrid = 0;
  let cycles = 0;
  for (let i = 0; i < 8760; i++) {
    if (schedule[i] > 0) {
      if (pvSurplus[i] > 0) chargeFromPV += schedule[i];
      else {
        chargeFromGrid += schedule[i];
        chargeCostGrid += schedule[i] * prices[i] / 1000; // € cost of grid charging
      }
    } else if (schedule[i] < 0) {
      const dischKWh = -schedule[i];
      dischargeRevenue += dischKWh * prices[i] / 1000; // €
      cycles += dischKWh / Math.max(capacity, 1);
    }
  }

  return { schedule, soc, chargeFromGrid, chargeFromPV, dischargeRevenue, chargeCostGrid, cycles };
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 6 — MARKET CALCULATIONS
   ═══════════════════════════════════════════════════════════════════════ */

function calcMarket(pvData, loadHourly, prices, bessCapKWh, bessRateKW, bessEff, fixedPriceCtkWh, co2CertEurT) {
  const gridFactor = 0.4; // kg CO₂ / kWh German grid mix

  // Self-consumption matching
  let selfConsumed = 0, gridFeedIn = 0, gridImport = 0;
  const surplus = new Float64Array(8760);
  const deficit = new Float64Array(8760);
  for (let i = 0; i < 8760; i++) {
    const pv = pvData.hourly[i];
    const load = loadHourly[i];
    if (pv >= load) {
      selfConsumed += load;
      surplus[i] = pv - load;
      gridFeedIn += pv - load;
    } else {
      selfConsumed += pv;
      deficit[i] = load - pv;
      gridImport += load - pv;
    }
  }

  // Direktvermarktung without BESS
  let dvRevenue = 0;
  for (let i = 0; i < 8760; i++) {
    dvRevenue += surplus[i] * prices[i] / 1000; // surplus × spot price (€/MWh → €/kWh)
  }
  const dvFee = gridFeedIn * 0.003; // 0.3 ct/kWh Vermarktungsentgelt
  const dvNet = dvRevenue - dvFee;

  // EEG Einspeisevergütung alternative (7.5 ct/kWh for large PV)
  const eegRevenue = gridFeedIn * 0.075;

  // BESS optimization
  const bess = optimizeBESS(prices, surplus, bessCapKWh, bessRateKW, bessEff);

  // Direktvermarktung WITH BESS — shifted surplus to higher-price hours
  let dvBessRevenue = 0;
  for (let i = 0; i < 8760; i++) {
    if (bess.schedule[i] < 0) { // discharge → sell at (higher) current price
      dvBessRevenue += (-bess.schedule[i]) * prices[i] / 1000;
    } else if (surplus[i] > 0) {
      // Surplus minus what's being stored → sell remainder at current price
      const stored = bess.schedule[i] > 0 ? bess.schedule[i] : 0;
      const directSell = Math.max(0, surplus[i] - stored);
      dvBessRevenue += directSell * prices[i] / 1000;
    }
  }
  const dvBessFee = gridFeedIn * 0.003; // fee only on actual feed-in
  const dvBessNet = dvBessRevenue - dvBessFee;

  // Procurement comparison
  const totalLoad = loadHourly.reduce((s, v) => s + v, 0);
  const oldProcurementCost = totalLoad * fixedPriceCtkWh / 100; // €

  // New: PV self-consumption saves, rest at spot price
  let spotCost = 0;
  for (let i = 0; i < 8760; i++) {
    spotCost += deficit[i] * prices[i] / 1000;
  }
  const netzentgelte = gridImport * 0.065; // ~6.5 ct/kWh
  const umlagen = gridImport * 0.025; // ~2.5 ct/kWh
  const newProcurementCost = spotCost + netzentgelte + umlagen;

  // With BESS: shift grid import to cheap hours
  let spotCostBess = 0;
  for (let i = 0; i < 8760; i++) {
    const bessDischarge = bess.schedule[i] < 0 ? -bess.schedule[i] : 0;
    const effectiveDeficit = Math.max(0, deficit[i] - bessDischarge);
    spotCostBess += effectiveDeficit * prices[i] / 1000;
  }
  const gridImportBess = Math.max(0, gridImport - bess.chargeFromPV * bessEff * bessEff); // double eff: charge+discharge
  const newProcCostBess = spotCostBess + Math.max(0, gridImportBess) * 0.065 + Math.max(0, gridImportBess) * 0.025;

  // Self-consumption savings
  const selfConsumptionSavings = selfConsumed * fixedPriceCtkWh / 100;

  // CO₂
  const co2SavedT = (selfConsumed + bess.chargeFromPV * bessEff) * gridFactor / 1000;
  const co2CertSaved = co2SavedT * co2CertEurT;

  // Monthly breakdowns
  const monthlyPV = Array.from(pvData.monthly);
  const monthlyLoad = new Array(12).fill(0);
  const monthlyPrice = new Array(12).fill(0);
  const monthlySelfCons = new Array(12).fill(0);
  const monthlyFeedIn = new Array(12).fill(0);
  const monthlyImport = new Array(12).fill(0);
  let idx = 0;
  for (let m = 0; m < 12; m++) {
    let pCount = 0;
    for (let d = 0; d < DAYS_IN_MONTH[m]; d++) {
      for (let h = 0; h < 24; h++) {
        monthlyLoad[m] += loadHourly[idx];
        monthlyPrice[m] += prices[idx]; pCount++;
        if (pvData.hourly[idx] >= loadHourly[idx]) {
          monthlySelfCons[m] += loadHourly[idx];
          monthlyFeedIn[m] += pvData.hourly[idx] - loadHourly[idx];
        } else {
          monthlySelfCons[m] += pvData.hourly[idx];
          monthlyImport[m] += loadHourly[idx] - pvData.hourly[idx];
        }
        idx++;
      }
    }
    monthlyPrice[m] = pCount > 0 ? monthlyPrice[m] / pCount : 0;
  }

  // Hourly averages for chart (24h profile, averaged across year)
  const avgHourlyPV = new Array(24).fill(0);
  const avgHourlyLoad = new Array(24).fill(0);
  const avgHourlyPrice = new Array(24).fill(0);
  for (let i = 0; i < 8760; i++) {
    const h = i % 24;
    avgHourlyPV[h] += pvData.hourly[i] / 365;
    avgHourlyLoad[h] += loadHourly[i] / 365;
    avgHourlyPrice[h] += prices[i] / 365;
  }

  // Seasonal hourly profiles (summer vs winter)
  const summerHourlyPV = new Array(24).fill(0);
  const summerHourlyPrice = new Array(24).fill(0);
  const winterHourlyPV = new Array(24).fill(0);
  const winterHourlyPrice = new Array(24).fill(0);
  idx = 0;
  for (let m = 0; m < 12; m++) {
    const isSummer = m >= 3 && m <= 8;
    const days = DAYS_IN_MONTH[m];
    for (let d = 0; d < days; d++) {
      for (let h = 0; h < 24; h++) {
        if (isSummer) {
          summerHourlyPV[h] += pvData.hourly[idx] / (183);
          summerHourlyPrice[h] += prices[idx] / (183);
        } else {
          winterHourlyPV[h] += pvData.hourly[idx] / (182);
          winterHourlyPrice[h] += prices[idx] / (182);
        }
        idx++;
      }
    }
  }

  return {
    // Totals
    totalPV: pvData.total, totalLoad, selfConsumed, gridFeedIn, gridImport,
    selfConsumptionRate: pvData.total > 0 ? selfConsumed / pvData.total : 0,
    autarkieRate: totalLoad > 0 ? selfConsumed / totalLoad : 0,
    // Direktvermarktung
    dvNet, dvBessNet, eegRevenue,
    dvDelta: dvBessNet - dvNet,
    // Procurement
    oldProcurementCost, newProcurementCost, newProcCostBess,
    procSavings: oldProcurementCost - newProcurementCost,
    procSavingsBess: oldProcurementCost - newProcCostBess,
    selfConsumptionSavings,
    // BESS
    bessRevenue: bess.dischargeRevenue - bess.chargeCostGrid,
    bessCycles: bess.cycles,
    bess,
    // CO₂
    co2SavedT, co2CertSaved,
    // Monthly
    monthlyPV, monthlyLoad, monthlyPrice, monthlySelfCons, monthlyFeedIn, monthlyImport,
    // Hourly profiles
    avgHourlyPV, avgHourlyLoad, avgHourlyPrice,
    summerHourlyPV, summerHourlyPrice, winterHourlyPV, winterHourlyPrice,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 7 — SVG CHART COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

const chartW = 620, chartH = 280, pad = { t: 30, r: 20, b: 40, l: 55 };
const plotW = chartW - pad.l - pad.r, plotH = chartH - pad.t - pad.b;

function DailyProfileChart({ pvHourly, priceHourly, loadHourly, title, season }) {
  const maxPV = Math.max(...pvHourly, 1);
  const maxPrice = Math.max(...priceHourly, 1);
  const maxLoad = Math.max(...loadHourly, 1);
  const maxY = Math.max(maxPV, maxLoad) * 1.15;
  const maxYPrice = maxPrice * 1.15;

  const barW = plotW / 24 * 0.65;
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontFamily: F, fontSize: "0.85rem", fontWeight: 700, color: C.gold, marginBottom: "0.4rem" }}>
        {title}{season && <span style={{ color: "#999", fontWeight: 400 }}> — {season}</span>}
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", maxWidth: 620, background: "rgba(27,42,74,0.3)", borderRadius: 8 }}>
        {/* Y-axis labels (kW) */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = pad.t + plotH * (1 - f);
          return <g key={f}>
            <line x1={pad.l} y1={y} x2={pad.l + plotW} y2={y} stroke="rgba(255,255,255,0.08)" />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fill="#888" fontSize={10} fontFamily="Calibri, sans-serif">{(maxY * f).toFixed(0)}</text>
          </g>;
        })}
        <text x={10} y={pad.t - 10} fill="#888" fontSize={10} fontFamily="Calibri, sans-serif">kW</text>

        {/* Load bars (navy) */}
        {loadHourly.map((v, h) => {
          const x = pad.l + (h / 24) * plotW + (plotW / 24 - barW) / 2;
          const barH = (v / maxY) * plotH;
          return <rect key={`l${h}`} x={x} y={pad.t + plotH - barH} width={barW} height={barH}
            fill="rgba(37,55,87,0.7)" rx={2} />;
        })}

        {/* PV bars (green) */}
        {pvHourly.map((v, h) => {
          const x = pad.l + (h / 24) * plotW + (plotW / 24 - barW) / 2;
          const barH = (v / maxY) * plotH;
          return <rect key={`pv${h}`} x={x} y={pad.t + plotH - barH} width={barW * 0.6} height={barH}
            fill={C.green} opacity={0.8} rx={2} />;
        })}

        {/* Price line (gold, secondary axis) */}
        <polyline fill="none" stroke={C.gold} strokeWidth={2.5} opacity={0.9}
          points={priceHourly.map((v, h) =>
            `${pad.l + (h + 0.5) / 24 * plotW},${pad.t + plotH * (1 - v / maxYPrice)}`
          ).join(" ")} />

        {/* Price axis right */}
        <text x={chartW - 5} y={pad.t - 10} textAnchor="end" fill={C.gold} fontSize={10} fontFamily="Calibri, sans-serif">€/MWh</text>
        {[0, 0.5, 1].map(f => {
          const y = pad.t + plotH * (1 - f);
          return <text key={`p${f}`} x={chartW - 5} y={y + 4} textAnchor="end" fill={C.gold} fontSize={9} opacity={0.7} fontFamily="Calibri, sans-serif">
            {(maxYPrice * f).toFixed(0)}
          </text>;
        })}

        {/* X-axis */}
        {[0,3,6,9,12,15,18,21].map(h => (
          <text key={h} x={pad.l + (h + 0.5) / 24 * plotW} y={chartH - 8} textAnchor="middle" fill="#888" fontSize={10} fontFamily="Calibri, sans-serif">{h}:00</text>
        ))}

        {/* Legend */}
        <rect x={pad.l + 10} y={pad.t + 5} width={10} height={10} fill={C.green} rx={2} />
        <text x={pad.l + 24} y={pad.t + 14} fill="#ccc" fontSize={10} fontFamily="Calibri, sans-serif">PV</text>
        <rect x={pad.l + 55} y={pad.t + 5} width={10} height={10} fill="rgba(37,55,87,0.7)" rx={2} />
        <text x={pad.l + 69} y={pad.t + 14} fill="#ccc" fontSize={10} fontFamily="Calibri, sans-serif">Verbrauch</text>
        <line x1={pad.l + 130} y1={pad.t + 10} x2={pad.l + 148} y2={pad.t + 10} stroke={C.gold} strokeWidth={2.5} />
        <text x={pad.l + 152} y={pad.t + 14} fill="#ccc" fontSize={10} fontFamily="Calibri, sans-serif">Börsenpreis</text>
      </svg>
    </div>
  );
}

function MonthlyChart({ data, title }) {
  const maxY = Math.max(...data.monthlyPV, ...data.monthlyLoad) * 1.12;
  const barW = plotW / 12 * 0.35;
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontFamily: F, fontSize: "0.85rem", fontWeight: 700, color: C.gold, marginBottom: "0.4rem" }}>{title}</div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", maxWidth: 620, background: "rgba(27,42,74,0.3)", borderRadius: 8 }}>
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = pad.t + plotH * (1 - f);
          return <g key={f}>
            <line x1={pad.l} y1={y} x2={pad.l + plotW} y2={y} stroke="rgba(255,255,255,0.08)" />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fill="#888" fontSize={10} fontFamily="Calibri, sans-serif">{(maxY * f / 1000).toFixed(0)}</text>
          </g>;
        })}
        <text x={10} y={pad.t - 10} fill="#888" fontSize={10} fontFamily="Calibri, sans-serif">MWh</text>

        {MONTHS.map((m, i) => {
          const cx = pad.l + (i + 0.5) / 12 * plotW;
          const pvH = (data.monthlyPV[i] / maxY) * plotH;
          const loadH = (data.monthlyLoad[i] / maxY) * plotH;
          const scH = (data.monthlySelfCons[i] / maxY) * plotH;
          return <g key={m}>
            <rect x={cx - barW - 1} y={pad.t + plotH - pvH} width={barW} height={pvH} fill={C.green} opacity={0.8} rx={2} />
            <rect x={cx + 1} y={pad.t + plotH - loadH} width={barW} height={loadH} fill={C.navyLight} rx={2} />
            <rect x={cx - barW - 1} y={pad.t + plotH - scH} width={barW} height={scH} fill={C.greenLight} rx={2} />
            <text x={cx} y={chartH - 8} textAnchor="middle" fill="#888" fontSize={10} fontFamily="Calibri, sans-serif">{m}</text>
          </g>;
        })}

        {/* Price line overlay */}
        <polyline fill="none" stroke={C.gold} strokeWidth={2} strokeDasharray="5,3"
          points={data.monthlyPrice.map((v, i) => {
            const maxP = Math.max(...data.monthlyPrice) * 1.15;
            return `${pad.l + (i + 0.5) / 12 * plotW},${pad.t + plotH * (1 - v / maxP)}`;
          }).join(" ")} />

        <rect x={pad.l + 10} y={pad.t + 5} width={10} height={10} fill={C.green} rx={2} />
        <text x={pad.l + 24} y={pad.t + 14} fill="#ccc" fontSize={10} fontFamily="Calibri, sans-serif">PV-Erzeugung</text>
        <rect x={pad.l + 115} y={pad.t + 5} width={10} height={10} fill={C.navyLight} rx={2} />
        <text x={pad.l + 129} y={pad.t + 14} fill="#ccc" fontSize={10} fontFamily="Calibri, sans-serif">Verbrauch</text>
        <rect x={pad.l + 205} y={pad.t + 5} width={10} height={10} fill={C.greenLight} rx={2} />
        <text x={pad.l + 219} y={pad.t + 14} fill="#ccc" fontSize={10} fontFamily="Calibri, sans-serif">Eigenverbrauch</text>
      </svg>
    </div>
  );
}

function ComparisonBars({ items, title, unit }) {
  const maxVal = Math.max(...items.map(i => Math.abs(i.value)));
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontFamily: F, fontSize: "0.85rem", fontWeight: 700, color: C.gold, marginBottom: "0.6rem" }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.6rem" }}>
          <div style={{ width: 180, fontFamily: F, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", textAlign: "right" }}>{item.label}</div>
          <div style={{ flex: 1, position: "relative", height: 24 }}>
            <div style={{
              width: `${Math.abs(item.value) / maxVal * 100}%`, height: "100%",
              background: item.color || C.gold, borderRadius: 4, opacity: 0.85,
              display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
            }}>
              <span style={{ fontFamily: F, fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>
                {item.value >= 0 ? "+" : ""}{fmtK(item.value)} {unit}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BESSChart({ bess, prices, selectedDay }) {
  const start = selectedDay * 24;
  const socData = Array.from({ length: 24 }, (_, h) => bess.soc[start + h] || 0);
  const priceData = Array.from({ length: 24 }, (_, h) => prices[start + h] || 0);
  const schedData = Array.from({ length: 24 }, (_, h) => bess.schedule[start + h] || 0);
  const maxSoc = Math.max(...socData, 1);
  const maxPrice = Math.max(...priceData, 1);

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontFamily: F, fontSize: "0.85rem", fontWeight: 700, color: C.gold, marginBottom: "0.4rem" }}>
        BESS Speicherzustand — Tag {selectedDay + 1}
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", maxWidth: 620, background: "rgba(27,42,74,0.3)", borderRadius: 8 }}>
        {/* SoC area */}
        <path fill="rgba(45,106,79,0.3)" stroke={C.green} strokeWidth={2}
          d={`M${pad.l},${pad.t + plotH} ` +
            socData.map((v, h) =>
              `L${pad.l + (h + 0.5) / 24 * plotW},${pad.t + plotH * (1 - v / maxSoc)}`
            ).join(" ") +
            ` L${pad.l + plotW},${pad.t + plotH} Z`} />

        {/* Charge/discharge markers */}
        {schedData.map((v, h) => {
          if (Math.abs(v) < 0.1) return null;
          const x = pad.l + (h + 0.5) / 24 * plotW;
          const isCharge = v > 0;
          return <g key={h}>
            <circle cx={x} cy={pad.t + plotH * (1 - socData[h] / maxSoc)} r={4}
              fill={isCharge ? C.greenLight : C.gold} stroke="#fff" strokeWidth={1} />
            <text x={x} y={pad.t + plotH * (1 - socData[h] / maxSoc) - 8}
              textAnchor="middle" fill={isCharge ? C.greenLight : C.gold} fontSize={8} fontFamily="Calibri, sans-serif">
              {isCharge ? "▲" : "▼"}
            </text>
          </g>;
        })}

        {/* Price line */}
        <polyline fill="none" stroke={C.gold} strokeWidth={1.5} opacity={0.6} strokeDasharray="4,3"
          points={priceData.map((v, h) =>
            `${pad.l + (h + 0.5) / 24 * plotW},${pad.t + plotH * (1 - v / (maxPrice * 1.1))}`
          ).join(" ")} />

        {[0,3,6,9,12,15,18,21].map(h => (
          <text key={h} x={pad.l + (h + 0.5) / 24 * plotW} y={chartH - 8} textAnchor="middle" fill="#888" fontSize={10} fontFamily="Calibri, sans-serif">{h}:00</text>
        ))}
        <text x={10} y={pad.t - 10} fill="#888" fontSize={10} fontFamily="Calibri, sans-serif">kWh SoC</text>
        {[0, 0.5, 1].map(f => {
          const y = pad.t + plotH * (1 - f);
          return <text key={f} x={pad.l - 6} y={y + 4} textAnchor="end" fill="#888" fontSize={10} fontFamily="Calibri, sans-serif">{(maxSoc * f).toFixed(0)}</text>;
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 8 — HELPER FORMATTERS
   ═══════════════════════════════════════════════════════════════════════ */

function fmtK(v) {
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + " Mio";
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(0) + " T";
  return v.toFixed(0);
}
function fmtEur(v) { return (v >= 0 ? "" : "−") + fmtK(Math.abs(v)) + " €"; }
function fmtMWh(v) { return v >= 1000 ? (v / 1000).toFixed(1) + " GWh" : v.toFixed(0) + " MWh"; }

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 9 — UI SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

const sliderStyle = {
  width: "100%", height: 6, appearance: "none", WebkitAppearance: "none",
  background: "rgba(255,255,255,0.1)", borderRadius: 3, outline: "none",
  accentColor: C.gold,
};

function Slider({ label, value, min, max, step, unit, onChange }) {
  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F, fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", marginBottom: "0.2rem" }}>
        <span>{label}</span>
        <span style={{ color: C.goldLight, fontWeight: 600 }}>{typeof value === "number" ? value.toLocaleString("de-DE") : value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} className="ma-slider" style={sliderStyle} />
    </div>
  );
}

function KPICard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "rgba(27,42,74,0.5)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10, padding: "0.8rem 1rem", textAlign: "center", minWidth: 130,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, ${color || C.gold}60, ${color || C.gold}20, transparent)`,
      }} />
      <div style={{ fontFamily: F, fontSize: "0.65rem", color: "#999", textTransform: "uppercase", letterSpacing: "1.5px" }}>{label}</div>
      <div style={{ fontFamily: F, fontSize: "1.4rem", fontWeight: 700, color: color || C.gold, marginTop: "0.2rem" }}>{value}</div>
      {sub && <div style={{ fontFamily: F, fontSize: "0.7rem", color: "#888", marginTop: "0.15rem" }}>{sub}</div>}
    </div>
  );
}

function Section({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen !== false);
  return (
    <div style={{ marginBottom: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.8rem" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: "none", border: "none", color: C.gold, fontFamily: F, fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.3px",
        cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0",
        width: "100%", textAlign: "left",
      }}>
        <span style={{ transform: open ? "rotate(90deg)" : "rotate(0)", transition: "0.2s", fontSize: "0.8rem" }}>▶</span>
        {title}
      </button>
      {open && <div style={{ marginTop: "0.6rem" }}>{children}</div>}
    </div>
  );
}

function PVArrayRow({ arr, idx, onChange, onRemove }) {
  return (
    <div style={{
      background: "rgba(45,106,79,0.1)", border: "1px solid rgba(45,106,79,0.2)",
      borderRadius: 8, padding: "0.7rem", marginBottom: "0.5rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
        <span style={{ fontFamily: F, fontSize: "0.8rem", color: C.greenLight, fontWeight: 700, letterSpacing: "0.5px" }}>Anlage {idx + 1}</span>
        <button onClick={onRemove} style={{
          background: "rgba(255,100,100,0.15)", border: "1px solid rgba(255,100,100,0.3)",
          color: "#ff8888", borderRadius: 4, padding: "0.1rem 0.5rem", fontSize: "0.7rem", cursor: "pointer",
        }}><Icon name="close" size={14} /></button>
      </div>
      <div style={{ marginBottom: "0.4rem" }}>
        <label style={{ fontFamily: F, fontSize: "0.72rem", color: "rgba(255,255,255,0.55)" }}>Ausrichtung</label>
        <select value={arr.azimuth} onChange={e => onChange({ ...arr, azimuth: +e.target.value })}
          style={{
            width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#ddd", borderRadius: 6, padding: "0.35rem", fontSize: "0.8rem", fontFamily: F, marginTop: "0.15rem",
          }}>
          {DIRECTIONS.map(d => <option key={d.label} value={d.az}>{d.label} ({d.az}°)</option>)}
        </select>
      </div>
      <Slider label="Neigung" value={arr.tilt} min={0} max={90} step={1} unit="°"
        onChange={tilt => onChange({ ...arr, tilt })} />
      <Slider label="Leistung" value={arr.kwp} min={10} max={5000} step={10} unit="kWp"
        onChange={kwp => onChange({ ...arr, kwp })} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 10 — MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

const defaultArrays = [
  { azimuth: 0, tilt: 15, kwp: 2500 },  // Süd, Flachdach
  { azimuth: -90, tilt: 15, kwp: 500 },  // Ost
  { azimuth: 90, tilt: 15, kwp: 500 },   // West
];

export default function MarketAnalysis({ config, configActive, onClose }) {
  // PV Array config
  const [arrays, setArrays] = useState(defaultArrays);
  // Market settings
  const [fixedPrice, setFixedPrice] = useState(18); // ct/kWh
  const [annualLoad, setAnnualLoad] = useState(12000); // MWh
  const [co2CertPrice, setCo2CertPrice] = useState(65); // €/t CO₂
  const [bessCapacity, setBessCapacity] = useState(8000); // kWh
  const [bessRate, setBessRate] = useState(4000); // kW
  const [bessEff, setBessEff] = useState(0.90);
  const [livePrice, setLivePrice] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [liveSolar, setLiveSolar] = useState(null);
  const [loadingSolar, setLoadingSolar] = useState(false);
  const [selectedDay, setSelectedDay] = useState(172); // Summer solstice
  const [season, setSeason] = useState("year"); // year, summer, winter

  // Use config values if ConfigPanel is active
  const effectiveLoad = configActive && config ? config.jahresverbrauch : annualLoad;
  const effectiveBess = configActive && config ? config.standortBESS * 1000 : bessCapacity;

  // Generate solar data (use live irradiance if available, else parametric model)
  const pvDataModel = useMemo(() =>
    generateAnnualPV(arrays, HARTENSTEIN.lat, HARTENSTEIN.lon, HARTENSTEIN.tz),
    [arrays]
  );
  const pvData = liveSolar || pvDataModel;

  // Generate or use live prices
  const prices = useMemo(() => livePrice || generateAnnualPrices(42), [livePrice]);

  // Generate load
  const loadHourly = useMemo(() => generateIndustrialLoad(effectiveLoad), [effectiveLoad]);

  // Run full market calculation
  const results = useMemo(() =>
    calcMarket(pvData, loadHourly, prices, effectiveBess, bessRate, bessEff, fixedPrice, co2CertPrice),
    [pvData, loadHourly, prices, effectiveBess, bessRate, bessEff, fixedPrice, co2CertPrice]
  );

  const totalKWp = arrays.reduce((s, a) => s + a.kwp, 0);
  const specificYield = pvData.total / Math.max(totalKWp, 1);

  // Fetch live prices
  const handleFetchPrices = useCallback(async () => {
    setLoadingPrices(true);
    const data = await fetchLivePrices();
    if (data) setLivePrice(data);
    setLoadingPrices(false);
  }, []);

  // Fetch live solar irradiance from Open-Meteo
  const handleFetchSolar = useCallback(async () => {
    setLoadingSolar(true);
    const data = await fetchSolarIrradiance(HARTENSTEIN.lat, HARTENSTEIN.lon, arrays);
    if (data) setLiveSolar(data);
    setLoadingSolar(false);
  }, [arrays]);

  const addArray = () => { setArrays(a => [...a, { azimuth: 0, tilt: 20, kwp: 500 }]); setLiveSolar(null); };
  const removeArray = (idx) => { setArrays(a => a.filter((_, i) => i !== idx)); setLiveSolar(null); };
  const updateArray = (idx, arr) => { setArrays(a => a.map((v, i) => i === idx ? arr : v)); setLiveSolar(null); };

  // Seasonal chart data
  const chartPV = season === "summer" ? results.summerHourlyPV :
    season === "winter" ? results.winterHourlyPV : results.avgHourlyPV;
  const chartPrice = season === "summer" ? results.summerHourlyPrice :
    season === "winter" ? results.winterHourlyPrice : results.avgHourlyPrice;
  const seasonLabel = season === "summer" ? "Sommer (Apr–Sep)" :
    season === "winter" ? "Winter (Okt–Mär)" : "Jahresdurchschnitt";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000, background: "rgba(10,18,32,0.97)",
      overflowY: "auto", WebkitOverflowScrolling: "touch",
    }}>
      <style>{`
        .ma-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 5px;
          border-radius: 3px;
          background: rgba(255,255,255,0.08);
          outline: none;
          cursor: pointer;
        }
        .ma-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4A843, #E8C97A);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(212,168,67,0.3);
          border: 2px solid #1B2A4A;
        }
        .ma-slider::-moz-range-thumb {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4A843, #E8C97A);
          cursor: pointer;
          border: 2px solid #1B2A4A;
        }
        .ma-btn-action {
          -webkit-transition: -webkit-filter 0.15s, transform 0.1s;
          transition: filter 0.15s, transform 0.1s;
        }
        .ma-btn-action:hover {
          -webkit-filter: brightness(1.25);
          filter: brightness(1.25);
          transform: translateY(-1px);
        }
        .ma-btn-action:active {
          transform: translateY(0);
        }
      `}</style>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10, background: "rgba(27,42,74,0.97)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(212,168,67,0.2)",
        padding: "0.8rem 1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontFamily: F, fontSize: "1.2rem", fontWeight: 700, color: C.gold, letterSpacing: "0.5px" }}>Energiemarkt-Analyse</div>
          <div style={{ fontFamily: F, fontSize: "0.72rem", color: "#888", letterSpacing: "1px" }}>Börsenpreise · Direktvermarktung · BESS-Optimierung · CO₂</div>
        </div>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
          color: "#ccc", borderRadius: "8px", width: 36, height: 36, fontSize: "1rem", fontFamily: F,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}><Icon name="close" size={14} /></button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem 1.2rem 3rem" }}>
        {/* ─── KPI Dashboard ─── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "0.6rem", marginBottom: "1.5rem",
        }}>
          <KPICard label="PV-Erzeugung" value={fmtMWh(pvData.total)} sub={`${specificYield.toFixed(0)} kWh/kWp`} color={C.green} />
          <KPICard label="Eigenverbrauch" value={`${(results.selfConsumptionRate * 100).toFixed(0)}%`}
            sub={fmtMWh(results.selfConsumed)} color={C.greenLight} />
          <KPICard label="Autarkie" value={`${(results.autarkieRate * 100).toFixed(0)}%`}
            sub={`${fmtMWh(results.gridImport)} Import`} />
          <KPICard label="DV ohne BESS" value={fmtEur(results.dvNet)} sub="Direktvermarktung" />
          <KPICard label="DV mit BESS" value={fmtEur(results.dvBessNet)}
            sub={`+${fmtK(results.dvDelta)} € vs. ohne`} color={C.green} />
          <KPICard label="Einkauf-Ersparnis" value={fmtEur(results.procSavingsBess)}
            sub={`vs. ${fixedPrice} ct/kWh fest`} color={C.green} />
          <KPICard label="CO₂-Einsparung" value={`${results.co2SavedT.toFixed(0)} t/a`}
            sub={fmtEur(results.co2CertSaved) + " Zertifikate"} color={C.greenLight} />
          <KPICard label="BESS-Zyklen" value={`${results.bessCycles.toFixed(0)}/a`}
            sub={`${(effectiveBess / 1000).toFixed(0)} MWh Kapazität`} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "min(300px, 85vw) 1fr", gap: "1.5rem", alignItems: "start" }}>
          {/* ─── LEFT: Configuration ─── */}
          <div style={{
            background: "rgba(27,42,74,0.4)", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)", padding: "1rem",
          }}>
            <Section title={<><Icon name="sun" size={14} color={C.goldLight} /> PV-Anlagen</>}>
              {arrays.map((arr, i) => (
                <PVArrayRow key={i} arr={arr} idx={i}
                  onChange={a => updateArray(i, a)}
                  onRemove={() => removeArray(i)} />
              ))}
              <button onClick={addArray} className="ma-btn-action" style={{
                width: "100%", background: "rgba(45,106,79,0.15)", border: "1px dashed rgba(45,106,79,0.4)",
                color: C.greenLight, borderRadius: 6, padding: "0.4rem", fontFamily: F, fontSize: "0.78rem",
                cursor: "pointer", marginTop: "0.3rem",
              }}>+ Anlage hinzufügen</button>
              <div style={{ fontFamily: F, fontSize: "0.72rem", color: "#888", marginTop: "0.5rem", textAlign: "center" }}>
                Gesamt: {totalKWp.toLocaleString("de-DE")} kWp · {specificYield.toFixed(0)} kWh/kWp/a · {(pvData.total / 1000).toFixed(1)} GWh/a
              </div>
              <button onClick={handleFetchSolar} disabled={loadingSolar} className="ma-btn-action" style={{
                width: "100%", background: loadingSolar ? "rgba(255,255,255,0.05)" : "rgba(45,106,79,0.15)",
                border: "1px solid rgba(45,106,79,0.3)", color: C.greenLight,
                borderRadius: 6, padding: "0.4rem", fontFamily: F, fontSize: "0.75rem", cursor: "pointer", marginTop: "0.5rem",
              }}>
                {loadingSolar ? "Lade Einstrahlungsdaten…" : liveSolar ? <><Icon name="check" size={12} color={C.greenLight} style={{ marginRight: 4 }} />{liveSolar.source} geladen</> : <><Icon name="cloudSun" size={13} style={{ marginRight: 4 }} /> Echte Einstrahlungsdaten laden</>}
              </button>
              <div style={{ fontFamily: F, fontSize: "0.65rem", color: "#777", marginTop: "0.2rem", textAlign: "center" }}>
                Open-Meteo API (Reanalyse-Daten, kostenlos)
              </div>
            </Section>

            <Section title={<><Icon name="bolt" size={14} color={C.goldLight} /> Stromeinkauf</>} defaultOpen={true}>
              <Slider label="Aktueller Festpreis" value={fixedPrice} min={8} max={40} step={0.5} unit="ct/kWh"
                onChange={setFixedPrice} />
              <Slider label="Jahresverbrauch" value={effectiveLoad} min={1000} max={50000} step={500} unit="MWh"
                onChange={v => !configActive && setAnnualLoad(v)} />
              <div style={{ marginTop: "0.5rem" }}>
                <button onClick={handleFetchPrices} disabled={loadingPrices} className="ma-btn-action" style={{
                  width: "100%", background: loadingPrices ? "rgba(255,255,255,0.05)" : "rgba(212,168,67,0.15)",
                  border: "1px solid rgba(212,168,67,0.3)", color: C.goldLight,
                  borderRadius: 6, padding: "0.4rem", fontFamily: F, fontSize: "0.75rem", cursor: "pointer",
                }}>
                  {loadingPrices ? "Lade Börsenpreise…" : livePrice ? <><Icon name="check" size={12} color={C.greenLight} style={{ marginRight: 4 }} /> Live-Preise geladen</> : <><Icon name="satellite" size={13} style={{ marginRight: 4 }} /> Live-Börsenpreise laden</>}
                </button>
                <div style={{ fontFamily: F, fontSize: "0.65rem", color: "#777", marginTop: "0.2rem", textAlign: "center" }}>
                  energy-charts.info (Fraunhofer ISE)
                </div>
              </div>
            </Section>

            <Section title={<><Icon name="battery" size={14} color={C.greenLight} /> Batteriespeicher</>} defaultOpen={true}>
              <Slider label="Kapazität" value={effectiveBess} min={0} max={50000} step={500} unit="kWh"
                onChange={v => !configActive && setBessCapacity(v)} />
              <Slider label="Lade-/Entladerate" value={bessRate} min={500} max={20000} step={500} unit="kW"
                onChange={setBessRate} />
              <Slider label="Roundtrip-Effizienz" value={Math.round(bessEff * 100)} min={80} max={98} step={1} unit="%"
                onChange={v => setBessEff(v / 100)} />
            </Section>

            <Section title={<><Icon name="globe" size={14} color={C.greenLight} /> CO₂-Zertifikate</>} defaultOpen={true}>
              <Slider label="EU-ETS Preis" value={co2CertPrice} min={20} max={150} step={5} unit="€/t CO₂"
                onChange={setCo2CertPrice} />
              <div style={{ fontFamily: F, fontSize: "0.72rem", color: "#888", marginTop: "0.2rem" }}>
                Grid-Emissionsfaktor: 400 g CO₂/kWh
              </div>
            </Section>

            <div style={{ fontFamily: F, fontSize: "0.65rem", color: "#666", textAlign: "center", marginTop: "0.5rem" }}>
              <Icon name="pin" size={11} style={{ marginRight: 3 }} /> Standort: Hartenstein (49.63°N, 11.52°E)
            </div>
          </div>

          {/* ─── RIGHT: Results ─── */}
          <div>
            {/* Season selector */}
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
              {[["year", "Ganzjahr"], ["summer", "Sommer"], ["winter", "Winter"]].map(([key, label]) => (
                <button key={key} onClick={() => setSeason(key)} className="ma-btn-action" style={{
                  background: season === key ? "rgba(212,168,67,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${season === key ? "rgba(212,168,67,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: season === key ? C.goldLight : "#888",
                  borderRadius: "2rem", padding: "0.3rem 0.9rem", fontFamily: F, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.5px", cursor: "pointer",
                }}>{label}</button>
              ))}
            </div>

            {/* Chart 1: Daily Profile */}
            <Section title="Tages-Erzeugungsprofil vs. Börsenpreis" defaultOpen={true}>
              <DailyProfileChart
                pvHourly={chartPV}
                priceHourly={chartPrice}
                loadHourly={results.avgHourlyLoad}
                title="Durchschnittliches Tagesprofil"
                season={seasonLabel}
              />
              <div style={{ fontFamily: F, fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, background: "rgba(212,168,67,0.06)", borderLeft: `3px solid ${C.gold}40`, borderRadius: "0 6px 6px 0", padding: "0.6rem 0.8rem", marginTop: "0.5rem" }}>
                <strong style={{ color: C.gold }}>Key Insight:</strong> PV-Erzeugung korreliert mit niedrigen Börsenpreisen
                (Solardip um Mittag). Mit BESS lässt sich die Einspeisung in die Abendspitze verschieben —
                dort liegen die Preise {season === "winter" ? "30–50%" : "40–80%"} über dem Tagesdurchschnitt.
              </div>
            </Section>

            {/* Chart 2: Monthly Overview */}
            <Section title="Monatliche Erzeugung, Verbrauch & Börsenpreis" defaultOpen={true}>
              <MonthlyChart data={results} title="Monatliche Energiebilanz" />
            </Section>

            {/* Chart 3: Direktvermarktung Comparison */}
            <Section title="Direktvermarktung — Erlösvergleich" defaultOpen={true}>
              <ComparisonBars title="Jährliche Einnahmen aus Netzeinspeisung" unit="€" items={[
                { label: "EEG-Vergütung (7,5 ct)", value: results.eegRevenue, color: "#888" },
                { label: "Direktverm. ohne BESS", value: results.dvNet, color: C.gold },
                { label: "Direktverm. mit BESS", value: results.dvBessNet, color: C.green },
              ]} />
              <div style={{
                background: "rgba(45,106,79,0.1)", border: "1px solid rgba(45,106,79,0.2)",
                borderRadius: 8, padding: "0.8rem", fontFamily: F, fontSize: "0.78rem", color: "#bbb", lineHeight: 1.6,
              }}>
                <div style={{ color: C.greenLight, fontWeight: 600, marginBottom: "0.3rem" }}>Analyse Direktvermarktung</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F }}>
                  <tbody>
                    <tr><td style={{ padding: "0.2rem 0", color: "#999" }}>Einspeisung gesamt</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{fmtMWh(results.gridFeedIn)}</td></tr>
                    <tr><td style={{ padding: "0.2rem 0", color: "#999" }}>∅ Einspeise-Erlös (ohne BESS)</td>
                      <td style={{ textAlign: "right" }}>{(results.dvNet / results.gridFeedIn * 100).toFixed(1)} ct/kWh</td></tr>
                    <tr><td style={{ padding: "0.2rem 0", color: "#999" }}>∅ Einspeise-Erlös (mit BESS)</td>
                      <td style={{ textAlign: "right", color: C.greenLight, fontWeight: 600 }}>
                        {(results.dvBessNet / results.gridFeedIn * 100).toFixed(1)} ct/kWh</td></tr>
                    <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      <td style={{ padding: "0.3rem 0", color: C.gold, fontWeight: 600 }}>BESS-Mehrerlös</td>
                      <td style={{ textAlign: "right", color: C.gold, fontWeight: 700 }}>+{fmtEur(results.dvDelta)}/a</td></tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Chart 4: Procurement Comparison */}
            <Section title="Stromeinkauf — Alt vs. Börse" defaultOpen={true}>
              <ComparisonBars title="Jährliche Strombeschaffungskosten" unit="€" items={[
                { label: `Festpreis (${fixedPrice} ct/kWh)`, value: results.oldProcurementCost, color: "#cc5555" },
                { label: "Spot ohne BESS", value: results.newProcurementCost, color: C.gold },
                { label: "Spot + BESS-Optimierung", value: results.newProcCostBess, color: C.green },
              ]} />
              <div style={{
                background: "rgba(45,106,79,0.1)", border: "1px solid rgba(45,106,79,0.2)",
                borderRadius: 8, padding: "0.8rem", fontFamily: F, fontSize: "0.78rem", color: "#bbb", lineHeight: 1.6,
              }}>
                <div style={{ color: C.greenLight, fontWeight: 600, marginBottom: "0.3rem" }}>Einkaufsoptimierung</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F }}>
                  <tbody>
                    <tr><td style={{ padding: "0.2rem 0", color: "#999" }}>Restbedarf nach PV</td>
                      <td style={{ textAlign: "right" }}>{fmtMWh(results.gridImport)}</td></tr>
                    <tr><td style={{ padding: "0.2rem 0", color: "#999" }}>Ersparnis PV-Eigenverbrauch</td>
                      <td style={{ textAlign: "right", color: C.greenLight }}>{fmtEur(results.selfConsumptionSavings)}/a</td></tr>
                    <tr><td style={{ padding: "0.2rem 0", color: "#999" }}>Spot vs. Festpreis Ersparnis</td>
                      <td style={{ textAlign: "right" }}>{fmtEur(results.procSavings)}/a</td></tr>
                    <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      <td style={{ padding: "0.3rem 0", color: C.gold, fontWeight: 600 }}>Gesamt mit BESS</td>
                      <td style={{ textAlign: "right", color: C.gold, fontWeight: 700 }}>{fmtEur(results.procSavingsBess)}/a</td></tr>
                  </tbody>
                </table>
                <div style={{ marginTop: "0.5rem", fontFamily: F, fontSize: "0.72rem", color: "#888" }}>
                  Inkl. Netzentgelte (6,5 ct/kWh) + Umlagen (2,5 ct/kWh) auf Netzbezug.
                  BESS lädt bei niedrigen Nachtpreisen und entlädt während teurer Spitzenstunden.
                </div>
              </div>
            </Section>

            {/* Chart 5: BESS State-of-Charge */}
            <Section title="BESS Speicherfahrplan" defaultOpen={false}>
              <div style={{ marginBottom: "0.5rem" }}>
                <Slider label="Tag im Jahr" value={selectedDay + 1} min={1} max={365} step={1} unit={`(${dayToDate(selectedDay)})`}
                  onChange={v => setSelectedDay(v - 1)} />
              </div>
              <BESSChart bess={results.bess} prices={prices} selectedDay={selectedDay} />
              <div style={{ fontFamily: F, fontSize: "0.72rem", color: "#888" }}>
                ▲ = Laden (günstig/PV-Überschuss) · ▼ = Entladen (teuer/Bedarf) · Gestrichelt = Börsenpreis
              </div>
            </Section>

            {/* CO₂ Section */}
            <Section title="CO₂-Bilanz & Zertifikate" defaultOpen={true}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem",
              }}>
                <div style={{
                  background: "rgba(45,106,79,0.12)", border: "1px solid rgba(45,106,79,0.25)",
                  borderRadius: 10, padding: "1rem", textAlign: "center",
                }}>
                  <div style={{ fontFamily: F, fontSize: "2rem", fontWeight: 700, color: C.green }}>
                    {results.co2SavedT.toFixed(0)} t
                  </div>
                  <div style={{ fontFamily: F, fontSize: "0.78rem", color: "#bbb" }}>CO₂-Einsparung pro Jahr</div>
                  <div style={{ fontFamily: F, fontSize: "0.68rem", color: "#888", marginTop: "0.3rem" }}>
                    durch {fmtMWh(results.selfConsumed)} Eigenverbrauch
                  </div>
                </div>
                <div style={{
                  background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)",
                  borderRadius: 10, padding: "1rem", textAlign: "center",
                }}>
                  <div style={{ fontFamily: F, fontSize: "2rem", fontWeight: 700, color: C.gold }}>
                    {fmtEur(results.co2CertSaved)}
                  </div>
                  <div style={{ fontFamily: F, fontSize: "0.78rem", color: "#bbb" }}>Vermiedene Zertifikatskosten</div>
                  <div style={{ fontFamily: F, fontSize: "0.68rem", color: "#888", marginTop: "0.3rem" }}>
                    bei {co2CertPrice} €/t CO₂ (EU-ETS)
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: "0.8rem", fontFamily: F, fontSize: "0.75rem", color: "#999", lineHeight: 1.6,
                background: "rgba(27,42,74,0.3)", borderRadius: 8, padding: "0.7rem",
              }}>
                <strong style={{ color: C.gold }}>EU-ETS & CBAM:</strong> Unternehmen im Emissionshandel müssen für
                jede emittierte Tonne CO₂ Zertifikate erwerben. Durch PV-Eigenverbrauch und grüne Direktversorgung
                sinkt der Zertifikatsbedarf direkt. Bei steigenden CO₂-Preisen (Prognose: 80–120 €/t bis 2030)
                erhöht sich die Einsparung weiter. CSRD-konform wird die Reduktion in der
                Nachhaltigkeitsberichterstattung erfasst.
              </div>
            </Section>

            {/* Summary */}
            <Section title="Gesamtübersicht — Jährliche Wirtschaftlichkeit" defaultOpen={true}>
              <div style={{
                background: "rgba(27,42,74,0.4)", borderRadius: 10,
                border: "1px solid rgba(212,168,67,0.15)", padding: "1rem",
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F, fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(212,168,67,0.3)" }}>
                      <th style={{ textAlign: "left", padding: "0.4rem", color: C.gold }}>Position</th>
                      <th style={{ textAlign: "right", padding: "0.4rem", color: C.gold }}>Ohne BESS</th>
                      <th style={{ textAlign: "right", padding: "0.4rem", color: C.gold }}>Mit BESS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Eigenverbrauch-Ersparnis", results.selfConsumptionSavings, results.selfConsumptionSavings],
                      ["Direktvermarktung Erlös", results.dvNet, results.dvBessNet],
                      ["Einkauf-Optimierung (Spot vs. Fest)", results.procSavings, results.procSavingsBess],
                      ["CO₂-Zertifikate Ersparnis", results.co2CertSaved, results.co2CertSaved],
                    ].map(([label, wo, mit], i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.4rem", color: "#ccc" }}>{label}</td>
                        <td style={{ textAlign: "right", padding: "0.4rem", color: "#aaa" }}>{fmtEur(wo)}</td>
                        <td style={{ textAlign: "right", padding: "0.4rem", color: C.greenLight, fontWeight: 600 }}>{fmtEur(mit)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: "2px solid rgba(212,168,67,0.3)" }}>
                      <td style={{ padding: "0.5rem 0.4rem", color: C.gold, fontWeight: 700, fontSize: "0.9rem" }}>
                        Gesamt jährlicher Vorteil
                      </td>
                      <td style={{ textAlign: "right", padding: "0.5rem 0.4rem", color: C.gold, fontWeight: 700, fontSize: "0.9rem" }}>
                        {fmtEur(results.selfConsumptionSavings + results.dvNet + results.procSavings + results.co2CertSaved)}
                      </td>
                      <td style={{ textAlign: "right", padding: "0.5rem 0.4rem", color: C.green, fontWeight: 700, fontSize: "0.95rem" }}>
                        {fmtEur(results.selfConsumptionSavings + results.dvBessNet + results.procSavingsBess + results.co2CertSaved)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ fontFamily: F, fontSize: "0.7rem", color: "#666", marginTop: "0.5rem", textAlign: "center" }}>
                Alle Werte p.a. · Standort Hartenstein · PV {liveSolar ? liveSolar.source : "Parametrisches Modell"} · Börsenpreise {livePrice ? "live (energy-charts)" : "modelliert"} · Industrielastprofil
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function dayToDate(day) {
  let d = day;
  for (let m = 0; m < 12; m++) {
    if (d < DAYS_IN_MONTH[m]) return `${d + 1}. ${MONTHS[m]}`;
    d -= DAYS_IN_MONTH[m];
  }
  return `${day + 1}`;
}
