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
    description: "Am Standort sind bereits ~2 MWp Freiflächen-PV in Betrieb – eine solide Ausgangsbasis. Die Analyse bewertet, wie dieser Bestand in ein Gesamtsystem integriert und das volle Potenzial von Dach, Fassade und Carport erschlossen werden kann.",
    results: [
      "Bestandsaufnahme: 2 MWp Freiflächen-PV dokumentiert",
      "Vermessungsdaten aller Gebäude und Flächen",
      "Dachgutachten mit Sanierungsplan",
      "Lastprofil 15-Min-Intervall (12 Monate)",
      "Abwärmekartierung mit Temperaturprofilen",
      "Wirtschaftlichkeitsmodell auf Basis realer Daten",
    ],
    kpis: [
      { label: "Bestand PV", value: "~2 MWp" },
      { label: "Zusatz-Potenzial", value: "3,7–6,9 MWp" },
      { label: "Gebäudefläche", value: "25.000+ m²" },
      { label: "110-kV", value: "Dokumentiert" },
    ],
    investment: [
      { label: "Standortanalyse & Gutachten", range: "50–80 T€" },
    ],
    investTotal: "50–80 T€",
    roi: "Entscheidungsgrundlage für alle Folgeinvestitionen",
    roiValue: "~2.000 MWh/a bereits erzeugt",
    independenceScore: 15,
    independenceLabel: "Bestand + Datenbasis",
    icon: "🔍",
  },
  {
    num: "II",
    title: "Gebäudehülle & PV",
    subtitle: "Das physische Fundament",
    months: "Monat 4–12",
    color: C.green,
    headline: "Belastbare Gebäude, produktive Flächen",
    description: "Aufbauend auf den bestehenden 2 MWp Freiflächen-PV wird das Erzeugungsportfolio um Dach, Fassade und Carport erweitert. Vier Erzeugungsarten ergänzen sich jahreszeitlich – das ist ein Standortvorteil.",
    results: [
      "Dachsanierung priorisierter Cluster",
      "Dach-PV in Betrieb (2,4–4,4 MWp)",
      "Fassaden-PV Süd/SW (0,45–0,9 MWp)",
      "Carport-Planung / Bau begonnen",
      "Gesamt inkl. Bestand: 5,7–8,9 MWp",
      "Eigenverbrauch bereits >60 %",
    ],
    kpis: [
      { label: "Neu: Dach-PV", value: "2,4–4,4 MWp" },
      { label: "Neu: Fassade", value: "0,45–0,9 MWp" },
      { label: "Neu: Carport", value: "0,8–1,6 MWp" },
      { label: "Gesamt PV", value: "5,7–8,9 MWp" },
    ],
    investment: [
      { label: "Dach-PV (450–850 €/kWp)", range: "1,1–3,7 Mio €" },
      { label: "Fassaden-PV (450–850 €/kWp)", range: "200–765 T€" },
      { label: "Carport-PV (1.200 €/kWp)", range: "960 T€–1,9 Mio €" },
    ],
    investTotal: "2,3–6,4 Mio €",
    roi: "Strombezugskosten-Reduktion durch erweitertes Portfolio",
    roiValue: ">60 % Eigenverbrauch",
    independenceScore: 45,
    independenceLabel: "Erweitertes Erzeugungsportfolio",
    icon: "🏗️",
  },
  {
    num: "III",
    title: "Speicher & Steuerung",
    subtitle: "Vom Erzeuger zum steuerbaren System",
    months: "Monat 10–18",
    color: C.green,
    headline: "Der Unterschied zwischen Erzeugung und Kontrolle",
    description: "Mit 5,7–8,9 MWp Gesamtleistung wird Steuerbarkeit zum entscheidenden Faktor. BESS + Peak Shaving + EMS verwandeln die PV-Erzeugung in ein steuerbares System. Im Sommer Eigenverbrauch optimieren, im Winter den Spotmarkt nutzen.",
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
    investment: [
      { label: "BESS (150–200 €/kWh)", range: "300–800 T€" },
      { label: "EMS & Integration", range: "80–150 T€" },
    ],
    investTotal: "380 T€–1,0 Mio €",
    roi: "Peak Shaving + Spotmarkt-Optimierung",
    roiValue: "10–15 % Leistungspreis-Senkung",
    independenceScore: 65,
    independenceLabel: "Steuerbarkeit erreicht",
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
    investment: [
      { label: "Industrie-Wärmepumpe", range: "150–300 T€" },
      { label: "Verrohrung & Integration", range: "50–100 T€" },
    ],
    investTotal: "200–400 T€",
    roi: "Gaskosten-Reduktion durch Abwärme-Nutzung",
    roiValue: "65–75 % weniger Gaskosten",
    independenceScore: 80,
    independenceLabel: "Thermisch unabhängig",
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
      { label: "Anschlussleistung", value: "100 MW" },
      { label: "Speicherkapazität", value: "200 MWh" },
      { label: "Spread", value: "5–15 ct/kWh" },
      { label: "Erlösquellen", value: "3" },
    ],
    investment: [
      { label: "BESS 200 MWh (150–200 €/kWh)", range: "30–40 Mio €" },
      { label: "Netzanbindung & Leistungselektronik", range: "5–8 Mio €" },
    ],
    investTotal: "35–48 Mio €",
    roi: "Eigenständiges Ertragsmodell mit drei Erlösströmen",
    roiValue: "15–25 % p.a.",
    independenceScore: 92,
    independenceLabel: "Eigenständiges Ertragsmodell",
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
      { label: "Gesamt-PV", value: "5,7–8,9 MWp", sub: "Bestand 2 MWp + Dach + Fassade + Carport" },
      { label: "Erzeugung", value: "5.100–7.900 MWh/a", sub: "Vier Erzeugungsarten kombiniert" },
      { label: "Eigenverbrauch", value: ">80 %", sub: "Mit BESS-Optimierung" },
      { label: "Wärme-COP", value: "4–5", sub: "Abwärme-WP + PV-Strom" },
      { label: "BESS Utility", value: "100 MW / 200 MWh", sub: "Eigenständiger Werttreiber" },
      { label: "Erlösströme", value: "3", sub: "Arbitrage · FCR · Redispatch" },
    ],
    pillars: [
      { label: "Eigenerzeugung", phase: "II", icon: "☀️" },
      { label: "Steuerbarkeit", phase: "III", icon: "⚡" },
      { label: "Wärmeautarkie", phase: "IV", icon: "🔥" },
      { label: "Ertragsmodell", phase: "V", icon: "🏭" },
    ],
    investmentSummary: [
      { phase: "—", label: "Bestand Freiflächen-PV", range: "~2 MWp (bereits realisiert)", roi: "~2.000 MWh/a", maxMio: 0, score: 15 },
      { phase: "I", label: "Analyse & Bewertung", range: "50–80 T€", roi: "Entscheidungsgrundlage", maxMio: 0.08, score: 15 },
      { phase: "II", label: "Gebäudehülle & PV", range: "2,3–6,4 Mio €", roi: ">60 % Eigenverbrauch", maxMio: 6.4, score: 45 },
      { phase: "III", label: "Speicher & Steuerung", range: "380 T€–1,0 Mio €", roi: "10–15 % Peak Shaving", maxMio: 1.0, score: 65 },
      { phase: "IV", label: "Wärmekonzept", range: "200–400 T€", roi: "65–75 % weniger Gas", maxMio: 0.4, score: 80 },
      { phase: "V", label: "Graustrom-BESS", range: "35–48 Mio €", roi: "15–25 % p.a.", maxMio: 48, score: 92 },
    ],
    results: [],
    kpis: [],
    independenceScore: 95,
    independenceLabel: "Strategischer Standortvorteil",
    icon: "🏆",
  },
];

