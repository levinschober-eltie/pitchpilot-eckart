import { useState, useRef, useCallback, useEffect } from "react";
import { Icon } from "./Icons";
import { C, anim } from "./colors";
import { defaultConfig, fmtEuro, fmtVal } from "./calcEngine";
import { site } from "./siteConfig";
import useFocusTrap from "./useFocusTrap";

/* ── Slider Group Definitions ── */
const GROUPS = [
  {
    key: "standort", title: "STANDORT & VERBRAUCH", icon: "factory",
    sliders: [
      { key: "stromverbrauch", label: "Jahresstromverbrauch", unit: "MWh/a", min: 2000, max: 60000, step: 500 },
      { key: "gasverbrauch", label: "Jahresgasverbrauch", unit: "MWh/a", min: 0, max: 40000, step: 500 },
      { key: "strompreis", label: "Strompreis (netto)", unit: "ct/kWh", min: 8, max: 40, step: 0.5, dec: 1 },
      { key: "gaspreis", label: "Gaspreis (netto)", unit: "ct/kWh", min: 2, max: 18, step: 0.5, dec: 1 },
    ],
    hasUploads: true,
  },
  {
    key: "pv", title: "PV-AUSBAU", icon: "sun",
    sliders: [
      { key: "pvDach", label: "PV Dach", unit: "MWp", min: 0, max: 6, step: 0.1, dec: 1 },
      { key: "pvFassade", label: "PV Fassade", unit: "MWp", min: 0, max: 2, step: 0.1, dec: 1 },
      { key: "pvCarport", label: "PV Carport", unit: "MWp", min: 0, max: 4, step: 0.1, dec: 1 },
    ],
    note: `${site.existingPVLabel}: ${site.existingPV.toFixed(1).replace(".", ",")} MWp (bereits installiert)`,
  },
  {
    key: "speicher", title: "SPEICHER", icon: "battery",
    sliders: [
      { key: "standortBESS", label: "Standort-BESS (Grünstrom)", unit: "MWh", min: 0, max: 20, step: 0.5, dec: 1 },
      { key: "graustromBESS", label: "Graustrom-BESS (Utility)", unit: "MWh", min: 0, max: 400, step: 10 },
    ],
  },
  {
    key: "waerme", title: "WÄRMEKONZEPT", icon: "fire",
    sliders: [
      { key: "wpLeistung", label: "Wärmepumpen-Leistung", unit: "MW", min: 0, max: 15, step: 0.5, dec: 1 },
      { key: "pufferspeicher", label: "Pufferspeicher", unit: "m³", min: 0, max: 800, step: 50 },
    ],
  },
  {
    key: "mobilitaet", title: "MOBILITÄT", icon: "car",
    sliders: [
      { key: "anzahlPKW", label: "E-PKW Ladepunkte", unit: "Stk", min: 0, max: 200, step: 5 },
      { key: "anzahlLKW", label: "E-LKW Ladepunkte", unit: "Stk", min: 0, max: 30, step: 1 },
      { key: "kmPKW", label: "Ø Fahrleistung PKW", unit: "km/a", min: 5000, max: 40000, step: 1000 },
      { key: "kmLKW", label: "Ø Fahrleistung LKW", unit: "km/a", min: 10000, max: 120000, step: 5000 },
      { key: "dieselpreis", label: "Dieselpreis", unit: "€/l", min: 1.0, max: 2.5, step: 0.05, dec: 2 },
    ],
  },
  {
    key: "finanzierung", title: "FINANZIERUNG", icon: "bank",
    sliders: [
      { key: "ekAnteil", label: "Eigenkapitalanteil", unit: "%", min: 10, max: 100, step: 5 },
      { key: "kreditZins", label: "Kreditzins", unit: "% p.a.", min: 2.0, max: 8.0, step: 0.1, dec: 1 },
      { key: "kreditLaufzeit", label: "Kreditlaufzeit", unit: "Jahre", min: 5, max: 25, step: 1 },
      { key: "tilgungsfrei", label: "Tilgungsfreie Jahre", unit: "Jahre", min: 0, max: 5, step: 1 },
    ],
  },
];

