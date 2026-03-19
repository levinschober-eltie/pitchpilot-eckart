import { useState, useRef, useCallback } from "react";
import { Icon } from "./Icons";
import { C, anim } from "./colors";
import { defaultConfig, fmtEuro, fmtVal } from "./calcEngine";
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
    note: "Bestand Freifläche: 2,0 MWp (bereits installiert)",
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
    const sep = lines[0].includes(";") ? ";" : ",";
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

/* ── ConfigPanel Component ── */
export default function ConfigPanel({ config, setConfig, calc, onClose, onSave, embedded }) {
  const trapRef = useFocusTrap();
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
                <span style={{ color: C.midGray, fontSize: "0.75rem", transform: openGroups[group.key] ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
              </button>
              </legend>
              {openGroups[group.key] && (
                <div style={{ padding: "0.5rem 0" }}>
                  {group.sliders.map((s) => (
                    <div key={s.key} style={{ marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.15rem" }}>
                        <span style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.65)" }}>{s.label}</span>
                        <span style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.82rem", fontWeight: 700, color: C.goldLight }}>{fmtVal(config[s.key], s.dec || 0)} {s.unit}</span>
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
                  transform: openGroups[group.key] ? "rotate(180deg)" : "none",
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