const cumulative = [
  "Bestand + Datenbasis",
  "5,7–8,9 MWp Erzeugungsportfolio",
  "Steuerbarkeit erreicht",
  "Thermisch unabhängig",
  "Eigenständiges Ertragsmodell",
  "Strategischer Standortvorteil",
];

/* ── Independence Score Ring ─────────────────────────── */
function IndependenceRing({ score, size = 130, strokeWidth = 10 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const gradId = "indRing" + size;

  return (
    <div style={{
      position: "relative", width: size, height: size, flexShrink: 0,
      animation: "ringPulse 3s ease-in-out infinite",
    }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={C.gold} />
            <stop offset="100%" stopColor={C.green} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "Calibri, sans-serif",
          fontSize: size * 0.26, fontWeight: 700,
          color: C.goldLight, lineHeight: 1,
        }}>{score}%</span>
        <span style={{
          fontFamily: "Calibri, sans-serif",
          fontSize: Math.max(size * 0.08, 8), letterSpacing: "1.5px",
          textTransform: "uppercase", color: C.midGray, marginTop: 2,
        }}>Autarkie</span>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────── */
export default function EckartTimeline() {
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [active]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, phases.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        setActive(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActive(phases.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Animate the independence score number
  const targetScore = phases[active].independenceScore;
  useEffect(() => {
    const start = displayScore;
    const diff = targetScore - start;
    if (diff === 0) return;
    const duration = 800;
    const startTime = performance.now();
    let frame;
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + diff * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [targetScore]);

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
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "1rem", flexWrap: "wrap",
        }}>
          <h1 style={{
            fontSize: "clamp(1.5rem, 4vw, 2.4rem)", fontWeight: 700,
            margin: "0.6rem 0 0", lineHeight: 1.2,
            background: `linear-gradient(135deg, ${C.white} 0%, ${C.goldLight} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Phasenkonzept zur Energietransformation
          </h1>
          {/* Compact progress indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: "0.3rem",
            marginTop: "0.6rem",
          }}>
            {phases.map((p, i) => (
              <div key={i}
                onClick={() => setActive(i)}
                style={{
                  width: i === active ? "20px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: i <= active
                    ? `linear-gradient(90deg, ${C.gold}, ${C.green})`
                    : "rgba(255,255,255,0.12)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
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
        {/* Phase Title Block + Independence Ring */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "1rem", gap: "1rem", flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
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

          {/* Independence Ring */}
          <IndependenceRing score={displayScore} size={phase.isFinal ? 150 : 120} strokeWidth={phase.isFinal ? 12 : 9} />
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

            {/* ── INVESTMENT ROADMAP (Final) ───────────── */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{
                fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                letterSpacing: "3px", textTransform: "uppercase",
                color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
              }}>INVESTITIONS-ROADMAP · RENDITE PRO BAUSTEIN</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {phase.investmentSummary.map((item, i) => {
                  const maxVal = Math.max(...phase.investmentSummary.map(s => s.maxMio));
                  const barPct = Math.max((item.maxMio / maxVal) * 100, 3);
                  return (
                    <div key={i} style={{
                      animation: `fadeSlideIn 0.4s ease ${0.1 + i * 0.08}s both`,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px", padding: "0.65rem 0.8rem",
                      position: "relative", overflow: "hidden",
                    }}>
                      {/* Investment bar background */}
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: `${barPct}%`,
                        background: `linear-gradient(90deg, ${C.gold}12, ${C.gold}04)`,
                        borderRight: `2px solid ${C.gold}25`,
                        transition: "width 1s ease",
                      }} />
                      {/* Content */}
                      <div style={{
                        position: "relative", zIndex: 1,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: "0.5rem", flexWrap: "wrap",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{
                            fontFamily: "Georgia, serif", fontSize: "0.85rem",
                            fontWeight: 700, color: C.goldLight,
                            width: "24px", textAlign: "center",
                          }}>{item.phase}</span>
                          <div>
                            <div style={{
                              fontFamily: "Calibri, sans-serif", fontSize: "0.78rem",
                              fontWeight: 700, color: C.white,
                            }}>{item.label}</div>
                            <div style={{
                              fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                              color: C.midGray, marginTop: "0.1rem",
                            }}>{item.range}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {/* Autarkie score dot */}
                          <div style={{
                            display: "flex", alignItems: "center", gap: "0.25rem",
                            fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
                            color: C.goldLight,
                          }}>
                            <div style={{
                              width: "6px", height: "6px", borderRadius: "50%",
                              background: `linear-gradient(135deg, ${C.gold}, ${C.green})`,
                            }} />
                            {item.score}%
                          </div>
                          <div style={{
                            background: `linear-gradient(135deg, ${C.green}25, ${C.green}10)`,
                            border: `1px solid ${C.green}40`,
                            borderRadius: "6px", padding: "0.25rem 0.55rem",
                            fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
                            fontWeight: 700, color: C.greenLight,
                            whiteSpace: "nowrap",
                          }}>{item.roi}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Total row */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: `linear-gradient(135deg, ${C.gold}12, ${C.green}08)`,
                  border: `1px solid ${C.gold}30`,
                  borderRadius: "8px", padding: "0.75rem 0.9rem",
                  marginTop: "0.2rem",
                  animation: `fadeSlideIn 0.4s ease 0.6s both`,
                }}>
                  <div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                      letterSpacing: "2px", textTransform: "uppercase",
                      color: C.midGray, fontWeight: 700,
                    }}>GESAMTINVESTITION</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.15rem",
                      fontWeight: 700, color: C.goldLight, marginTop: "0.15rem",
                    }}>38–55 Mio €</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                      letterSpacing: "2px", textTransform: "uppercase",
                      color: C.midGray, fontWeight: 700,
                    }}>DAVON GRAUSTROM-BESS</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.15rem",
                      fontWeight: 700, color: C.gold, marginTop: "0.15rem",
                    }}>35–48 Mio € <span style={{ fontSize: "0.7rem", color: C.midGray, fontWeight: 400 }}>· sep. Finanzierung</span></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                      letterSpacing: "2px", textTransform: "uppercase",
                      color: C.midGray, fontWeight: 700,
                    }}>AUTARKIE-ZIEL</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.15rem",
                      fontWeight: 700, color: C.greenLight, marginTop: "0.15rem",
                    }}>95 %</div>
                  </div>
                </div>
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
              borderRadius: "10px", padding: "1.2rem 1.5rem",
              animation: "fadeSlideIn 0.5s ease 0.8s both",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                marginBottom: "1rem",
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
              {/* Contact CTA */}
              <div style={{
                borderTop: `1px solid ${C.gold}20`, paddingTop: "1rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: "0.75rem",
              }}>
                <div>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
                    letterSpacing: "2px", textTransform: "uppercase",
                    color: C.midGray, fontWeight: 700, marginBottom: "0.2rem",
                  }}>ANSPRECHPARTNER</div>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                    color: C.white,
                  }}>Levin Schober · Elite PV GmbH</div>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.75rem",
                    color: C.midGray, marginTop: "0.1rem",
                  }}>levinschober@elite-pv.de</div>
                </div>
                <a
                  href="mailto:levinschober@elite-pv.de?subject=Eckart%20Werke%20–%20Energietransformation"
                  style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.8rem",
                    fontWeight: 700, color: C.navy, textDecoration: "none",
                    background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                    borderRadius: "6px", padding: "0.6rem 1.4rem",
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    boxShadow: `0 2px 12px ${C.gold}30`,
                  }}
                >Gespräch vereinbaren</a>
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

            {/* ── INVESTMENT & ROI SECTION (Normal Phases) ─── */}
            {phase.investment && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
                }}>INVESTITION & RENDITE</div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "0.5rem",
                }}>
                  {/* Investment items */}
                  <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px", padding: "0.8rem",
                  }}>
                    {phase.investment.map((inv, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "0.4rem 0",
                        borderBottom: i < phase.investment.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        animation: `fadeSlideIn 0.4s ease ${0.2 + i * 0.06}s both`,
                      }}>
                        <span style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.78rem",
                          color: "rgba(255,255,255,0.8)",
                        }}>{inv.label}</span>
                        <span style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                          fontWeight: 700, color: C.goldLight, whiteSpace: "nowrap",
                          marginLeft: "0.5rem",
                        }}>{inv.range}</span>
                      </div>
                    ))}
                    {/* Total */}
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "0.5rem 0 0.1rem",
                      marginTop: "0.3rem",
                      borderTop: `1px solid ${C.gold}30`,
                      animation: `fadeSlideIn 0.4s ease 0.4s both`,
                    }}>
                      <span style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
                        letterSpacing: "1.5px", textTransform: "uppercase",
                        color: C.midGray, fontWeight: 700,
                      }}>GESAMT PHASE {phase.num}</span>
                      <span style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "1rem",
                        fontWeight: 700, color: C.gold,
                      }}>{phase.investTotal}</span>
                    </div>
                  </div>

                  {/* ROI Card */}
                  <div style={{
                    background: `linear-gradient(135deg, ${C.green}10, ${C.green}05)`,
                    border: `1px solid ${C.green}30`,
                    borderRadius: "8px", padding: "0.8rem",
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    animation: `fadeSlideIn 0.4s ease 0.3s both`,
                  }}>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.55rem",
                      letterSpacing: "2px", textTransform: "uppercase",
                      color: C.midGray, fontWeight: 700, marginBottom: "0.4rem",
                    }}>RENDITE-HEBEL</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                      color: C.white, lineHeight: 1.5, marginBottom: "0.5rem",
                    }}>{phase.roi}</div>
                    {phase.roiValue && (
                      <div style={{
                        display: "inline-flex", alignSelf: "flex-start",
                        background: `linear-gradient(135deg, ${C.green}30, ${C.green}15)`,
                        border: `1px solid ${C.green}50`,
                        borderRadius: "6px", padding: "0.35rem 0.7rem",
                      }}>
                        <span style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.95rem",
                          fontWeight: 700, color: C.greenLight,
                        }}>{phase.roiValue}</span>
                      </div>
                    )}
                    {/* Independence label */}
                    <div style={{
                      marginTop: "0.6rem", paddingTop: "0.5rem",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      display: "flex", alignItems: "center", gap: "0.4rem",
                    }}>
                      <div style={{
                        width: "8px", height: "8px", borderRadius: "50%",
                        background: `linear-gradient(135deg, ${C.gold}, ${C.green})`,
                      }} />
                      <span style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                        color: C.midGray,
                      }}>Autarkie-Status: <span style={{ color: C.goldLight, fontWeight: 700 }}>{phase.independenceLabel}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.25rem",
            padding: "0.15rem 0.4rem", borderRadius: "3px",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "0.5rem", color: "rgba(255,255,255,0.3)",
          }}>← → Phasen wechseln</span>
          <span style={{ fontStyle: "italic" }}>Energiewirtschaftliche Konzeptbegleitung: Elite PV</span>
        </span>
      </footer>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ringPulse {
          0%, 100% { filter: drop-shadow(0 0 8px ${C.gold}20); }
          50% { filter: drop-shadow(0 0 16px ${C.gold}40); }
        }
        * { box-sizing: border-box; margin: 0; }
        button:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }
        a:hover { opacity: 0.9; }
        @media (max-width: 600px) {
          header, footer, .content { padding-left: 1rem !important; padding-right: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
