import { useState, useEffect, useRef } from "react";

const C = {
  navy: "#1B2A4A",
  navyLight: "#253757",
  navyMid: "#1E3050",
  green: "#2D6A4F",
  greenLight: "#3A8A66",
  gold: "#D4A843",
  goldLight: "#E8C97A",
  goldDim: "#B8923A",
  warmWhite: "#F5F5F0",
  lightGray: "#EAEAE5",
  midGray: "#9A9A90",
  darkText: "#2B2B2B",
  white: "#FFFFFF",
};

const phases = [
  {
    num: "I",
    title: "Analyse & Bewertung",
    subtitle: "Das Fundament",
    months: "Monat 1–3",
    color: C.gold,
    headline: "Ohne belastbare Daten keine belastbaren Entscheidungen",
    description: "Bevor ein Euro investiert wird, muss der Standort vollständig verstanden werden. Satellitenanalyse liefert den Rahmen – Vor-Ort-Vermessung liefert die Fakten.",
    results: [
      "Vermessungsdaten aller Gebäude und Flächen",
      "Dachgutachten mit Sanierungsplan",
      "Lastprofil 15-Min-Intervall (12 Monate)",
      "Abwärmekartierung mit Temperaturprofilen",
      "Wirtschaftlichkeitsmodell auf Basis realer Daten",
    ],
    kpis: [
      { label: "Gebäudefläche", value: "25.000+ m²" },
      { label: "PV-Potenzial", value: "3,7–6,9 MWp" },
      { label: "Cluster", value: "A–E kartiert" },
      { label: "110-kV", value: "Dokumentiert" },
    ],
    icon: "🔍",
  },
  {
    num: "II",
    title: "Gebäudehülle & PV",
    subtitle: "Das physische Fundament",
    months: "Monat 4–12",
    color: C.green,
    headline: "Belastbare Gebäude, produktive Flächen",
    description: "Erst die Hülle, dann die PV. Dachsanierung + PV als integriertes 30-Jahres-Investment. Drei Erzeugungsarten ergänzen sich jahreszeitlich.",
    results: [
      "Dachsanierung priorisierter Cluster",
      "Dach-PV in Betrieb (2,4–4,4 MWp)",
      "Fassaden-PV Süd/SW (0,45–0,9 MWp)",
      "Carport-Planung / Bau begonnen",
      "Eigenverbrauch bereits >50 %",
    ],
    kpis: [
      { label: "Dach-PV", value: "2,4–4,4 MWp" },
      { label: "Fassaden-PV", value: "0,45–0,9 MWp" },
      { label: "Carport-PV", value: "0,8–1,6 MWp" },
      { label: "Erzeugung", value: "3.100–5.900 MWh/a" },
    ],
    icon: "🏗️",
  },
  {
    num: "III",
    title: "Speicher & Steuerung",
    subtitle: "Vom Erzeuger zum steuerbaren System",
    months: "Monat 10–18",
    color: C.green,
    headline: "Der Unterschied zwischen Erzeugung und Kontrolle",
    description: "BESS + Peak Shaving + EMS verwandeln PV-Erzeugung in ein steuerbares System. Im Sommer Eigenverbrauch optimieren, im Winter den Spotmarkt nutzen.",
    results: [
      "BESS in Betrieb (Dimensionierung aus Lastprofil)",
      "Peak Shaving aktiv (10–15 % Reduktion)",
      "Spotmarkt-Strategie Winter implementiert",
      "EMS steuert alle Energieflüsse in Echtzeit",
    ],
    kpis: [
      { label: "Eigenverbrauch", value: ">75 %" },
      { label: "Peak Shaving", value: "10–15 %" },
      { label: "Wintereinkauf", value: "30–40 % günstiger" },
      { label: "Steuerung", value: "Echtzeit" },
    ],
    icon: "⚡",
  },
  {
    num: "IV",
    title: "Wärmekonzept",
    subtitle: "Die thermische Lücke schließen",
    months: "Monat 15–24",
    color: C.goldDim,
    headline: "Strom und Wärme als ein System",
    description: "Die Wärmepumpe nutzt Prozessabwärme als Quellenergie und PV-Strom als Antrieb. COP 4–5 statt 2,5–3. Jede kWh Strom erzeugt 4–5 kWh Wärme.",
    results: [
      "Wärmepumpe in Betrieb (Abwärme als Quelle)",
      "Strom-Wärme-Kopplung über EMS gesteuert",
      "Fossile Wärmeversorgung reduziert / ersetzt",
      "Gebäudehülle + WP = minimaler Wärmebedarf",
    ],
    kpis: [
      { label: "COP", value: "4–5" },
      { label: "vs. Gas", value: "~25–35 % Kosten" },
      { label: "Quelle", value: "Prozessabwärme" },
      { label: "Antrieb", value: "Eigener PV-Strom" },
    ],
    icon: "🔥",
  },
  {
    num: "V",
    title: "Graustrom-BESS",
    subtitle: "Der eigenständige Werttreiber",
    months: "Monat 18–30+",
    color: C.navy,
    headline: "Ein eigenständiges Geschäftsmodell am 110-kV-Netz",
    description: "Die 110-kV-Anbindung ermöglicht ein Großspeicher-Projekt mit separater Wirtschaftlichkeit. Drei Erlösströme aus einem Asset – unabhängig von der Standortoptimierung.",
    results: [
      "Arbitrage: Laden bei 2–5 ct, entladen bei Peak",
      "Regelenergie (FCR / aFRR): Reaktionszeit < 1s",
      "Redispatch / Netzdienstleistungen",
      "Separate Projektfinanzierung möglich",
    ],
    kpis: [
      { label: "Erlösquellen", value: "3" },
      { label: "Netzanschluss", value: "110 kV" },
      { label: "Spread", value: "5–15 ct/kWh" },
      { label: "Finanzierung", value: "Separater BC" },
    ],
    icon: "🏭",
  },
  {
    num: "✦",
    title: "Gesamtergebnis",
    subtitle: "Eine neue Ausgangslage",
    months: "Vollausbau",
    color: C.gold,
    headline: "Energieversorgung wird Wettbewerbsvorteil – oder bleibt Risikofaktor",
    description: "Fünf Phasen. Ein System. Der Standort wird nicht nur effizienter – er wird strategisch stärker. Von der Energiekostenposition zur Energieplattform.",
    isFinal: true,
    levers: [
      { icon: "⚡", title: "Reduktion externer Strombezug", desc: "Direkte Kostenentlastung durch Eigenerzeugung" },
      { icon: "📉", title: "Lastspitzenreduktion", desc: "10–15 % Peak Shaving → Leistungspreis-Senkung" },
      { icon: "♻️", title: "Bessere Nutzung eigener Energie", desc: "Strom und Wärme bleiben im Standort" },
      { icon: "🏠", title: "Geringere Wärmeverluste", desc: "Weniger Betriebskosten durch Dämmung" },
      { icon: "🎯", title: "Aktive Steuerbarkeit", desc: "Echtzeitoptimierung statt passiver Verbrauch" },
      { icon: "🛡️", title: "Geringere Marktexponierung", desc: "Weniger Abhängigkeit von Börsenpreisen" },
    ],
    systemKpis: [
      { label: "PV-Erzeugung", value: "3,7–6,9 MWp", sub: "Dach + Fassade + Carport" },
      { label: "Eigenverbrauch", value: ">75 %", sub: "Mit BESS-Optimierung" },
      { label: "Peak Shaving", value: "10–15 %", sub: "Leistungspreissenkung" },
      { label: "Wärme-COP", value: "4–5", sub: "Abwärme-WP + PV-Strom" },
      { label: "Wintereinkauf", value: "30–40 %", sub: "Günstiger durch Spotmarkt" },
      { label: "Erlösströme", value: "3", sub: "Arbitrage · FCR · Redispatch" },
    ],
    pillars: [
      { label: "Eigenerzeugung", phase: "II", icon: "☀️" },
      { label: "Steuerbarkeit", phase: "III", icon: "⚡" },
      { label: "Wärmeautarkie", phase: "IV", icon: "🔥" },
      { label: "Ertragsmodell", phase: "V", icon: "🏭" },
    ],
    results: [],
    kpis: [],
    icon: "🏆",
  },
];

