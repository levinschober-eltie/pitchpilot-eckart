import { useState, useEffect } from "react";
import EckartTimeline from "./EckartTimeline";

const C = {
  navy: "#1B2A4A",
  navyMid: "#1E3050",
  navyLight: "#253757",
  gold: "#D4A843",
  goldLight: "#E8C97A",
  green: "#2D6A4F",
  midGray: "#9A9A90",
  white: "#FFFFFF",
};

function IntroScreen({ onEnter }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(170deg, ${C.navy} 0%, ${C.navyMid} 50%, ${C.navyLight} 100%)`,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: C.white,
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle grid pattern */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: `linear-gradient(${C.gold} 1px, transparent 1px), linear-gradient(90deg, ${C.gold} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Decorative corner accents */}
      <div style={{
        position: "absolute", top: "2rem", left: "2rem", width: "60px", height: "60px",
        borderTop: `2px solid ${C.gold}30`, borderLeft: `2px solid ${C.gold}30`,
        opacity: visible ? 1 : 0, transition: "opacity 1.5s ease 0.3s",
      }} />
      <div style={{
        position: "absolute", bottom: "2rem", right: "2rem", width: "60px", height: "60px",
        borderBottom: `2px solid ${C.gold}30`, borderRight: `2px solid ${C.gold}30`,
        opacity: visible ? 1 : 0, transition: "opacity 1.5s ease 0.3s",
      }} />

      {/* Top bar */}
      <div style={{
        padding: "2rem 2.5rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", zIndex: 2,
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-10px)",
        transition: "all 0.8s ease 0.2s",
      }}>
        <span style={{
          fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
          letterSpacing: "3px", textTransform: "uppercase",
          color: C.midGray, fontWeight: 700,
          padding: "0.3rem 0.7rem", borderRadius: "3px",
          border: `1px solid ${C.midGray}40`,
        }}>Vertraulich</span>
        <span style={{
          fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
          letterSpacing: "4px", textTransform: "uppercase",
          color: C.gold, fontWeight: 700,
        }}>Elite PV</span>
      </div>

      {/* Center content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "2rem", textAlign: "center",
        position: "relative", zIndex: 2,
      }}>
        {/* "Erstellt für" label */}
        <div style={{
          fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
          letterSpacing: "5px", textTransform: "uppercase",
          color: C.midGray, fontWeight: 700,
          marginBottom: "0.8rem",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(15px)",
          transition: "all 0.8s ease 0.4s",
        }}>Erstellt für</div>

        {/* Company name */}
        <h1 style={{
          fontSize: "clamp(2.5rem, 8vw, 5rem)", fontWeight: 700,
          margin: 0, lineHeight: 1,
          background: `linear-gradient(135deg, ${C.white} 30%, ${C.goldLight} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s ease 0.6s",
        }}>Eckart Werke</h1>

        {/* Gold accent line */}
        <div style={{
          width: visible ? "80px" : "0px", height: "2px",
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          margin: "1.2rem 0",
          transition: "width 0.8s ease 1s",
        }} />

        {/* Subtitle */}
        <h2 style={{
          fontSize: "clamp(1rem, 3vw, 1.5rem)",
          fontWeight: 400, margin: 0, lineHeight: 1.3,
          color: C.goldLight, fontStyle: "italic",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(15px)",
          transition: "all 0.8s ease 1.1s",
        }}>Phasenkonzept zur Energietransformation</h2>

        {/* Intro text */}
        <p style={{
          fontFamily: "Calibri, sans-serif",
          fontSize: "clamp(0.85rem, 1.5vw, 0.95rem)",
          color: "rgba(255,255,255,0.6)", lineHeight: 1.7,
          maxWidth: "520px", margin: "1.5rem 0 2rem",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(15px)",
          transition: "all 0.8s ease 1.3s",
        }}>
          Dieses interaktive Dokument zeigt die strategische Roadmap zur
          energetischen Transformation Ihres Standorts in Hartenstein –
          in fünf aufeinander aufbauenden Phasen, von der Analyse bis zum
          eigenständigen Ertragsmodell.
        </p>

        {/* 5 Phase pills preview */}
        <div style={{
          display: "flex", gap: "0.5rem", flexWrap: "wrap",
          justifyContent: "center", marginBottom: "2.5rem",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(15px)",
          transition: "all 0.8s ease 1.5s",
        }}>
          {[
            { num: "I", label: "Analyse" },
            { num: "II", label: "PV & Hülle" },
            { num: "III", label: "Speicher" },
            { num: "IV", label: "Wärme" },
            { num: "V", label: "BESS" },
          ].map((p, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "0.35rem",
              padding: "0.3rem 0.65rem", borderRadius: "20px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
            }}>
              <span style={{
                color: C.gold, fontWeight: 700, fontFamily: "Georgia, serif",
                fontSize: "0.65rem",
              }}>{p.num}</span>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          style={{
            fontFamily: "Calibri, sans-serif", fontSize: "0.9rem",
            fontWeight: 700, letterSpacing: "1px",
            color: C.navy, background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
            border: "none", borderRadius: "8px",
            padding: "0.85rem 2.2rem",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.6rem",
            boxShadow: `0 4px 24px ${C.gold}40, 0 0 0 1px ${C.gold}60`,
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.8s ease 1.7s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 6px 32px ${C.gold}60, 0 0 0 1px ${C.gold}80`;
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 4px 24px ${C.gold}40, 0 0 0 1px ${C.gold}60`;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Konzept entdecken
          <span style={{ fontSize: "1.1rem", transition: "transform 0.3s" }}>→</span>
        </button>
      </div>

      {/* Bottom bar */}
      <div style={{
        padding: "1.5rem 2.5rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
        color: C.midGray, flexWrap: "wrap", gap: "0.5rem",
        position: "relative", zIndex: 2,
        opacity: visible ? 1 : 0,
        transition: "opacity 1s ease 1.9s",
      }}>
        <span>März 2026 · Güntersthal 4, 91235 Hartenstein</span>
        <span style={{ fontStyle: "italic" }}>Energiewirtschaftliche Konzeptbegleitung</span>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [fadeOut, setFadeOut] = useState(false);

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(() => setScreen("timeline"), 600);
  };

  if (screen === "intro") {
    return (
      <div style={{
        opacity: fadeOut ? 0 : 1,
        transform: fadeOut ? "scale(1.02)" : "scale(1)",
        transition: "all 0.6s ease",
      }}>
        <IntroScreen onEnter={handleEnter} />
      </div>
    );
  }

  return (
    <div style={{
      animation: "introFadeIn 0.8s ease forwards",
    }}>
      <EckartTimeline />
      <style>{`
        @keyframes introFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