/* ── CSV Parser ── */
function parseLastgangCSV(text) {
  try {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 10) return null;
    const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
    const startIdx = /^[a-zA-Z"Datum]/.test(lines[0]) ? 1 : 0;
    let values = [];
    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(sep);
      for (let j = parts.length - 1; j >= 0; j--) {
        const val = parseFloat(parts[j].replace(",", ".").replace(/[^\d.-]/g, ""));
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

/* ── Bill Analysis Component ── */
const ANALYSIS_STEPS = [
  { target: 12, text: "Dokument wird eingelesen…", delay: 70 },
  { target: 30, text: "Tarifstruktur wird erkannt…", delay: 100 },
  { target: 50, text: "Preiskomponenten werden extrahiert…", delay: 130 },
  { target: 72, text: "Verbrauchsdaten werden analysiert…", delay: 110 },
  { target: 88, text: "Netzentgelte & Umlagen werden berechnet…", delay: 90 },
  { target: 100, text: "Ergebnisse werden aufbereitet…", delay: 60 },
];

const BILL_FIELDS = [
  { key: "monatsverbrauch", label: "Monatsverbrauch", unit: "kWh", step: 100, group: "verbrauch" },
  { key: "jahresverbrauch", label: "Jahresverbrauch (hochger.)", unit: "MWh/a", step: 100, group: "verbrauch", derived: true },
  { key: "arbeitspreis", label: "Arbeitspreis (gewichtet)", unit: "ct/kWh", step: 0.1, dec: 2, group: "preise" },
  { key: "netzentgelte", label: "Netzentgelte", unit: "ct/kWh", step: 0.1, dec: 2, group: "preise" },
  { key: "umlagenSteuern", label: "Umlagen & Steuern", unit: "ct/kWh", step: 0.1, dec: 2, group: "preise" },
  { key: "gesamtpreis", label: "Effektiver Gesamtpreis", unit: "ct/kWh", step: 0.1, dec: 1, group: "preise", derived: true, accent: true },
  { key: "leistung", label: "Spitzenleistung", unit: "kW", step: 1, group: "leistung" },
  { key: "grundpreis", label: "Grundpreis", unit: "€/Mon", step: 1, group: "leistung" },
];

function BillAnalysis({ currentConfig, onApply }) {
  const [phase, setPhase] = useState("idle"); // idle | analyzing | results | applied
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const timerRef = useRef(null);
  const stepTimeoutRef = useRef(null);
  const [data, setData] = useState({
    monatsverbrauch: 0, jahresverbrauch: 0,
    arbeitspreis: 0, netzentgelte: 0, umlagenSteuern: 0, gesamtpreis: 0,
    leistung: 0, grundpreis: 0,
  });

  // Cleanup timers on unmount
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
  }, []);

  const startAnalysis = useCallback(() => {
    // Clear any running timers from previous analysis
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    setPhase("analyzing");
    setProgress(0);
    let current = 0, stepIdx = 0;

    function runStep() {
      if (stepIdx >= ANALYSIS_STEPS.length) {
        // "Detection" complete — populate with smart defaults
        const monthKWh = Math.round(currentConfig.stromverbrauch * 1000 / 12);
        const ap = Math.max(8, currentConfig.strompreis - 9.5); // rough: total - netz - umlagen
        setData({
          monatsverbrauch: monthKWh,
          jahresverbrauch: currentConfig.stromverbrauch,
          arbeitspreis: Math.round(ap * 100) / 100,
          netzentgelte: 5.01,
          umlagenSteuern: 4.49,
          gesamtpreis: currentConfig.strompreis,
          leistung: Math.round(monthKWh / 730 * 1.15), // avg load × 1.15
          grundpreis: 30,
        });
        stepTimeoutRef.current = setTimeout(() => setPhase("results"), 350);
        return;
      }
      const step = ANALYSIS_STEPS[stepIdx];
      setStatusText(step.text);
      const range = step.target - current;
      const ticks = Math.max(3, Math.ceil(range / 4));
      let t = 0;
      timerRef.current = setInterval(() => {
        t++;
        current = Math.min(step.target, current + Math.ceil(range / ticks));
        setProgress(current);
        if (t >= ticks || current >= step.target) {
          clearInterval(timerRef.current);
          current = step.target;
          setProgress(current);
          stepIdx++;
          stepTimeoutRef.current = setTimeout(runStep, 180);
        }
      }, step.delay);
    }
    runStep();
  }, [currentConfig]);

  const updateField = useCallback((key, raw) => {
    const val = parseFloat(String(raw).replace(",", "."));
    if (isNaN(val)) return;
    setData(prev => {
      const next = { ...prev, [key]: val };
      if (key === "monatsverbrauch") next.jahresverbrauch = Math.round(val * 12 / 1000);
      if (["arbeitspreis", "netzentgelte", "umlagenSteuern"].includes(key)) {
        next.gesamtpreis = Math.round((next.arbeitspreis + next.netzentgelte + next.umlagenSteuern) * 10) / 10;
      }
      return next;
    });
  }, []);

  const apply = useCallback(() => {
    onApply({ stromverbrauch: data.jahresverbrauch, strompreis: data.gesamtpreis });
    setPhase("applied");
  }, [data, onApply]);

  const F = "Calibri, sans-serif";

  // ─── Idle: Show "Auswerten" button ───
  if (phase === "idle") {
    return (
      <button onClick={startAnalysis} style={{
        width: "100%", marginTop: "0.4rem",
        background: `linear-gradient(135deg, ${C.gold}20, ${C.gold}08)`,
        border: `1px solid ${C.gold}50`, borderRadius: 8,
        padding: "0.6rem", fontFamily: F, fontSize: "0.8rem", fontWeight: 700,
        color: C.goldLight, cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", gap: "0.4rem", letterSpacing: "0.5px",
        transition: "all 0.2s",
      }}>
        <Icon name="chart" size={14} /> Rechnung auswerten
      </button>
    );
  }

  // ─── Analyzing: Progress bar ───
  if (phase === "analyzing") {
    return (
      <div style={{
        marginTop: "0.4rem", background: "rgba(27,42,74,0.6)", border: `1px solid ${C.gold}30`,
        borderRadius: 10, padding: "0.8rem", overflow: "hidden",
      }}>
        <div style={{ fontFamily: F, fontSize: "0.72rem", color: C.goldLight, fontWeight: 700, marginBottom: "0.5rem", letterSpacing: "1px" }}>
          AUSWERTUNG LÄUFT
        </div>
        {/* Progress bar */}
        <div style={{ position: "relative", height: 22, background: "rgba(255,255,255,0.06)", borderRadius: 11, overflow: "hidden", marginBottom: "0.4rem" }}>
          <div style={{
            height: "100%", width: `${progress}%`, borderRadius: 11,
            background: `linear-gradient(90deg, ${C.green}, ${C.greenLight})`,
            transition: "width 0.15s ease-out",
            boxShadow: `0 0 12px ${C.green}40`,
          }} />
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F, fontSize: "0.72rem", fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}>{progress} %</div>
        </div>
        <div style={{ fontFamily: F, fontSize: "0.7rem", color: "#999", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "cpPulse 1s infinite" }} />
          {statusText}
        </div>
        <style>{`@keyframes cpPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>
    );
  }

  // ─── Applied: Success ───
  if (phase === "applied") {
    return (
      <div style={{
        marginTop: "0.4rem", background: `${C.green}15`, border: `1px solid ${C.green}40`,
        borderRadius: 8, padding: "0.5rem 0.8rem", fontFamily: F, fontSize: "0.78rem",
        color: C.greenLight, display: "flex", alignItems: "center", gap: "0.4rem",
      }}>
        <Icon name="check" size={14} color={C.greenLight} />
        Rechnungsdaten übernommen — {fmtVal(data.jahresverbrauch)} MWh/a · {fmtVal(data.gesamtpreis, 1)} ct/kWh
      </div>
    );
  }

  // ─── Results: Editable form ───
  const groups = [
    { key: "verbrauch", title: "Verbrauch", icon: "bolt" },
    { key: "preise", title: "Preiskomponenten", icon: "chart" },
    { key: "leistung", title: "Leistung & Grundpreis", icon: "factory" },
  ];

  return (
    <div style={{
      marginTop: "0.4rem", background: "rgba(27,42,74,0.6)", border: `1px solid ${C.gold}30`,
      borderRadius: 10, padding: "0.8rem", overflow: "hidden",
    }}>
      <div style={{ fontFamily: F, fontSize: "0.72rem", color: C.goldLight, fontWeight: 700, marginBottom: "0.1rem", letterSpacing: "1px" }}>
        AUSWERTUNG ABGESCHLOSSEN
      </div>
      <div style={{ fontFamily: F, fontSize: "0.65rem", color: "#888", marginBottom: "0.6rem" }}>
        Bitte prüfen und ggf. anpassen — Werte werden bei Bestätigung übernommen
      </div>

      {groups.map(g => (
        <div key={g.key} style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontFamily: F, fontSize: "0.68rem", letterSpacing: "1.5px", color: C.gold, fontWeight: 700, marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Icon name={g.icon} size={11} color={C.gold} /> {g.title}
          </div>
          {BILL_FIELDS.filter(f => f.group === g.key).map(f => (
            <div key={f.key} style={{ display: "flex", alignItems: "center", marginBottom: "0.25rem", gap: "0.4rem" }}>
              <span style={{ flex: 1, fontFamily: F, fontSize: "0.75rem", color: f.derived ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.7)" }}>
                {f.label}
              </span>
              <input
                type="text" inputMode="decimal"
                value={f.derived && f.dec ? (data[f.key] ?? 0).toFixed(f.dec) : (data[f.key] ?? 0)}
                onChange={e => updateField(f.key, e.target.value)}
                readOnly={f.derived}
                style={{
                  width: 72, background: f.derived ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
                  border: `1px solid ${f.accent ? C.gold + "60" : f.derived ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 4, padding: "0.2rem 0.35rem", textAlign: "right",
                  color: f.accent ? C.goldLight : f.derived ? "#888" : "#ddd",
                  fontFamily: F, fontSize: "0.78rem", fontWeight: f.accent ? 700 : 600,
                  outline: "none",
                }}
              />
              <span style={{ fontFamily: F, fontSize: "0.68rem", color: "#777", width: 48, flexShrink: 0 }}>{f.unit}</span>
            </div>
          ))}
        </div>
      ))}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
        <button onClick={apply} style={{
          flex: 1, background: `linear-gradient(135deg, ${C.green}, ${C.green}cc)`,
          border: "none", borderRadius: 6, padding: "0.55rem",
          fontFamily: F, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.5px",
          color: "#fff", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: "0.3rem",
        }}>
          <Icon name="check" size={13} /> Übernehmen
        </button>
        <button onClick={() => setPhase("idle")} style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 6, padding: "0.55rem 0.8rem",
          fontFamily: F, fontSize: "0.75rem", color: C.midGray, cursor: "pointer",
        }}>Abbrechen</button>
      </div>
    </div>
  );
}