const cumulative = [
  "Belastbare Datenbasis",
  "Eigenerzeugung aktiv",
  "Steuerbarkeit erreicht",
  "Thermisch unabhängig",
  "Eigenständiges Ertragsmodell",
  "Strategischer Standortvorteil",
];

export default function EckartTimeline() {
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [active]);

  const phase = phases[active];

  const handleSliderInteraction = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(pct * (phases.length - 1));
    setActive(idx);
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      handleSliderInteraction(clientX);
    };
    const onUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging]);

  const sliderPct = (active / (phases.length - 1)) * 100;

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(170deg, ${C.navy} 0%, ${C.navyMid} 40%, ${C.navyLight} 100%)`,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: C.white,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Subtle grid pattern overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: `linear-gradient(${C.gold} 1px, transparent 1px), linear-gradient(90deg, ${C.gold} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Header */}
      <header style={{
        padding: "2rem 2rem 1rem",
        position: "relative",
        zIndex: 2,
      }}>
        <div style={{
          display: "flex", alignItems: "baseline", gap: "0.75rem",
          flexWrap: "wrap",
        }}>
          <span style={{
            fontSize: "0.65rem", fontFamily: "Calibri, sans-serif",
            letterSpacing: "4px", textTransform: "uppercase", color: C.gold,
            fontWeight: 700,
          }}>ECKART WERKE</span>
          <span style={{
            width: "40px", height: "1px", background: C.gold,
            display: "inline-block", verticalAlign: "middle",
          }} />
          <span style={{
            fontSize: "0.65rem", fontFamily: "Calibri, sans-serif",
            letterSpacing: "2px", textTransform: "uppercase", color: C.midGray,
          }}>Energietransformation</span>
        </div>
        <h1 style={{
          fontSize: "clamp(1.5rem, 4vw, 2.4rem)", fontWeight: 700,
          margin: "0.6rem 0 0", lineHeight: 1.2,
          background: `linear-gradient(135deg, ${C.white} 0%, ${C.goldLight} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Phasenkonzept zur Energietransformation
        </h1>
      </header>

      {/* Timeline Slider */}
      <div style={{ padding: "1rem 2rem 0.5rem", position: "relative", zIndex: 2 }}>
        {/* Phase dots row */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginBottom: "0.5rem", padding: "0 0.5rem",
        }}>
          {phases.map((p, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "0.3rem", padding: "0.25rem 0.5rem",
                transition: "all 0.3s ease",
                opacity: i <= active ? 1 : 0.4,
              }}
            >
              <span style={{
                fontSize: i === active ? "1.6rem" : "1rem",
                transition: "all 0.3s ease",
                filter: i === active ? "none" : "grayscale(0.5)",
              }}>{p.icon}</span>
              <span style={{
                fontFamily: "Calibri, sans-serif",
                fontSize: "0.6rem", letterSpacing: "1.5px",
                textTransform: "uppercase", fontWeight: 700,
                color: i === active ? C.gold : C.midGray,
                transition: "color 0.3s ease",
                whiteSpace: "nowrap",
              }}>{p.num}</span>
            </button>
          ))}
        </div>

        {/* Slider track */}
        <div
          ref={sliderRef}
          onMouseDown={(e) => { setIsDragging(true); handleSliderInteraction(e.clientX); }}
          onTouchStart={(e) => { setIsDragging(true); handleSliderInteraction(e.touches[0].clientX); }}
          style={{
            position: "relative", height: "6px", borderRadius: "3px",
            background: `rgba(255,255,255,0.08)`,
            cursor: "pointer", margin: "0 0.5rem",
          }}
        >
          {/* Filled track */}
          <div style={{
            position: "absolute", left: 0, top: 0, height: "100%",
            width: `${sliderPct}%`, borderRadius: "3px",
            background: `linear-gradient(90deg, ${C.gold}, ${C.green})`,
            transition: isDragging ? "none" : "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }} />

          {/* Phase markers */}
          {phases.map((p, i) => {
            const pct = (i / (phases.length - 1)) * 100;
            return (
              <div key={i} style={{
                position: "absolute", left: `${pct}%`, top: "50%",
                transform: "translate(-50%, -50%)",
                width: i === active ? "16px" : "8px",
                height: i === active ? "16px" : "8px",
                borderRadius: "50%",
                background: i <= active ? C.gold : "rgba(255,255,255,0.2)",
                border: i === active ? `2px solid ${C.white}` : "none",
                transition: "all 0.3s ease",
                boxShadow: i === active ? `0 0 12px ${C.gold}80` : "none",
              }} />
            );
          })}

          {/* Thumb */}
          <div style={{
            position: "absolute", left: `${sliderPct}%`, top: "50%",
            transform: "translate(-50%, -50%)",
            width: "28px", height: "28px", borderRadius: "50%",
            background: C.navy,
            border: `3px solid ${C.gold}`,
            boxShadow: `0 0 20px ${C.gold}40, 0 2px 8px rgba(0,0,0,0.3)`,
            transition: isDragging ? "none" : "left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "grab",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.65rem", fontWeight: 700, color: C.gold,
            fontFamily: "Georgia, serif",
          }}>
            {phase.num}
          </div>
        </div>

        {/* Month labels */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "0.4rem 0.5rem 0", fontFamily: "Calibri, sans-serif",
          fontSize: "0.55rem", color: C.midGray, letterSpacing: "0.5px",
        }}>
          {phases.map((p, i) => (
            <span key={i} style={{
              textAlign: "center", minWidth: "60px",
              color: i === active ? C.goldLight : C.midGray,
              fontWeight: i === active ? 700 : 400,
              transition: "all 0.3s ease",
            }}>{p.months}</span>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div key={animKey} style={{
        padding: "1rem 2rem 2rem",
        position: "relative", zIndex: 2,
        animation: "fadeSlideIn 0.5s ease forwards",
      }}>
        {/* Phase Title Block */}
        <div style={{
          display: "flex", alignItems: "center", gap: "1rem",
          marginBottom: "1rem",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: phase.isFinal
              ? `linear-gradient(135deg, ${C.gold}40, ${C.green}30)`
              : `linear-gradient(135deg, ${phase.color}30, ${phase.color}10)`,
            border: `2px solid ${phase.isFinal ? C.gold : phase.color + "60"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", flexShrink: 0,
            boxShadow: phase.isFinal ? `0 0 24px ${C.gold}30` : "none",
          }}>
            {phase.icon}
          </div>
          <div>
            <div style={{
              fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
              letterSpacing: "3px", textTransform: "uppercase",
              color: C.gold, fontWeight: 700, marginBottom: "0.15rem",
            }}>{phase.isFinal ? "Gesamtergebnis" : `Phase ${phase.num}`} · {phase.subtitle}</div>
            <h2 style={{
              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
              fontWeight: 700, margin: 0, lineHeight: 1.15,
              background: phase.isFinal ? `linear-gradient(135deg, ${C.white}, ${C.goldLight})` : "none",
              WebkitBackgroundClip: phase.isFinal ? "text" : "unset",
              WebkitTextFillColor: phase.isFinal ? "transparent" : "inherit",
            }}>{phase.title}</h2>
          </div>
        </div>

        {/* Headline Quote */}
        <div style={{
          borderLeft: `3px solid ${C.gold}`,
          paddingLeft: "1rem",
          marginBottom: "1.25rem",
        }}>
          <p style={{
            fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
            fontStyle: "italic", color: C.goldLight,
            margin: 0, lineHeight: 1.5,
          }}>
            „{phase.headline}"
          </p>
        </div>

        {/* Description */}
        <p style={{
          fontFamily: "Calibri, sans-serif",
          fontSize: "0.85rem", color: "rgba(255,255,255,0.75)",
          lineHeight: 1.65, marginBottom: "1.25rem", maxWidth: "700px",
        }}>
          {phase.description}
        </p>

        {/* === FINAL RESULT SPECIAL LAYOUT === */}
        {phase.isFinal ? (
          <>
            {/* System KPIs - 6 big numbers */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{
                fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                letterSpacing: "3px", textTransform: "uppercase",
                color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
              }}>SYSTEMKENNZAHLEN IM VOLLAUSBAU</div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "0.5rem",
              }}>
                {phase.systemKpis.map((kpi, i) => (
                  <div key={i} style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
                    border: `1px solid ${C.gold}20`,
                    borderRadius: "10px", padding: "0.75rem 0.8rem",
                    animation: `fadeSlideIn 0.4s ease ${i * 0.07}s both`,
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", top: 0, left: 0, width: "100%", height: "2px",
                      background: `linear-gradient(90deg, ${C.gold}60, ${C.green}40, transparent)`,
                    }} />
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.5rem",
                      letterSpacing: "1px", textTransform: "uppercase",
                      color: C.midGray, marginBottom: "0.3rem",
                    }}>{kpi.label}</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.15rem",
                      fontWeight: 700, color: C.goldLight, lineHeight: 1.1,
                    }}>{kpi.value}</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                      color: "rgba(255,255,255,0.45)", marginTop: "0.2rem",
                    }}>{kpi.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6 Economic Levers */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{
                fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                letterSpacing: "3px", textTransform: "uppercase",
                color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
              }}>SECHS HEBEL · EIN SYSTEM · EINE STEUERUNG</div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "0.5rem",
              }}>
                {phase.levers.map((l, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: "0.6rem",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px", padding: "0.65rem 0.75rem",
                    animation: `fadeSlideIn 0.4s ease ${0.3 + i * 0.06}s both`,
                  }}>
                    <span style={{
                      fontSize: "1.1rem", flexShrink: 0, marginTop: "0.05rem",
                      width: "28px", height: "28px", borderRadius: "6px",
                      background: `rgba(255,255,255,0.04)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{l.icon}</span>
                    <div>
                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.8rem",
                        fontWeight: 700, color: C.white, marginBottom: "0.1rem",
                      }}>{l.title}</div>
                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                        color: "rgba(255,255,255,0.55)", lineHeight: 1.35,
                      }}>{l.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transformation Pillars */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{
                fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                letterSpacing: "3px", textTransform: "uppercase",
                color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
              }}>VOM ENERGIEVERBRAUCHER ZUR ENERGIEPLATTFORM</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                {phase.pillars.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    animation: `fadeSlideIn 0.4s ease ${0.5 + i * 0.1}s both`,
                  }}>
                    <div style={{
                      background: `linear-gradient(135deg, ${C.green}30, ${C.navy})`,
                      border: `1px solid ${C.green}40`,
                      borderRadius: "10px", padding: "0.55rem 0.85rem",
                      display: "flex", alignItems: "center", gap: "0.4rem",
                    }}>
                      <span style={{ fontSize: "0.9rem" }}>{p.icon}</span>
                      <div>
                        <div style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.75rem",
                          fontWeight: 700, color: C.white,
                        }}>{p.label}</div>
                        <div style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.5rem",
                          color: C.midGray, letterSpacing: "1px",
                        }}>PHASE {p.phase}</div>
                      </div>
                    </div>
                    {i < phase.pillars.length - 1 && (
                      <span style={{ color: C.gold, fontSize: "0.9rem", opacity: 0.5 }}>→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{
              background: `linear-gradient(135deg, ${C.green}15, ${C.gold}10)`,
              border: `1px solid ${C.gold}30`,
              borderRadius: "10px", padding: "1rem 1.25rem",
              display: "flex", alignItems: "center", gap: "0.75rem",
              animation: "fadeSlideIn 0.5s ease 0.8s both",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: `${C.green}30`, border: `1px solid ${C.green}50`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", flexShrink: 0,
              }}>→</div>
              <div>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                  fontWeight: 700, color: C.white,
                }}>Nächster Schritt: Standortanalyse und Wirtschaftlichkeitsbewertung</div>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.5)", marginTop: "0.15rem",
                }}>Die Entscheidung liegt nicht zwischen Investition und Abwarten. Sie liegt zwischen Handeln und Exponiertsein.</div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* === NORMAL PHASE LAYOUT === */}
            {/* Two column: KPIs + Results */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}>
              {/* KPI Cards */}
              <div>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
                }}>KENNZAHLEN</div>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem",
                }}>
                  {phase.kpis.map((kpi, i) => (
                    <div key={i} style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px", padding: "0.7rem 0.8rem",
                      animation: `fadeSlideIn 0.4s ease ${i * 0.08}s both`,
                    }}>
                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                        letterSpacing: "1px", textTransform: "uppercase",
                        color: C.midGray, marginBottom: "0.25rem",
                      }}>{kpi.label}</div>
                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "1.05rem",
                        fontWeight: 700, color: C.goldLight,
                      }}>{kpi.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
                }}>ERGEBNISSE</div>
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px", padding: "0.8rem",
                }}>
                  {phase.results.map((r, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: "0.5rem",
                      padding: "0.35rem 0",
                      borderBottom: i < phase.results.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      animation: `fadeSlideIn 0.4s ease ${i * 0.06}s both`,
                    }}>
                      <span style={{
                        color: C.green, fontSize: "0.8rem", marginTop: "0.05rem", flexShrink: 0,
                      }}>✓</span>
                      <span style={{
                        fontFamily: "Calibri, sans-serif",
                        fontSize: "0.8rem", color: "rgba(255,255,255,0.8)",
                        lineHeight: 1.4,
                      }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Cumulative Progress */}
        <div style={{
          marginTop: "1.25rem",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "8px", padding: "0.8rem 1rem",
        }}>
          <div style={{
            fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
            letterSpacing: "3px", textTransform: "uppercase",
            color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
          }}>KUMULIERTE WIRKUNG</div>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "0.4rem",
          }}>
            {cumulative.map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "0.35rem",
                padding: "0.3rem 0.65rem", borderRadius: "20px",
                fontSize: "0.7rem", fontFamily: "Calibri, sans-serif",
                fontWeight: 600,
                background: i <= active
                  ? `linear-gradient(135deg, ${C.green}25, ${C.green}10)`
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${i <= active ? C.green + "40" : "rgba(255,255,255,0.05)"}`,
                color: i <= active ? C.greenLight : C.midGray,
                transition: "all 0.4s ease",
              }}>
                <span style={{ fontSize: "0.6rem" }}>{i <= active ? "✓" : "○"}</span>
                <span>{["Nach I", "Nach II", "Nach III", "Nach IV", "Nach V", "Gesamt"][i]}: {c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: "1rem 2rem",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "0.5rem",
        fontFamily: "Calibri, sans-serif", fontSize: "0.6rem", color: C.midGray,
        position: "relative", zIndex: 2,
      }}>
        <span>ECKART GmbH · Güntersthal 4, 91235 Hartenstein</span>
        <span style={{ fontStyle: "italic" }}>Energiewirtschaftliche Konzeptbegleitung: Elite PV</span>
      </footer>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; }
        button:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }
        @media (max-width: 600px) {
          header, footer, .content { padding-left: 1rem !important; padding-right: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