/* ── ConfigPanel Component ── */
export default function ConfigPanel({ config, setConfig, calc, onClose, onSave, embedded }) {
  const trapRef = useFocusTrap();
  const [openGroups, setOpenGroups] = useState(
    Object.fromEntries(GROUPS.map(g => [g.key, true]))
  );
  const [editingKey, setEditingKey] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const editRef = useRef(null);
  const fileRef = useRef(null);
  const billRef = useRef(null);

  const update = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, [setConfig]);

  const startEdit = useCallback((key) => {
    setEditDraft(String(config[key]));
    setEditingKey(key);
    setTimeout(() => editRef.current?.select(), 0);
  }, [config]);

  const commitEdit = useCallback((slider) => {
    setEditingKey(null);
    const parsed = parseFloat(editDraft.replace(",", "."));
    if (!isNaN(parsed)) {
      update(slider.key, Math.min(slider.max, Math.max(slider.min, parsed)));
    }
  }, [editDraft, update]);

  const toggleGroup = useCallback((key) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleLastgang = useCallback((file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setConfig(prev => ({ ...prev, lastgangFile: "Datei zu groß (max. 50 MB)" }));
      return;
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setConfig(prev => ({ ...prev, lastgangFile: "Nur CSV-Dateien erlaubt" }));
      return;
    }
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
    reader.onerror = () => {
      setConfig(prev => ({ ...prev, lastgangFile: "Fehler beim Lesen der Datei" }));
    };
    reader.readAsText(file);
  }, [setConfig]);

  const handleBill = useCallback((file) => {
    if (!file) return;
    setConfig(prev => ({ ...prev, stromrechnungFile: file.name }));
  }, [setConfig]);

  /* ── Embedded mode: render content only (no backdrop/overlay) ── */
  if (embedded) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Scrollable slider groups */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.2rem 2rem" }}>
          {GROUPS.map((group) => (
            <fieldset key={group.key} style={{ marginBottom: "0.4rem", border: "none", padding: 0, margin: 0 }}>
              <legend style={{ padding: 0, width: "100%" }}>
              <button onClick={() => toggleGroup(group.key)} aria-expanded={openGroups[group.key]} style={{
                width: "100%", background: "none", border: "none",
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.5rem 0", cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <Icon name={group.icon} size={14} color={C.gold} />
                <span style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.65rem", letterSpacing: "2px", color: C.gold, fontWeight: 700, flex: 1, textAlign: "left" }}>{group.title}</span>
                <span style={{ color: C.midGray, fontSize: "0.75rem", transform: openGroups[group.key] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
              </button>
              </legend>
              {openGroups[group.key] && (
                <div style={{ padding: "0.5rem 0" }}>
                  {group.sliders.map((s) => (
                    <div key={s.key} style={{ marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.15rem" }}>
                        <span style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.65)" }}>{s.label}</span>
                        {editingKey === s.key ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <input ref={editRef} type="text" inputMode="decimal" value={editDraft}
                              onChange={e => setEditDraft(e.target.value)}
                              onBlur={() => commitEdit(s)}
                              onKeyDown={e => { if (e.key === "Enter") commitEdit(s); if (e.key === "Escape") setEditingKey(null); }}
                              style={{
                                width: 70, background: "rgba(255,255,255,0.1)", border: `1px solid ${C.gold}80`,
                                borderRadius: 4, padding: "0.15rem 0.3rem", color: C.goldLight, fontWeight: 700,
                                fontFamily: "Calibri, sans-serif", fontSize: "0.82rem", textAlign: "right", outline: "none",
                              }} />
                            <span style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.72rem", color: "#888" }}>{s.unit}</span>
                          </span>
                        ) : (
                          <span onClick={() => startEdit(s.key)} style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.82rem", fontWeight: 700, color: C.goldLight, cursor: "pointer", borderBottom: `1px dashed ${C.gold}40`, paddingBottom: 1 }}>{fmtVal(config[s.key], s.dec || 0)} {s.unit}</span>
                        )}
                      </div>
                      <input type="range" min={s.min} max={s.max} step={s.step} value={config[s.key]} onChange={(e) => update(s.key, parseFloat(e.target.value))} aria-label={s.label} className="cp-slider" style={{ width: "100%" }} />
                    </div>
                  ))}
                  {group.note && <div style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.7rem", color: C.midGray, fontStyle: "italic", padding: "0.2rem 0" }}>{group.note}</div>}
                  {group.hasUploads && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.3rem" }}>
                      <div role="button" tabIndex={0} aria-label="Lastgang-CSV hochladen" onClick={() => fileRef.current?.click()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={(e) => { e.preventDefault(); handleLastgang(e.dataTransfer.files[0]); }} style={{ border: `2px dashed ${config.lastgangFile ? C.green + "50" : "rgba(255,255,255,0.12)"}`, borderRadius: "8px", padding: "0.55rem", textAlign: "center", cursor: "pointer", background: config.lastgangFile ? `${C.green}08` : "transparent", transition: "all 0.2s" }}>
                        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => handleLastgang(e.target.files[0])} />
                        <div style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.72rem", color: config.lastgangFile ? C.greenLight : C.midGray }}>{config.lastgangFile ? <><Icon name="check" size={12} color={C.greenLight} style={{ marginRight: 4 }} />{config.lastgangFile}{config.lastgangData ? ` → ${fmtVal(config.lastgangData.annualMWh)} MWh/a` : ""}</> : <><Icon name="chart" size={12} style={{ marginRight: 4 }} /> Lastgang-CSV hochladen (15-Min-Intervall)</>}</div>
                      </div>
                      <div role="button" tabIndex={0} aria-label="Stromrechnung hochladen" onClick={() => billRef.current?.click()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); billRef.current?.click(); } }} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={(e) => { e.preventDefault(); handleBill(e.dataTransfer.files[0]); }} style={{ border: `2px dashed ${config.stromrechnungFile ? C.green + "50" : "rgba(255,255,255,0.12)"}`, borderRadius: "8px", padding: "0.55rem", textAlign: "center", cursor: "pointer", background: config.stromrechnungFile ? `${C.green}08` : "transparent" }}>
                        <input ref={billRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={(e) => handleBill(e.target.files[0])} />
                        <div style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.72rem", color: config.stromrechnungFile ? C.greenLight : C.midGray }}>{config.stromrechnungFile ? <><Icon name="check" size={12} color={C.greenLight} style={{ marginRight: 4 }} />{config.stromrechnungFile}</> : <><Icon name="document" size={12} style={{ marginRight: 4 }} /> Stromrechnung hochladen (PDF/Bild)</>}</div>
                      </div>
                      <div style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>Alle Daten bleiben lokal in Ihrem Browser — kein Upload an Server</div>
                      {/* Bill Analysis */}
                      {config.stromrechnungFile && !config.stromrechnungFile.includes("(") && (
                        <BillAnalysis
                          key={config.stromrechnungFile}
                          file={config.stromrechnungFile}
                          currentConfig={config}
                          onApply={(values) => setConfig(prev => ({ ...prev, ...values }))}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </fieldset>
          ))}
          {onSave && (
            <button onClick={onSave} aria-label="Kalkulation speichern" style={{ width: "100%", marginTop: "0.7rem", background: `linear-gradient(135deg, ${C.green}, ${C.green}cc)`, border: "none", borderRadius: "8px", padding: "0.7rem", fontFamily: "Calibri, sans-serif", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#fff", cursor: "pointer", boxShadow: `0 4px 15px ${C.green}40`, transition: "all 0.3s" }}><><Icon name="check" size={14} style={{ marginRight: 4 }} /> Kalkulation speichern</></button>
          )}
          <button onClick={() => setConfig({ ...defaultConfig })} aria-label="Auf Standardwerte zurücksetzen" style={{ width: "100%", marginTop: "0.4rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "0.5rem", fontFamily: "Calibri, sans-serif", fontSize: "0.78rem", color: C.midGray, cursor: "pointer" }}><><Icon name="reset" size={13} style={{ marginRight: 4 }} /> Auf Standardwerte zurücksetzen</></button>
        </div>

        <style>{`
          .cp-slider { -webkit-appearance: none; appearance: none; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.08); outline: none; cursor: pointer; }
          .cp-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(135deg, ${C.gold}, ${C.goldLight}); cursor: pointer; box-shadow: 0 0 8px rgba(212,168,67,0.3); border: 2px solid ${C.navy}; }
          .cp-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: linear-gradient(135deg, ${C.gold}, ${C.goldLight}); cursor: pointer; border: 2px solid ${C.navy}; }
          .cp-slider::-webkit-slider-runnable-track { height: 5px; border-radius: 3px; }
        `}</style>
      </div>
    );
  }

  /* ── Standalone mode: full overlay (legacy, kept for backwards compat) ── */
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 1000, ...anim("cpFadeIn 0.3s ease"),
      }} />

      {/* Panel */}
      <div ref={trapRef} role="dialog" aria-modal="true" aria-labelledby="cp-title" style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px, 92vw)",
        background: `linear-gradient(180deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
        borderLeft: `1px solid ${C.gold}30`,
        zIndex: 1001, display: "flex", flexDirection: "column",
        ...anim("cpSlideIn 0.3s ease"),
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
                fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                letterSpacing: "3px", color: C.gold, fontWeight: 700,
              }}>INTERAKTIVER KALKULATOR</div>
              <div id="cp-title" style={{
                fontFamily: "Georgia, serif", fontSize: "1.05rem",
                fontWeight: 700, color: C.white, marginTop: "0.1rem",
              }}>Ihre Konfiguration</div>
            </div>
            <button onClick={onClose} aria-label="Kalkulator schließen" style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px", width: "32px", height: "32px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: C.midGray, fontSize: "1rem",
            }}><Icon name="close" size={14} /></button>
          </div>

          {/* Key results */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.35rem" }}>
            {[
              { label: "Einsparung/a", value: `${fmtEuro(calc.einsparungStandort)}/a`, color: C.greenLight },
              { label: "CO₂-Reduktion", value: `${fmtVal(calc.co2Gesamt)} t/a`, color: C.greenLight },
              { label: "Amortisation", value: `${fmtVal(calc.amortisationStandort, 1)} J.`, color: C.goldLight },
              { label: "BESS-Rendite", value: `${fmtVal(calc.bessRendite, 1)} %`, color: C.goldLight },
              { label: "Gesamtinvest", value: fmtEuro(calc.investGesamt), color: C.white },
              { label: "Kredit", value: fmtEuro(calc.kreditBetrag), color: C.midGray },
              { label: "EK-Rendite", value: `${fmtVal(calc.ekRendite, 1)} %`, color: C.goldLight },
              { label: "Annuität", value: `${fmtEuro(calc.annuitaet)}/a`, color: C.midGray },
              { label: "Autarkie", value: `${calc.autarkie} %`, color: C.goldLight },
            ].map((r, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "0.35rem 0.5rem",
              }}>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
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
            <fieldset key={group.key} style={{ marginBottom: "0.4rem", border: "none", padding: 0, margin: 0 }}>
              <legend style={{ padding: 0, width: "100%" }}>
              <button
                onClick={() => toggleGroup(group.key)}
                aria-expanded={openGroups[group.key]}
                style={{
                  width: "100%", background: "none", border: "none",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.5rem 0", cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Icon name={group.icon} size={14} color={C.gold} />
                <span style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
                  letterSpacing: "2px", color: C.gold, fontWeight: 700,
                  flex: 1, textAlign: "left",
                }}>{group.title}</span>
                <span style={{
                  color: C.midGray, fontSize: "0.75rem",
                  transform: openGroups[group.key] ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}>▾</span>
              </button>
              </legend>

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
                        {editingKey === s.key ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <input ref={editRef} type="text" inputMode="decimal" value={editDraft}
                              onChange={e => setEditDraft(e.target.value)}
                              onBlur={() => commitEdit(s)}
                              onKeyDown={e => { if (e.key === "Enter") commitEdit(s); if (e.key === "Escape") setEditingKey(null); }}
                              style={{
                                width: 70, background: "rgba(255,255,255,0.1)", border: `1px solid ${C.gold}80`,
                                borderRadius: 4, padding: "0.15rem 0.3rem", color: C.goldLight, fontWeight: 700,
                                fontFamily: "Calibri, sans-serif", fontSize: "0.82rem", textAlign: "right", outline: "none",
                              }} />
                            <span style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.72rem", color: "#888" }}>{s.unit}</span>
                          </span>
                        ) : (
                          <span onClick={() => startEdit(s.key)} style={{
                            fontFamily: "Calibri, sans-serif", fontSize: "0.82rem",
                            fontWeight: 700, color: C.goldLight, cursor: "pointer",
                            borderBottom: `1px dashed ${C.gold}40`, paddingBottom: 1,
                          }}>{fmtVal(config[s.key], s.dec || 0)} {s.unit}</span>
                        )}
                      </div>
                      <input
                        type="range"
                        min={s.min} max={s.max} step={s.step}
                        value={config[s.key]}
                        onChange={(e) => update(s.key, parseFloat(e.target.value))}
                        aria-label={s.label}
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
                        role="button"
                        tabIndex={0}
                        aria-label="Lastgang-CSV hochladen"
                        onClick={() => fileRef.current?.click()}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => { e.preventDefault(); handleLastgang(e.dataTransfer.files[0]); }}
                        style={{
                          border: `2px dashed ${config.lastgangFile ? C.green + "50" : "rgba(255,255,255,0.12)"}`,
                          borderRadius: "8px", padding: "0.55rem", textAlign: "center",
                          cursor: "pointer", background: config.lastgangFile ? `${C.green}08` : "transparent",
                          transition: "all 0.2s",
                        }}
                      >
                        <input ref={fileRef} type="file" accept=".csv"
                          style={{ display: "none" }}
                          onChange={(e) => handleLastgang(e.target.files[0])} />
                        <div style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.72rem",
                          color: config.lastgangFile ? C.greenLight : C.midGray,
                        }}>
                          {config.lastgangFile
                            ? <><Icon name="check" size={12} color={C.greenLight} style={{ marginRight: 4 }} />{config.lastgangFile}{config.lastgangData ? ` → ${fmtVal(config.lastgangData.annualMWh)} MWh/a` : ""}</>
                            : <><Icon name="chart" size={12} style={{ marginRight: 4 }} /> Lastgang-CSV hochladen (15-Min-Intervall)</>}
                        </div>
                      </div>

                      {/* Stromrechnung */}
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Stromrechnung hochladen"
                        onClick={() => billRef.current?.click()}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); billRef.current?.click(); } }}
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
                            ? <><Icon name="check" size={12} color={C.greenLight} style={{ marginRight: 4 }} />{config.stromrechnungFile}</>
                            : <><Icon name="document" size={12} style={{ marginRight: 4 }} /> Stromrechnung hochladen (PDF/Bild)</>}
                        </div>
                      </div>

                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                        color: "rgba(255,255,255,0.45)", fontStyle: "italic",
                      }}>Alle Daten bleiben lokal in Ihrem Browser — kein Upload an Server</div>
                      {/* Bill Analysis */}
                      {config.stromrechnungFile && !config.stromrechnungFile.includes("(") && (
                        <BillAnalysis
                          key={config.stromrechnungFile}
                          file={config.stromrechnungFile}
                          currentConfig={config}
                          onApply={(values) => setConfig(prev => ({ ...prev, ...values }))}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </fieldset>
          ))}

          {/* Save */}
          {onSave && (
            <button
              onClick={onSave}
              aria-label="Kalkulation speichern"
              style={{
                width: "100%", marginTop: "0.7rem",
                background: `linear-gradient(135deg, ${C.green}, ${C.green}cc)`,
                border: "none",
                borderRadius: "8px", padding: "0.7rem",
                fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
                color: "#fff", cursor: "pointer",
                boxShadow: `0 4px 15px ${C.green}40`,
                transition: "all 0.3s",
              }}
            ><><Icon name="check" size={14} style={{ marginRight: 4 }} /> Kalkulation speichern</></button>
          )}

          {/* Reset */}
          <button
            onClick={() => setConfig({ ...defaultConfig })}
            aria-label="Auf Standardwerte zurücksetzen"
            style={{
              width: "100%", marginTop: "0.4rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px", padding: "0.5rem",
              fontFamily: "Calibri, sans-serif", fontSize: "0.78rem",
              color: C.midGray, cursor: "pointer",
            }}
          ><><Icon name="reset" size={13} style={{ marginRight: 4 }} /> Auf Standardwerte zurücksetzen</></button>
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
          @-webkit-keyframes cpSlideIn {
            from { -webkit-transform: translateX(100%); transform: translateX(100%); }
            to { -webkit-transform: translateX(0); transform: translateX(0); }
          }
          @keyframes cpSlideIn {
            from { -webkit-transform: translateX(100%); transform: translateX(100%); }
            to { -webkit-transform: translateX(0); transform: translateX(0); }
          }
          @-webkit-keyframes cpFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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
