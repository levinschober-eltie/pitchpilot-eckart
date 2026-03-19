import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense, memo, startTransition } from "react";
import { defaultConfig, calculateAll, fmtEuro, getPhaseCalcItems, getDynamicHeroCards } from "./calcEngine";
import { Icon } from "./Icons";
import { C, anim } from "./colors";

/* ── Lazy import with retry (handles stale chunks after redeployment) ── */
function lazyRetry(importFn) {
  return lazy(() => importFn().catch(() => {
    const refreshed = sessionStorage.getItem("chunk-retry");
    if (!refreshed) {
      sessionStorage.setItem("chunk-retry", "1");
      window.location.reload();
      return new Promise(() => {}); // never resolves, page reloads
    }
    sessionStorage.removeItem("chunk-retry");
    return importFn(); // final attempt after reload
  }));
}

const PhaseVisual = lazyRetry(() => import("./PhaseVisuals"));
const ConfigPanel = lazyRetry(() => import("./ConfigPanel"));
const ExportModal = lazyRetry(() => import("./PdfExport"));
const MarketAnalysis = lazyRetry(() => import("./MarketAnalysis"));

const phases = [
  {
    num: "I",
    title: "Analyse & Bewertung",
    subtitle: "Das Fundament",
    months: "Monat 1–3",
    color: C.gold,
    headline: "Ohne belastbare Daten keine belastbaren Entscheidungen",
    description: "Energieintensive Aluminiumverarbeitung, 800+ Mitarbeiter und bereits Freiflächen-PV in Betrieb. Die Analyse bewertet das Gesamtpotenzial: Gebäude, Prozesswärme, Lastprofile und den Hochspannungs-Netzanschluss.",
    results: [
      "Bestandsaufnahme: Freiflächen-PV dokumentiert und bewertet",
      "Drohnen- & Laservermessung aller Hallen und Flächen",
      "Dachgutachten mit Sanierungsplan (Cluster A–E)",
      "12-Monats-Lastprofil als Dimensionierungsgrundlage",
      "Thermische Bestandsaufnahme: Prozesswärme + Gebäudewärme",
      "Abwärmekartierung: Mühlen, Öfen, Trockner, Kompressoren",
      "Wirtschaftlichkeitsmodell auf Basis realer Daten",
    ],
    kpis: [
      { label: "Standortfläche", value: "50 Hektar" },
      { label: "Bestand PV", value: "~2 MWp" },
      { label: "Zusatz-Potenzial", value: "4,5–9,0 MWp" },
      { label: "110-kV", value: "Dokumentiert" },
    ],
    investment: [
      { label: "Standortanalyse & Gutachten", range: "50–80 T€" },
    ],
    funding: [
      { label: "BAFA Energieberatung", value: "bis 80 % Zuschuss" },
      { label: "KfW 295 (Energieeffizienz)", value: "Tilgungszuschuss" },
    ],
    investTotal: "50–80 T€",
    roi: "Entscheidungsgrundlage für alle Folgeinvestitionen",
    roiValue: "~2.000 MWh/a bereits erzeugt",
    independenceScore: 15,
    independenceLabel: "Bestand + Datenbasis",
    icon: "search",
    highlights: [
      { icon: "satellite", title: "Drohnen- & Laservermessung", text: "Gesamtes Gelände vollständig digital erfasst — Gebäude, Freiflächen, Verschattung" },
      { icon: "chart", title: "12-Monats-Lastprofil", text: "Reale Verbrauchsdaten in 15-Min-Auflösung als Grundlage für jede Dimensionierung" },
      { icon: "microscope", title: "Thermografie & Abwärme", text: "IR-Aufnahmen aller Hallen — Wärmeverluste und nutzbare Abwärmequellen identifiziert" },
      { icon: "bolt", title: "Hochspannungs-Netzanalyse", text: "Einspeise- und Bezugskapazität bewertet — Grundlage für das BESS-Ertragsmodell" },
    ],
  },
  {
    num: "II",
    title: "Gebäudehülle & PV",
    subtitle: "Das physische Fundament",
    months: "Monat 4–12",
    color: C.green,
    headline: "Belastbare Gebäude, produktive Flächen",
    description: "Dutzende Hallen bieten enormes Potenzial. Dachsanierung und PV werden als integriertes 30-Jahres-Investment umgesetzt. Drei neue Erzeugungsarten ergänzen den bestehenden Freiflächen-Park, die Mitarbeiter-Stellplätze werden zu Carport-Kraftwerken.",
    results: [
      "Dachsanierung priorisierter Cluster (A–E)",
      "Dach-PV auf allen geeigneten Hallenflächen",
      "Fassaden-PV an Süd- und Westfassaden installiert",
      "Carport-PV auf allen Mitarbeiter-Stellplätzen",
      "E-Ladeinfrastruktur an Carport-Stellplätzen",
      "Eigenverbrauchsquote bereits über 60 %",
    ],
    kpis: [
      { label: "Neu: Dach-PV", value: "2,5–5,0 MWp" },
      { label: "Neu: Fassade", value: "0,5–1,0 MWp" },
      { label: "Neu: Carport", value: "1,5–3,0 MWp" },
      { label: "Gesamt PV", value: "6,5–11,0 MWp" },
    ],
    investment: [
      { label: "Dach-PV (450–850 €/kWp)", range: "1,1–4,3 Mio €" },
      { label: "Fassaden-PV (450–850 €/kWp)", range: "225–850 T€" },
      { label: "Carport-PV (1.200 €/kWp)", range: "1,8–3,6 Mio €" },
    ],
    funding: [
      { label: "KfW 270 (Erneuerbare)", value: "Zinsverbilligung" },
      { label: "Sonder-AfA PV-Anlagen", value: "Steuerliche Abschreibung" },
      { label: "EEG-Einspeisevergütung", value: "Überschusseinspeisung" },
    ],
    investTotal: "3,1–8,8 Mio €",
    roi: "Strombezugskosten-Reduktion + Ladeinfrastruktur",
    roiValue: ">60 % Eigenverbrauch",
    independenceScore: 45,
    independenceLabel: "Erweitertes Erzeugungsportfolio",
    icon: "sun",
    highlights: [
      { icon: "factory", title: "Dach-PV auf allen Hallen", text: "Alle priorisierten Cluster saniert und mit PV bestückt — das größte Potenzial am Standort" },
      { icon: "factory", title: "Fassaden-PV Süd/West", text: "Vertikale Module erzeugen auch bei flachem Sonnenstand — ideal für den Winter" },
      { icon: "plug", title: "Carport-Kraftwerke", text: "Alle Stellplätze mit Solar-Carports — Stromerzeugung und Laden kombiniert" },
      { icon: "chart", title: "Jahreszeitlich optimal", text: "Dach + Fassade + Carport ergänzen den Freiflächen-Bestand für ganzjährig hohe Erträge" },
    ],
  },
  {
    num: "III",
    title: "Speicher & Steuerung",
    subtitle: "Vom Erzeuger zum steuerbaren System",
    months: "Monat 10–18",
    color: C.green,
    headline: "Der Unterschied zwischen Erzeugung und Kontrolle",
    description: "Mit wachsender Erzeugungsleistung wird Steuerbarkeit zum entscheidenden Faktor. Der Speicher wird 1:1 zur PV-Leistung ausgelegt. Zusammen mit einem standortweiten EMS entsteht ein vollständig steuerbares Energiesystem.",
    results: [
      "Standort-BESS in Betrieb — 1:1 zur PV-Leistung dimensioniert",
      "Peak Shaving aktiv — direkte Leistungspreis-Reduktion",
      "Spotmarkt-Strategie implementiert (Winter-Optimierung)",
      "EMS steuert alle Energieflüsse standortweit in Echtzeit",
      "Prognosebasierte Lade-/Entladesteuerung (PV + Last + Wetter)",
    ],
    kpis: [
      { label: "BESS-Kapazität", value: "6,5–11 MWh" },
      { label: "Entladeleistung", value: "3,25–5,5 MW" },
      { label: "Peak Shaving", value: "10–15 %" },
      { label: "Eigenverbrauch", value: ">80 %" },
    ],
    investment: [
      { label: "BESS 6,5–11 MWh (150–225 €/kWh)", range: "1,0–2,5 Mio €" },
      { label: "EMS & standortweite Integration", range: "120–250 T€" },
    ],
    funding: [
      { label: "KfW 270 (Speicher)", value: "Zinsvergünstigung" },
      { label: "Landesförderung Bayern", value: "Speicher-Zuschuss" },
    ],
    investTotal: "1,1–2,7 Mio €",
    roi: "Peak Shaving + Spotmarkt-Optimierung",
    roiValue: "10–15 % Leistungspreis-Senkung",
    independenceScore: 65,
    independenceLabel: "Steuerbarkeit erreicht",
    icon: "bolt",
    highlights: [
      { icon: "battery", title: "1:1 PV-Speicher", text: "Exakt auf die Erzeugungsleistung dimensioniert — maximale Ausnutzung jeder kWh" },
      { icon: "bolt", title: "Intelligentes EMS", text: "Prognosebasierte Steuerung: PV-Ertrag, Lastprofile und Wetter in Echtzeit" },
      { icon: "chartDown", title: "Peak Shaving", text: "Lastspitzen automatisch gekappt — sofortige Reduktion der Leistungspreise" },
      { icon: "money", title: "Spotmarkt-Trading", text: "Günstig laden bei 2 ct/kWh, teuer zurückspeisen — automatisiert durch EMS" },
    ],
  },
  {
    num: "IV",
    title: "Wärmekonzept",
    subtitle: "Die thermische Lücke schließen",
    months: "Monat 15–24",
    color: C.goldDim,
    headline: "Industriewärme in dieser Größenordnung erfordert eine industrielle Lösung",
    description: "Aluminiumpigment-Produktion bedeutet energieintensive Prozesswärme: Kugelmühlen, Atomisierung, Trocknungsanlagen. Über dutzende Hallen verteilt reicht keine Einzelanlage. Die Lösung: eine Wärmepumpen-Kaskade, die Produktionsabwärme als Quelle nutzt, ein zentrales Wärmenetz und Pufferspeicher für Lastspitzen.",
    results: [
      "WP-Kaskade in Betrieb — Hochtemperatur bis 90 °C",
      "Zentrales Wärmenetz verbindet alle Produktionshallen",
      "Abwärmekaskade: Mühlen → Kompressoren → Trockner → Rücklauf",
      "Pufferspeicher für thermische Lastspitzen dimensioniert",
      "Gebäudedämmung priorisierter Hallen (Cluster A–C)",
      "Fossile Gaskessel auf Spitzenlast-Reserve reduziert",
    ],
    kpis: [
      { label: "Thermische Leistung", value: "5–10 MW" },
      { label: "COP (Abwärme)", value: "4–5" },
      { label: "Wärmenetz", value: "Standortweit" },
      { label: "Gasreduktion", value: "65–80 %" },
    ],
    investment: [
      { label: "WP-Kaskade 5–10 MW (300–500 €/kWth)", range: "1,5–5,0 Mio €" },
      { label: "Standortweites Wärmenetz", range: "500 T€–1,5 Mio €" },
      { label: "Pufferspeicher & Hydraulik", range: "100–300 T€" },
      { label: "Gebäudedämmung (Cluster A–C)", range: "400 T€–1,2 Mio €" },
    ],
    funding: [
      { label: "BEG (Wärmepumpen)", value: "bis 40 % Zuschuss" },
      { label: "KfW 261/262", value: "Tilgungszuschuss" },
      { label: "BAFA Prozesswärme", value: "bis 55 % Förderung" },
    ],
    investTotal: "2,5–8,0 Mio €",
    roi: "Gaskosten-Reduktion durch industrielle Abwärme-Nutzung",
    roiValue: "65–80 % weniger Gaskosten",
    independenceScore: 80,
    independenceLabel: "Thermisch unabhängig",
    icon: "fire",
    highlights: [
      { icon: "fire", title: "Hochtemperatur bis 90 °C", text: "WP-Kaskade für industrielle Prozesswärme — direkt aus Produktionsabwärme gespeist" },
      { icon: "bolt", title: "Abwärme-Kaskade", text: "Produktionsabwärme wird zur Wärmequelle — kein Joule verlässt den Kreislauf" },
      { icon: "factory", title: "Zentrales Wärmenetz", text: "Alle Produktionshallen verbunden — gleichmäßige Wärmeversorgung über den gesamten Standort" },
      { icon: "leaf", title: "Gaskessel nur noch Reserve", text: "Fossile Verbrennung auf Spitzenlast reduziert — CO₂-Bilanz drastisch verbessert" },
    ],
  },
  {
    num: "V",
    title: "Ladeinfrastruktur",
    subtitle: "Mobilität elektrifizieren",
    months: "Monat 15–24",
    color: C.greenLight,
    headline: "800 Mitarbeiter, Fuhrpark, LKW-Logistik – alles elektrisch vom eigenen Dach",
    description: "Der eigene PV-Strom wird zum günstigsten Kraftstoff am Standort. AC-Ladepunkte für Mitarbeiter, DC-Schnelllader für den Fuhrpark und ein HPC-Depot für die LKW-Logistik. Dynamisches Lastmanagement integriert alles ins EMS – ohne Netzausbau.",
    results: [
      "AC-Wallboxen auf allen Mitarbeiter- & Besucherparkplätzen",
      "DC-Schnelllader für Firmenflotte in Betrieb",
      "HPC-Depot für E-LKW-Logistik einsatzbereit",
      "Lastmanagement integriert alle Ladepunkte ins EMS",
      "THG-Quoten-Erlöse durch öffentlich zugängliche Ladepunkte",
      "GEIG-Konformität ab 2026 sichergestellt",
    ],
    kpis: [
      { label: "AC-Ladepunkte", value: "60+" },
      { label: "DC Fleet", value: "4–6 × 150 kW" },
      { label: "LKW HPC", value: "4–6 × 400 kW" },
      { label: "Kraftstoffersparnis", value: "~65 %" },
    ],
    investment: [
      { label: "AC-Wallboxen 60× (22 kW)", range: "120–180 T€" },
      { label: "DC-Schnelllader Fuhrpark", range: "200–400 T€" },
      { label: "HPC-Depot LKW (150–400 kW CCS)", range: "600 T€–1,2 Mio €" },
      { label: "Tiefbau, Kabel & Trafo", range: "250–450 T€" },
      { label: "Lastmanagement & Backend", range: "30–50 T€" },
    ],
    funding: [
      { label: "KfW 441 (Ladestationen)", value: "bis 900 €/Ladepunkt" },
      { label: "THG-Quotenerlöse", value: "pro kWh öffentlich" },
      { label: "GEIG-Pflicht ab 2026", value: "Gesetzl. Verpflichtung" },
    ],
    investTotal: "1,2–2,3 Mio €",
    roi: "Kraftstoffersparnis + THG-Quote + Mitarbeiter-Ladeerlöse",
    roiValue: "110–180 T€/a Einsparung",
    independenceScore: 78,
    independenceLabel: "Mobilität elektrifiziert",
    icon: "plug",
    highlights: [
      { icon: "plug", title: "Laden während der Arbeit", text: "Mitarbeiter laden direkt vom eigenen PV-Strom — günstiger als jede Tankstelle" },
      { icon: "bolt", title: "DC-Fleet Schnelllader", text: "Firmenflotte in 30 Min. geladen — Schnellladung direkt aus dem Betriebsspeicher" },
      { icon: "factory", title: "HPC-LKW-Depot", text: "E-LKW laden direkt am Depot — die gesamte Logistik wird elektrisch" },
      { icon: "document", title: "GEIG-konform ab 2026", text: "Gesetzliche Ladepflicht für Unternehmen proaktiv erfüllt — keine Nachrüstung nötig" },
    ],
  },
  {
    num: "VI",
    title: "Graustrom-BESS",
    subtitle: "Der eigenständige Werttreiber",
    months: "Monat 18–30+",
    color: C.navy,
    headline: "Ein eigenständiges Geschäftsmodell am 110-kV-Netz",
    description: "Der vorhandene Hochspannungs-Anschluss ermöglicht ein Großspeicher-Projekt mit eigenständiger Wirtschaftlichkeit — unabhängig von der Standortoptimierung.",
    results: [
      "Arbitrage: Laden bei 2–5 ct, entladen bei Peak",
      "Regelenergie (FCR / aFRR): Reaktionszeit < 1s",
      "Redispatch und Netzdienstleistungen am Markt platziert",
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
    funding: [
      { label: "EEG § 61l (Speicher)", value: "Netzentgelt-Befreiung" },
      { label: "Regelenergie-Präqualifikation", value: "FCR/aFRR-Erlöse" },
      { label: "Separate Projektfinanzierung", value: "Non-Recourse möglich" },
    ],
    investTotal: "35–48 Mio €",
    roi: "Eigenständiges Ertragsmodell mit drei Erlösströmen",
    roiValue: "15–25 % p.a.",
    independenceScore: 90,
    independenceLabel: "Eigenständiges Ertragsmodell",
    icon: "factory",
    highlights: [
      { icon: "bank", title: "Separates Investment", text: "Eigenständige Projektfinanzierung (Non-Recourse) — vollständig vom Standort-Invest getrennt" },
      { icon: "chart", title: "Drei Erlösströme", text: "Arbitrage + Regelenergie + Redispatch — maximale Diversifikation der Einnahmen" },
      { icon: "bolt", title: "Größte Anlage der Region", text: "Großspeicher direkt am Hochspannungsnetz — einzigartige Standortvoraussetzung" },
      { icon: "money", title: "Cashflow ab Tag 1", text: "Positive Rendite vom ersten Betriebstag — Amortisation in 4–6 Jahren realistisch" },
    ],
  },
  {
    num: "✦",
    title: "Gesamtergebnis",
    subtitle: "Eine neue Ausgangslage",
    months: "Vollausbau",
    color: C.gold,
    headline: "Energieversorgung wird Wettbewerbsvorteil – oder bleibt Risikofaktor",
    description: "Sechs Phasen. Ein integriertes System. Strom, Wärme, Mobilität und Speicher – jede Dimension der Energieversorgung ist durchdacht und wirtschaftlich unterlegt. Der Standort Hartenstein wird nicht nur effizienter – er wird strategisch unangreifbar. Von der Analyse über 11 MWp Eigenerzeugung, intelligente Speicher und ein standortweites Wärmenetz bis zum eigenständigen 100-MW-Ertragsmodell: Jede Investition baut auf der vorherigen auf, jede Phase erhöht die Unabhängigkeit. Das Ergebnis ist ein Industriestandort, der seine Energiekosten um über 50 % senkt, CO₂-Emissionen massiv reduziert und gleichzeitig einen neuen Geschäftsbereich erschließt.",
    isFinal: true,
    levers: [
      { icon: "bolt", title: "Reduktion externer Strombezug", desc: "~800–1.400 T€/a Einsparung durch Eigenerzeugung" },
      { icon: "chartDown", title: "Lastspitzenreduktion", desc: "10–15 % Peak Shaving → 100–200 T€/a Leistungspreis-Senkung" },
      { icon: "fire", title: "Gaskosten-Reduktion", desc: "65–80 % weniger → 300–600 T€/a Einsparung" },
      { icon: "plug", title: "Kraftstoff-Elektrifizierung", desc: "~65 % weniger Mobilitätskosten → 110–180 T€/a" },
      { icon: "search", title: "Aktive Steuerbarkeit", desc: "Echtzeit-EMS optimiert Erzeugung, Speicher und Verbrauch" },
      { icon: "factory", title: "BESS-Ertragsmodell", desc: "15–25 % p.a. auf 35–48 Mio € → eigenständiger Cashflow" },
    ],
    /* ── Two hero numbers for Vollausbau at-a-glance ── */
    heroCards: [
      {
        icon: "leaf", accent: "#2D6A4F",
        label: "CO₂-EINSPARUNG PRO JAHR",
        value: "~4.800 t",
        sub: "CO₂/Jahr weniger · 264–312 T€/a vermiedene CO₂-Kosten",
        details: [
          { label: "Strom (PV statt Netz)", value: "–2.100 t" },
          { label: "Wärme (WP statt Gas)", value: "–2.400 t" },
          { label: "Mobilität (E statt Diesel)", value: "–300 t" },
          { label: "CO₂-Preis (55–65 €/t)", value: "264–312 T€/a" },
        ],
      },
      {
        icon: "money", accent: "#D4A843",
        label: "JÄHRLICHER GESAMTERTRAG",
        value: "6,4–14,5 Mio €",
        sub: "Einsparung + Erlöse pro Jahr",
        details: [
          { label: "Standort-Einsparungen (I–V)", value: "1,4–2,5 Mio €" },
          { label: "Graustrom-BESS Erlöse (VI)", value: "5,0–12,0 Mio €" },
        ],
      },
    ],
    regulatorik: [
      { icon: "document", title: "CSRD-Berichtspflicht", desc: "Ab 2025 verpflichtend für große Unternehmen — Scope 1–3 Emissionen müssen offengelegt und reduziert werden", status: "Erfüllt durch Phasen I–VI" },
      { icon: "bank", title: "EU-Taxonomie", desc: "Investitionen gelten als nachhaltig — verbessert ESG-Rating und Zugang zu Green Finance", status: "Taxonomie-konform" },
      { icon: "leaf", title: "CO₂-Bepreisung", desc: "Nationaler CO₂-Preis steigt von 55 €/t (2025) auf 65 €/t (2026) — jedes Jahr Nicht-Handeln wird teurer", status: "264–312 T€/a vermieden" },
      { icon: "bolt", title: "EnEfG (Energieeffizienzgesetz)", desc: "Unternehmen > 7,5 GWh/a müssen Energiemanagementsystem und Effizienzmaßnahmen nachweisen", status: "Vollständig abgedeckt" },
      { icon: "leaf", title: "CBAM (CO₂-Grenzausgleich)", desc: "Ab 2026 CO₂-Zölle auf Importe — ECKART als Exporteur profitiert von niedrigem CO₂-Fußabdruck", status: "Wettbewerbsvorteil" },
      { icon: "plug", title: "GEIG (Ladepflicht)", desc: "Ab 2026 Ladepflicht für Nichtwohngebäude > 20 Stellplätze — durch Phase V vollständig erfüllt", status: "Seit Phase V erfüllt" },
    ],
    riskManagement: [
      { icon: "chart", title: "Energiepreisvolatilität", desc: "95 % Autarkie eliminiert Abhängigkeit von Strom- und Gaspreisschwankungen", impact: "Kalkulierbare Kosten" },
      { icon: "bolt", title: "Versorgungssicherheit", desc: "Eigenerzeugung + Speicher = Inselfähigkeit bei Netzstörungen — Produktion läuft weiter", impact: "Kein Produktionsausfall" },
      { icon: "leaf", title: "Geopolitische Unabhängigkeit", desc: "Keine Abhängigkeit von fossilen Importen — Standort ist energiepolitisch resilient", impact: "Strategische Absicherung" },
      { icon: "chart", title: "Regulatorisches Risiko", desc: "Steigende CO₂-Preise, verschärfte Berichtspflichten — proaktives Handeln statt Nachrüsten", impact: "Zukunftssicherheit" },
    ],
    economicSummary: {
      title: "Gesamtwirtschaftliche Betrachtung",
      savings: [
        { label: "PV-Eigenverbrauch (Stromkosten-Reduktion)", value: "800–1.400 T€/a" },
        { label: "Peak Shaving & Spotmarkt-Optimierung", value: "150–300 T€/a" },
        { label: "Gaskosten-Reduktion (65–80 %)", value: "300–600 T€/a" },
        { label: "Kraftstoff-Einsparung Fuhrpark & LKW", value: "80–130 T€/a" },
        { label: "THG-Quote & Ladeerlöse Mitarbeiter", value: "30–50 T€/a" },
      ],
      totals: {
        annualSavings: "1,4–2,5 Mio €/a",
        investStandort: "8,5–22 Mio €",
        paybackStandort: "~6–9 Jahre",
        bessRevenue: "5–12 Mio €/a",
        investGesamt: "43–70 Mio €",
      },
      conclusion: "Die Standort-Investition (Phasen I–V) amortisiert sich in 6–9 Jahren bei 1,4–2,5 Mio € jährlicher Einsparung. Das Graustrom-BESS (Phase VI) ist ein eigenständiges Ertragsmodell mit 15–25 % p.a. Rendite. Zusammen entsteht ein Energiesystem, das in jeder Dimension – Strom, Wärme, Mobilität und Markterlöse – wirtschaftlich optimiert ist.",
    },
    systemKpis: [
      { label: "Gesamt-PV", value: "6,5–11,0 MWp", sub: "Bestand 2 MWp + Dach + Fassade + Carport" },
      { label: "Erzeugung", value: "5.800–9.800 MWh/a", sub: "Vier Erzeugungsarten kombiniert" },
      { label: "Speicher", value: "6,5–11 MWh", sub: "1:1 PV, 0,5C Entladerate" },
      { label: "Thermisch", value: "5–10 MW", sub: "WP-Kaskade + Wärmenetz" },
      { label: "Ladeinfrastruktur", value: "70+ Ladepunkte", sub: "AC + DC + HPC für PKW & LKW" },
      { label: "BESS Utility", value: "100 MW / 200 MWh", sub: "Eigenständiger Werttreiber" },
    ],
    pillars: [
      { label: "Eigenerzeugung", phase: "II", icon: "sun" },
      { label: "Steuerbarkeit", phase: "III", icon: "bolt" },
      { label: "Wärmeautarkie", phase: "IV", icon: "fire" },
      { label: "E-Mobilität", phase: "V", icon: "plug" },
      { label: "Ertragsmodell", phase: "VI", icon: "factory" },
    ],
    investmentSummary: [
      { phase: "—", label: "Bestand Freiflächen-PV", range: "~2 MWp (bereits realisiert)", roi: "~2.000 MWh/a", maxMio: 0, score: 10 },
      { phase: "I", label: "Analyse & Bewertung", range: "50–80 T€", roi: "Entscheidungsgrundlage", maxMio: 0.08, score: 10 },
      { phase: "II", label: "Gebäudehülle & PV", range: "3,1–8,8 Mio €", roi: "800–1.400 T€/a Stromersparnis", maxMio: 8.8, score: 35 },
      { phase: "III", label: "Speicher & Steuerung", range: "1,1–2,7 Mio €", roi: "150–300 T€/a Peak+Spot", maxMio: 2.7, score: 55 },
      { phase: "IV", label: "Wärmekonzept", range: "2,5–8,0 Mio €", roi: "300–600 T€/a Gasersparnis", maxMio: 8.0, score: 70 },
      { phase: "V", label: "Ladeinfrastruktur", range: "1,2–2,3 Mio €", roi: "110–180 T€/a Mobilitätsersparnis", maxMio: 2.3, score: 78 },
      { phase: "VI", label: "Graustrom-BESS", range: "35–48 Mio €", roi: "15–25 % p.a.", maxMio: 48, score: 90 },
    ],
    results: [
      "Vollständig integriertes Energiesystem über alle Dimensionen",
      "Stromkosten um 60–80 % reduziert durch PV + Speicher + EMS",
      "Gasverbrauch um 65–80 % gesenkt durch WP-Kaskade + Abwärme",
      "Fuhrpark & LKW-Depot vollständig elektrifiziert",
      "Neuer Geschäftsbereich: Graustrom-BESS mit eigenständigem Cashflow",
    ],
    kpis: [
      { label: "Autarkie-Grad", value: "~95 %" },
      { label: "Einsparung p.a.", value: "1,4–2,5 Mio €" },
      { label: "Amortisation", value: "6–9 Jahre" },
      { label: "BESS-Rendite", value: "15–25 % p.a." },
    ],
    investTotal: "43–70 Mio €",
    roiValue: "1,4–2,5 Mio €/a Einsparung + BESS-Erträge",
    independenceScore: 95,
    independenceLabel: "Strategischer Standortvorteil",
    icon: "sun",
    highlights: [
      { icon: "search", title: "95 % Autarkie", text: "Strom, Wärme und Mobilität nahezu vollständig aus eigener Erzeugung" },
      { icon: "money", title: "1,4–2,5 Mio €/a", text: "Jährliche Einsparung über alle Energiedimensionen — ab Jahr 1" },
      { icon: "bolt", title: "Amortisation 6–9 J.", text: "Standort-Invest (Phasen I–V) amortisiert sich innerhalb eines Jahrzehnts" },
      { icon: "factory", title: "Eigenständiger Cashflow", text: "Graustrom-BESS als separates Ertragsmodell mit 15–25 % p.a." },
    ],
  },
];

const cumulative = [
  "Bestand + Datenbasis",
  "6,5–11,0 MWp Erzeugungsportfolio",
  "Steuerbarkeit erreicht",
  "Thermisch unabhängig",
  "Mobilität elektrifiziert",
  "Eigenständiges Ertragsmodell",
  "Strategischer Standortvorteil",
];

/* ── Extracted Static Styles (reduce GC pressure) ── */
const S = {
  labelSmall: {
    fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
    letterSpacing: "0.5px", textTransform: "uppercase", color: "#B0B0A6",
  },
  labelTiny: {
    fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
    letterSpacing: "3px", textTransform: "uppercase", fontWeight: 700,
  },
  valueText: {
    fontFamily: "Calibri, sans-serif", fontSize: "1.05rem",
    fontWeight: 700, lineHeight: 1.1,
  },
  cardBase: {
    borderRadius: "7px", padding: "0.45rem 0.5rem",
    background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
  },
  sectionHeading: {
    fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
    letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700,
    marginBottom: "0.5rem",
  },
  flexCenter: {
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  pillBtn: {
    borderRadius: "2rem", fontFamily: "Calibri, sans-serif",
    fontSize: "0.7rem", letterSpacing: "1.5px", textTransform: "uppercase",
    fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center",
    gap: "0.3rem", transition: "all 0.3s", whiteSpace: "nowrap",
  },
};

/* ── Independence Score Ring ─────────────────────────── */
const IndependenceRing = memo(function IndependenceRing({ score, size = 130, strokeWidth = 10 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const gradId = "indRing" + size;

  return (
    <div style={{
      position: "relative", width: size, height: size, flexShrink: 0,
      ...anim("ringPulse 3s ease-in-out infinite"),
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
});

/* ── Main Component ──────────────────────────────────── */
export default function EckartTimeline() {
  const [active, setActive] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const sliderRef = useRef(null);
  const contentRef = useRef(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [config, setConfig] = useState(defaultConfig);
  const [savedConfig, setSavedConfig] = useState(null);
  const configSaved = savedConfig !== null;
  const calc = useMemo(() => calculateAll(config), [config]);
  const activeCalc = useMemo(() => configSaved ? calculateAll(savedConfig) : calc, [configSaved, savedConfig, calc]);
  // showCalc: true when presentation should display calculated values (saved OR panel open)
  const showCalc = analysisOpen || configSaved;
  const [saveToast, setSaveToast] = useState(false);

  const heroCards = useMemo(() => {
    if (!showCalc) return null;
    return getDynamicHeroCards(analysisOpen ? calc : activeCalc);
  }, [showCalc, analysisOpen, calc, activeCalc]);

  const phaseCalcItems = useMemo(() => {
    if (!showCalc) return null;
    const c = analysisOpen ? calc : activeCalc;
    const cfg = analysisOpen ? config : savedConfig;
    return getPhaseCalcItems(active, c, cfg);
  }, [showCalc, analysisOpen, calc, activeCalc, config, savedConfig, active]);

  useEffect(() => { sessionStorage.removeItem("chunk-retry"); }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.animation = 'none';
    // Force reflow to restart animation
    void el.offsetHeight;
    el.style.animation = '';
    // Scroll content into view for keyboard navigation
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [active]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      // Don't capture arrow keys when a modal/overlay is open (breaks slider input)
      if (analysisOpen || exportOpen) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        startTransition(() => setActive((a) => Math.min(a + 1, phases.length - 1)));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        startTransition(() => setActive((a) => Math.max(a - 1, 0)));
      } else if (e.key === "Home") {
        e.preventDefault();
        startTransition(() => setActive(0));
      } else if (e.key === "End") {
        e.preventDefault();
        startTransition(() => setActive(phases.length - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [analysisOpen, exportOpen]);

  // Escape key closes modals/panels
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        if (exportOpen) setExportOpen(false);
        else if (analysisOpen) setAnalysisOpen(false);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [analysisOpen, exportOpen]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetScore]);

  const phase = phases[active];

  const handleSliderInteraction = useCallback((clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(pct * (phases.length - 1));
    startTransition(() => setActive(idx));
  }, []);

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
  }, [isDragging, handleSliderInteraction]);

  const sliderPct = (active / (phases.length - 1)) * 100;

  return (
    <div className="pitch-root" style={{
      minHeight: "100vh",
      background: `linear-gradient(170deg, ${C.navy} 0%, ${C.navyMid} 40%, ${C.navyLight} 100%)`,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: C.white,
      overflowX: "hidden",
      overflowY: "auto",
      position: "relative",
    }}>
      <a className="skip-link" href="#main-content">Zum Hauptinhalt springen</a>

      {/* Screen reader announcer for phase changes */}
      <div aria-live="polite" aria-atomic="true" style={{
        position: "absolute", width: "1px", height: "1px",
        overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap",
      }}>
        {`Phase ${phase.num}: ${phase.title} — ${phase.subtitle}`}
      </div>

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
            fontSize: "0.7rem", fontFamily: "Calibri, sans-serif",
            letterSpacing: "4px", textTransform: "uppercase", color: C.gold,
            fontWeight: 700,
          }}>ECKART WERKE</span>
          <span style={{
            width: "40px", height: "1px", background: C.gold,
            display: "inline-block", verticalAlign: "middle",
          }} />
          <span style={{
            fontSize: "0.7rem", fontFamily: "Calibri, sans-serif",
            letterSpacing: "2px", textTransform: "uppercase", color: C.midGray,
          }}>Energietransformation</span>
        </div>
        <div className="header-actions" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "1rem", flexWrap: "wrap",
        }}>
          <h1 style={{
            fontSize: "clamp(1.5rem, 4vw, 2.4rem)", fontWeight: 700,
            margin: "0.6rem 0 0", lineHeight: 1.2,
            background: `linear-gradient(135deg, ${C.white} 0%, ${C.goldLight} 100%)`,
            backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
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
                className="progress-dot"
                onClick={() => startTransition(() => setActive(i))}
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
          {/* Analyse & Kalkulation toggle */}
          <button
            onClick={() => setAnalysisOpen(o => !o)}
            style={{
              ...S.pillBtn,
              background: configSaved ? `${C.green}25` : analysisOpen ? `${C.gold}20` : "rgba(255,255,255,0.06)",
              border: `1px solid ${configSaved ? C.green + "60" : analysisOpen ? C.gold + "50" : "rgba(255,255,255,0.12)"}`,
              padding: "0.3rem 0.7rem",
              color: configSaved ? C.green : analysisOpen ? C.gold : C.midGray,
              marginTop: "0.6rem",
            }}
          ><Icon name={configSaved ? "check" : "chart"} size={12} /> Analyse & Kalkulation</button>
          {configSaved && (
            <button
              onClick={() => { setSavedConfig(null); setConfig(defaultConfig); setAnalysisOpen(false); }}
              style={{
                ...S.pillBtn,
                background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.3)",
                padding: "0.3rem 0.7rem",
                color: "#ff8888",
                marginTop: "0.6rem",
              }}
            ><Icon name="reset" size={12} /> Zurücksetzen</button>
          )}
          <button
            onClick={() => setExportOpen(true)}
            style={{
              background: "rgba(212,168,67,0.15)", border: "1px solid rgba(212,168,67,0.4)",
              color: C.goldLight, borderRadius: "2rem", padding: "0.35rem 1rem",
              fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.03em",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem",
              transition: "all 0.3s", whiteSpace: "nowrap",
            }}
          ><Icon name="document" size={14} /> PDF Export</button>
        </div>
      </header>

      {/* Timeline Slider */}
      <div style={{ padding: "1rem 2rem 0.5rem", position: "relative", zIndex: 2 }}>
        {/* Phase dots row */}
        <div role="tablist" aria-label="Phasen-Navigation" style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginBottom: "0.5rem", padding: "0 0.5rem",
        }}>
          {phases.map((p, i) => (
            <button
              key={i}
              className="phase-btn"
              role="tab"
              aria-selected={i === active}
              aria-controls="main-content"
              onClick={() => startTransition(() => setActive(i))}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "0.3rem", padding: "0.25rem 0.5rem",
                transition: "all 0.3s ease",
                opacity: i <= active ? 1 : 0.4,
              }}
            >
              <Icon name={p.icon} size={i === active ? 24 : 16} style={{
                transition: "all 0.3s ease",
                filter: i === active ? "none" : "grayscale(0.5)",
                WebkitFilter: i === active ? "none" : "grayscale(0.5)",
              }} />
              <span style={{
                fontFamily: "Calibri, sans-serif",
                fontSize: "0.75rem", letterSpacing: "1.5px",
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
          {/* Invisible touch area expander (44px tall hit area) */}
          <div style={{
            position: "absolute", left: 0, right: 0, top: "-19px", bottom: "-19px",
            cursor: "pointer",
          }} />

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
            fontSize: "0.7rem", fontWeight: 700, color: C.gold,
            fontFamily: "Georgia, serif",
          }}>
            {phase.num}
          </div>
        </div>

        {/* Month labels */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "0.4rem 0.5rem 0", fontFamily: "Calibri, sans-serif",
          fontSize: "0.7rem", color: C.midGray, letterSpacing: "0.5px",
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
      <main id="main-content" role="tabpanel" ref={contentRef} style={{
        padding: "1rem 2rem 2rem",
        position: "relative", zIndex: 2,
        ...anim("fadeSlideIn 0.5s ease forwards"),
      }}>
        {/* Phase Title Row */}
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
            <Icon name={phase.icon} size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              ...S.labelTiny, fontSize: "0.75rem",
              color: C.gold, marginBottom: "0.2rem",
            }}>{phase.isFinal ? "Gesamtergebnis" : `Phase ${phase.num}`} · {phase.subtitle}</div>
            <h2 style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
              fontWeight: 700, margin: 0, lineHeight: 1.15,
              background: phase.isFinal ? `linear-gradient(135deg, ${C.white}, ${C.goldLight})` : "none",
              backgroundClip: phase.isFinal ? "text" : "unset",
              WebkitBackgroundClip: phase.isFinal ? "text" : "unset",
              WebkitTextFillColor: phase.isFinal ? "transparent" : "inherit",
            }}>{phase.title}</h2>
          </div>
        </div>

        {/* Headline Quote */}
        <div style={{
          borderLeft: `3px solid ${C.gold}`,
          paddingLeft: "1rem",
          marginBottom: "1rem",
        }}>
          <p style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
            fontStyle: "italic", color: C.goldLight,
            margin: 0, lineHeight: 1.5,
          }}>
            „{phase.headline}"
          </p>
        </div>

        {/* Two-Column: Content left, Illustration right */}
        <div className="pitch-grid" style={{
          display: "grid",
          gridTemplateColumns: "5fr 4fr",
          gap: "1.25rem",
          alignItems: "start",
          minWidth: 0,
          marginBottom: "1.25rem",
        }}>
          {/* Left: Rich content panel */}
          <div style={{ minWidth: 0 }}>
            {/* Description */}
            <p style={{
              fontFamily: "Calibri, sans-serif",
              fontSize: "1.0rem", color: "rgba(255,255,255,0.75)",
              lineHeight: 1.7, margin: "0 0 0.8rem 0",
            }}>
              {phase.description}
            </p>

            {/* KPI metrics row */}
            {phase.kpis && phase.kpis.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(phase.kpis.length, 4)}, 1fr)`,
                gap: "0.35rem",
                marginBottom: "0.7rem",
              }}>
                {phase.kpis.slice(0, 4).map((kpi, i) => (
                  <div key={i} style={{
                    ...S.cardBase,
                    borderLeft: `2px solid ${phase.color || C.gold}70`,
                    ...anim(`fadeSlideIn 0.3s ease ${0.1 + i * 0.05}s both`),
                  }}>
                    <div style={{
                      ...S.labelSmall, color: C.midGray, marginBottom: "0.15rem",
                    }}>{kpi.label}</div>
                    <div style={{
                      ...S.valueText, color: C.goldLight,
                    }}>{kpi.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Phase highlights */}
            {phase.highlights && phase.highlights.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.35rem",
                marginBottom: "0.7rem",
              }}>
                {phase.highlights.map((h, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${phase.color || C.gold}30`,
                    borderRadius: "8px",
                    padding: "0.45rem 0.55rem",
                    ...anim(`fadeSlideIn 0.4s ease ${0.15 + i * 0.07}s both`),
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.3rem",
                      marginBottom: "0.15rem",
                    }}>
                      <Icon name={h.icon} size={14} color="currentColor" />
                      <span style={{
                        fontFamily: "Calibri, sans-serif",
                        fontSize: "0.8rem", fontWeight: 700,
                        color: phase.color || C.goldLight,
                        letterSpacing: "0.3px",
                      }}>{h.title}</span>
                    </div>
                    <p style={{
                      fontFamily: "Calibri, sans-serif",
                      fontSize: "0.75rem", color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.45, margin: 0,
                    }}>{h.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Key results */}
            {phase.results && phase.results.length > 0 && (
              <div style={{ marginBottom: "0.6rem" }}>
                <div style={{
                  ...S.sectionHeading, color: C.midGray, marginBottom: "0.35rem",
                }}>{phase.isFinal ? "ERGEBNISSE" : "LIEFERERGEBNISSE"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  {phase.results.slice(0, 5).map((r, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: "0.4rem",
                      ...anim(`fadeSlideIn 0.3s ease ${0.25 + i * 0.05}s both`),
                    }}>
                      <span style={{
                        color: phase.color || C.gold, fontSize: "0.7rem",
                        marginTop: "0.15rem", flexShrink: 0, opacity: 0.6,
                      }}>●</span>
                      <span style={{
                        fontFamily: "Calibri, sans-serif",
                        fontSize: "0.85rem", color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.4,
                      }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investment & ROI summary */}
            {phase.investTotal && (
              <div style={{
                display: "flex", gap: "0.5rem", flexWrap: "wrap",
                ...anim("fadeSlideIn 0.4s ease 0.5s both"),
              }}>
                <div style={{
                  background: `linear-gradient(135deg, ${phase.color || C.gold}12, ${phase.color || C.gold}05)`,
                  border: `1px solid ${phase.color || C.gold}25`,
                  borderRadius: "8px", padding: "0.45rem 0.65rem",
                  flex: "1 1 auto",
                }}>
                  <div style={{
                    ...S.sectionHeading, letterSpacing: "1.5px",
                    color: C.midGray, marginBottom: 0,
                  }}>INVESTMENT</div>
                  <div style={{
                    ...S.valueText, fontSize: "1.1rem", color: C.goldLight, lineHeight: 1.2,
                    marginTop: "0.1rem",
                  }}>{phase.investTotal}</div>
                </div>
                <div style={{
                  background: `linear-gradient(135deg, ${C.green}12, ${C.green}05)`,
                  border: `1px solid ${C.green}25`,
                  borderRadius: "8px", padding: "0.45rem 0.65rem",
                  flex: "1 1 auto",
                }}>
                  <div style={{
                    ...S.sectionHeading, letterSpacing: "1.5px",
                    color: C.midGray, marginBottom: 0,
                  }}>WIRTSCHAFTLICHKEIT</div>
                  <div style={{
                    ...S.valueText, fontSize: "0.95rem", color: C.greenLight, lineHeight: 1.2,
                    marginTop: "0.1rem",
                  }}>{phase.roiValue}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Illustration (with Autarkie ring inside SVG) */}
          <Suspense fallback={<div className="shimmer-placeholder" style={{ width: "100%", aspectRatio: "400/320", borderRadius: 12 }} />}>
            <PhaseVisual phaseNum={phase.num} score={displayScore} />
          </Suspense>
        </div>

        {/* === FINAL RESULT SPECIAL LAYOUT === */}
        {phase.isFinal ? (
          <>
            {/* ── HERO CARDS: CO2 + Gesamtertrag auf einen Blick ── */}
            {phase.heroCards && (() => {
              const cards = heroCards || phase.heroCards;
              return (
              <div className="hero-cards-grid" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}>
                {cards.map((card, ci) => (
                  <div key={ci} style={{
                    background: `linear-gradient(145deg, ${card.accent}18, ${card.accent}06)`,
                    border: `2px solid ${card.accent}60`,
                    borderRadius: "14px",
                    padding: "1.2rem 1.3rem",
                    position: "relative",
                    overflow: "hidden",
                    ...anim(`fadeSlideIn 0.5s ease ${ci * 0.15}s both`),
                  }}>
                    {/* Top glow line */}
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                      background: `linear-gradient(90deg, transparent, ${card.accent}80, transparent)`,
                    }} />
                    {/* Icon + Label */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}>
                      <Icon name={card.icon} size={20} />
                      <span style={{
                        ...S.sectionHeading, marginBottom: 0, color: C.midGray,
                      }}>{card.label}</span>
                    </div>
                    {/* Big value */}
                    <div style={{
                      fontFamily: "Calibri, sans-serif",
                      fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                      fontWeight: 700,
                      color: card.accent === "#2D6A4F" ? C.greenLight : C.goldLight,
                      lineHeight: 1.1,
                      marginBottom: "0.2rem",
                    }}>{card.value}</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                      color: "rgba(255,255,255,0.5)", marginBottom: "0.7rem",
                    }}>{card.sub}</div>
                    {/* Breakdown */}
                    <div style={{
                      borderTop: `1px solid ${card.accent}30`,
                      paddingTop: "0.5rem",
                      display: "flex", flexDirection: "column", gap: "0.3rem",
                    }}>
                      {card.details.map((d, di) => (
                        <div key={di} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                          <span style={{
                            fontFamily: "Calibri, sans-serif", fontSize: "0.8rem",
                            color: "rgba(255,255,255,0.55)",
                          }}>{d.label}</span>
                          <span style={{
                            fontFamily: "Calibri, sans-serif", fontSize: "0.9rem",
                            fontWeight: 700,
                            color: card.accent === "#2D6A4F" ? C.greenLight : C.goldLight,
                            whiteSpace: "nowrap", marginLeft: "0.5rem",
                          }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}

            {/* Ihre Gesamtberechnung (when config active) */}
            {showCalc && (
              <div style={{
                background: `linear-gradient(135deg, ${C.gold}10, ${C.green}06)`,
                border: `2px solid ${C.gold}35`,
                borderRadius: "12px", padding: "1rem 1.2rem",
                marginBottom: "1.25rem",
                ...anim("fadeSlideIn 0.4s ease 0.3s both"),
              }}>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                  letterSpacing: "2.5px", textTransform: "uppercase",
                  color: C.gold, fontWeight: 700, marginBottom: "0.6rem",
                  display: "flex", alignItems: "center", gap: "0.4rem",
                }}>
                  <Icon name="gear" size={13} color={C.gold} />
                  IHRE GESAMTBERECHNUNG
                </div>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: "0.4rem",
                }}>
                  {(() => { const c = analysisOpen ? calc : activeCalc; return [
                    { label: "Investition Standort", value: fmtEuro(c.investStandort) },
                    { label: "Investition BESS", value: fmtEuro(c.investPhase6) },
                    { label: "Gesamtinvestition", value: fmtEuro(c.investGesamt), accent: true },
                    { label: "Einsparung Standort", value: `${fmtEuro(c.einsparungStandort)}/a`, accent: true },
                    { label: "BESS-Erlöse", value: `${fmtEuro(c.bessErloes)}/a`, accent: true },
                    { label: "Amortisation", value: `${c.amortisationStandort} Jahre` },
                    { label: "BESS-Rendite", value: `${c.bessRendite} % p.a.` },
                    { label: "Autarkie-Grad", value: `${c.autarkie} %`, accent: true },
                  ]; })().map((item, i) => (
                    <div key={i} style={{
                      background: "rgba(255,255,255,0.03)", borderRadius: "6px",
                      padding: "0.4rem 0.55rem",
                      borderLeft: item.accent ? `2px solid ${C.gold}60` : "none",
                    }}>
                      <div style={{
                        ...S.labelSmall, color: C.midGray,
                      }}>{item.label}</div>
                      <div style={{
                        ...S.valueText, fontSize: "0.95rem", lineHeight: "normal",
                        color: item.accent ? C.goldLight : C.white,
                      }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System KPIs - 6 big numbers */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{
                ...S.labelTiny, color: C.midGray, marginBottom: "0.6rem",
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
                    ...anim(`fadeSlideIn 0.4s ease ${i * 0.07}s both`),
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", top: 0, left: 0, width: "100%", height: "2px",
                      background: `linear-gradient(90deg, ${C.gold}60, ${C.green}40, transparent)`,
                    }} />
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                      letterSpacing: "1px", textTransform: "uppercase",
                      color: C.midGray, marginBottom: "0.3rem",
                    }}>{kpi.label}</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.35rem",
                      fontWeight: 700, color: C.goldLight, lineHeight: 1.1,
                    }}>{kpi.value}</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                      color: "rgba(255,255,255,0.45)", marginTop: "0.2rem",
                    }}>{kpi.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── INVESTMENT ROADMAP (Final) ───────────── */}
            <div className="cv-auto" style={{ marginBottom: "1.25rem" }}>
              <div style={{
                ...S.labelTiny, color: C.midGray, marginBottom: "0.6rem",
              }}>INVESTITIONS-ROADMAP · RENDITE PRO BAUSTEIN</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {phase.investmentSummary.map((item, i) => {
                  const maxVal = Math.max(...phase.investmentSummary.map(s => s.maxMio));
                  const barPct = Math.max((item.maxMio / maxVal) * 100, 3);
                  return (
                    <div key={i} style={{
                      ...anim(`fadeSlideIn 0.4s ease ${0.1 + i * 0.08}s both`),
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
                            fontFamily: "Georgia, serif", fontSize: "1.05rem",
                            fontWeight: 700, color: C.goldLight,
                            width: "28px", textAlign: "center",
                          }}>{item.phase}</span>
                          <div>
                            <div style={{
                              fontFamily: "Calibri, sans-serif", fontSize: "0.95rem",
                              fontWeight: 700, color: C.white,
                            }}>{item.label}</div>
                            <div style={{
                              fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                              color: C.midGray, marginTop: "0.1rem",
                            }}>{item.range}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {/* Autarkie score dot */}
                          <div style={{
                            display: "flex", alignItems: "center", gap: "0.25rem",
                            fontFamily: "Calibri, sans-serif", fontSize: "0.8rem",
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
                            borderRadius: "6px", padding: "0.3rem 0.6rem",
                            fontFamily: "Calibri, sans-serif", fontSize: "0.8rem",
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
                  ...anim(`fadeSlideIn 0.4s ease 0.7s both`),
                  flexWrap: "wrap", gap: "0.5rem",
                }}>
                  <div>
                    <div style={{
                      ...S.sectionHeading, color: C.midGray, marginBottom: 0,
                    }}>GESAMTINVESTITION</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.35rem",
                      fontWeight: 700, color: C.goldLight, marginTop: "0.15rem",
                    }}>43–70 Mio €</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      ...S.sectionHeading, color: C.midGray, marginBottom: 0,
                    }}>DAVON GRAUSTROM-BESS</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.35rem",
                      fontWeight: 700, color: C.gold, marginTop: "0.15rem",
                    }}>35–48 Mio € <span style={{ fontSize: "0.85rem", color: C.midGray, fontWeight: 400 }}>· sep. Finanzierung</span></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      ...S.sectionHeading, color: C.midGray, marginBottom: 0,
                    }}>AUTARKIE-ZIEL</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.35rem",
                      fontWeight: 700, color: C.greenLight, marginTop: "0.15rem",
                    }}>95 %</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── GESAMTWIRTSCHAFTLICHE BETRACHTUNG ───────── */}
            {phase.economicSummary && (
              <div className="cv-auto" style={{ marginBottom: "1.25rem" }}>
                <div style={{
                  ...S.labelTiny, color: C.midGray, marginBottom: "0.6rem",
                }}>GESAMTWIRTSCHAFTLICHE BETRACHTUNG</div>

                {/* Savings table */}
                <div style={{
                  background: `linear-gradient(135deg, rgba(45,106,79,0.08), rgba(45,106,79,0.02))`,
                  border: `1px solid ${C.green}25`,
                  borderRadius: "10px", padding: "0.85rem 1rem",
                  marginBottom: "0.5rem",
                  ...anim("fadeSlideIn 0.4s ease 0.2s both"),
                }}>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.75rem",
                    letterSpacing: "2px", textTransform: "uppercase",
                    color: C.greenLight, fontWeight: 700, marginBottom: "0.5rem",
                  }}>JÄHRLICHE EINSPARUNGEN & ERLÖSE (PHASEN I–V)</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {phase.economicSummary.savings.map((s, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "0.3rem 0",
                        borderBottom: i < phase.economicSummary.savings.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}>
                        <span style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.9rem",
                          color: "rgba(255,255,255,0.7)",
                        }}>{s.label}</span>
                        <span style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.95rem",
                          fontWeight: 700, color: C.greenLight,
                          whiteSpace: "nowrap", marginLeft: "1rem",
                        }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Total savings line */}
                  <div style={{
                    borderTop: `2px solid ${C.green}40`,
                    marginTop: "0.5rem", paddingTop: "0.5rem",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.95rem",
                      fontWeight: 700, color: C.white,
                    }}>Gesamt jährliche Einsparung</span>
                    <span style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.25rem",
                      fontWeight: 700, color: C.goldLight,
                    }}>{phase.economicSummary.totals.annualSavings}</span>
                  </div>
                </div>

                {/* Three key economic metrics */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "0.4rem", marginBottom: "0.5rem",
                }}>
                  {[
                    { label: "Standort-Invest (I–V)", value: phase.economicSummary.totals.investStandort, sub: "Strom + Wärme + Mobilität" },
                    { label: "Amortisation Standort", value: phase.economicSummary.totals.paybackStandort, sub: "bei 1,4–2,5 Mio €/a Einsparung" },
                    { label: "BESS-Erlöse (Phase VI)", value: phase.economicSummary.totals.bessRevenue, sub: "Eigenständiger Cashflow" },
                  ].map((m, i) => (
                    <div key={i} style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${C.gold}15`,
                      borderRadius: "8px", padding: "0.65rem 0.75rem",
                      ...anim(`fadeSlideIn 0.4s ease ${0.3 + i * 0.08}s both`),
                    }}>
                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                        letterSpacing: "1px", textTransform: "uppercase",
                        color: C.midGray, marginBottom: "0.2rem",
                      }}>{m.label}</div>
                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "1.3rem",
                        fontWeight: 700, color: C.goldLight, lineHeight: 1.1,
                      }}>{m.value}</div>
                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                        color: "rgba(255,255,255,0.4)", marginTop: "0.15rem",
                      }}>{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Conclusion */}
                <div style={{
                  borderLeft: `3px solid ${C.green}`,
                  paddingLeft: "0.8rem",
                  ...anim("fadeSlideIn 0.4s ease 0.5s both"),
                }}>
                  <p style={{
                    fontFamily: "Calibri, sans-serif",
                    fontSize: "0.95rem", color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.6, margin: 0, fontStyle: "italic",
                  }}>{phase.economicSummary.conclusion}</p>
                </div>
              </div>
            )}

            {/* 6 Economic Levers */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{
                ...S.labelTiny, color: C.midGray, marginBottom: "0.6rem",
              }}>SECHS HEBEL · EIN INTEGRIERTES ENERGIESYSTEM</div>
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
                    ...anim(`fadeSlideIn 0.4s ease ${0.3 + i * 0.06}s both`),
                  }}>
                    <span style={{
                      flexShrink: 0, marginTop: "0.05rem",
                      width: "28px", height: "28px", borderRadius: "6px",
                      background: `rgba(255,255,255,0.04)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}><Icon name={l.icon} size={16} /></span>
                    <div>
                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.95rem",
                        fontWeight: 700, color: C.white, marginBottom: "0.1rem",
                      }}>{l.title}</div>
                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                        color: "rgba(255,255,255,0.55)", lineHeight: 1.4,
                      }}>{l.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── REGULATORIK & COMPLIANCE ─── */}
            {phase.regulatorik && (
              <div className="cv-auto" style={{ marginBottom: "1.25rem" }}>
                <div style={{
                  ...S.labelTiny, color: C.midGray, marginBottom: "0.6rem",
                }}>REGULATORIK & COMPLIANCE · KONZERN-ANFORDERUNGEN</div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "0.4rem",
                }}>
                  {phase.regulatorik.map((r, i) => (
                    <div key={i} style={{
                      background: `linear-gradient(135deg, rgba(212,168,67,0.06), rgba(212,168,67,0.02))`,
                      border: `1px solid ${C.gold}20`,
                      borderRadius: "8px", padding: "0.65rem 0.8rem",
                      ...anim(`fadeSlideIn 0.4s ease ${0.1 + i * 0.06}s both`),
                      position: "relative", overflow: "hidden",
                    }}>
                      <div style={{
                        position: "absolute", top: 0, left: 0, width: "3px", height: "100%",
                        background: `linear-gradient(180deg, ${C.gold}60, ${C.gold}20)`,
                      }} />
                      <div style={{
                        display: "flex", alignItems: "center", gap: "0.4rem",
                        marginBottom: "0.25rem",
                      }}>
                        <Icon name={r.icon} size={14} color="currentColor" />
                        <span style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                          fontWeight: 700, color: C.white,
                        }}>{r.title}</span>
                      </div>
                      <p style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.78rem",
                        color: "rgba(255,255,255,0.5)", lineHeight: 1.45,
                        margin: "0 0 0.35rem 0",
                      }}>{r.desc}</p>
                      <div style={{
                        display: "inline-flex",
                        background: `linear-gradient(135deg, ${C.green}25, ${C.green}10)`,
                        border: `1px solid ${C.green}40`,
                        borderRadius: "4px", padding: "0.2rem 0.5rem",
                        fontFamily: "Calibri, sans-serif", fontSize: "0.72rem",
                        fontWeight: 700, color: C.greenLight,
                      }}><Icon name="check" size={11} color="currentColor" style={{ marginRight: "0.2rem" }} />{r.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── RISIKOMANAGEMENT ─── */}
            {phase.riskManagement && (
              <div className="cv-auto" style={{ marginBottom: "1.25rem" }}>
                <div style={{
                  ...S.labelTiny, color: C.midGray, marginBottom: "0.6rem",
                }}>RISIKOMANAGEMENT · STRATEGISCHE ABSICHERUNG</div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "0.4rem",
                }}>
                  {phase.riskManagement.map((r, i) => (
                    <div key={i} style={{
                      background: `linear-gradient(135deg, rgba(45,106,79,0.06), rgba(45,106,79,0.02))`,
                      border: `1px solid ${C.green}20`,
                      borderRadius: "8px", padding: "0.65rem 0.8rem",
                      ...anim(`fadeSlideIn 0.4s ease ${0.2 + i * 0.08}s both`),
                      display: "flex", alignItems: "flex-start", gap: "0.6rem",
                    }}>
                      <span style={{
                        flexShrink: 0, marginTop: "0.05rem",
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: `rgba(45,106,79,0.15)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}><Icon name={r.icon} size={16} /></span>
                      <div>
                        <div style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                          fontWeight: 700, color: C.white, marginBottom: "0.15rem",
                        }}>{r.title}</div>
                        <p style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.78rem",
                          color: "rgba(255,255,255,0.5)", lineHeight: 1.45,
                          margin: "0 0 0.3rem 0",
                        }}>{r.desc}</p>
                        <span style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.75rem",
                          fontWeight: 700, color: C.goldLight,
                        }}>→ {r.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transformation Pillars */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{
                ...S.labelTiny, color: C.midGray, marginBottom: "0.6rem",
              }}>VOM ENERGIEVERBRAUCHER ZUR ENERGIEPLATTFORM</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                {phase.pillars.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    ...anim(`fadeSlideIn 0.4s ease ${0.5 + i * 0.1}s both`),
                  }}>
                    <div style={{
                      background: `linear-gradient(135deg, ${C.green}30, ${C.navy})`,
                      border: `1px solid ${C.green}40`,
                      borderRadius: "10px", padding: "0.55rem 0.85rem",
                      display: "flex", alignItems: "center", gap: "0.4rem",
                    }}>
                      <Icon name={p.icon} size={14} />
                      <div>
                        <div style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.9rem",
                          fontWeight: 700, color: C.white,
                        }}>{p.label}</div>
                        <div style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
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
              ...anim("fadeSlideIn 0.5s ease 0.8s both"),
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
                    fontFamily: "Calibri, sans-serif", fontSize: "1.05rem",
                    fontWeight: 700, color: C.white,
                  }}>Nächster Schritt: Standortanalyse und Wirtschaftlichkeitsbewertung</div>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
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
                    fontFamily: "Calibri, sans-serif", fontSize: "0.8rem",
                    letterSpacing: "2px", textTransform: "uppercase",
                    color: C.midGray, fontWeight: 700, marginBottom: "0.2rem",
                  }}>ANSPRECHPARTNER</div>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "1.0rem",
                    color: C.white,
                  }}>Levin Schober · Elite PV GmbH</div>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.9rem",
                    color: C.midGray, marginTop: "0.1rem",
                  }}>levinschober@elite-pv.de</div>
                </div>
                <a
                  href="mailto:levinschober@elite-pv.de?subject=Eckart%20Werke%20–%20Energietransformation"
                  style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.95rem",
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
                  ...S.labelTiny, color: C.midGray, marginBottom: "0.6rem",
                }}>KENNZAHLEN</div>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem",
                }}>
                  {phase.kpis.map((kpi, i) => (
                    <div key={i} style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px", padding: "0.7rem 0.8rem",
                      ...anim(`fadeSlideIn 0.4s ease ${i * 0.08}s both`),
                    }}>
                      <div style={{
                        ...S.labelSmall, letterSpacing: "1px",
                        color: C.midGray, marginBottom: "0.25rem",
                      }}>{kpi.label}</div>
                      <div style={{
                        ...S.valueText, color: C.goldLight,
                      }}>{kpi.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div>
                <div style={{
                  ...S.labelTiny, color: C.midGray, marginBottom: "0.6rem",
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
                      ...anim(`fadeSlideIn 0.4s ease ${i * 0.06}s both`),
                    }}>
                      <Icon name="check" size={14} color={C.green} style={{ marginTop: "0.05rem" }} />
                      <span style={{
                        fontFamily: "Calibri, sans-serif",
                        fontSize: "0.95rem", color: "rgba(255,255,255,0.8)",
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
                  ...S.labelTiny, color: C.midGray, marginBottom: "0.6rem",
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
                        ...anim(`fadeSlideIn 0.4s ease ${0.2 + i * 0.06}s both`),
                      }}>
                        <span style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.95rem",
                          color: "rgba(255,255,255,0.8)",
                        }}>{inv.label}</span>
                        <span style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "1.05rem",
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
                      ...anim(`fadeSlideIn 0.4s ease 0.4s both`),
                    }}>
                      <span style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.8rem",
                        letterSpacing: "1.5px", textTransform: "uppercase",
                        color: C.midGray, fontWeight: 700,
                      }}>GESAMT PHASE {phase.num}</span>
                      <span style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "1.2rem",
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
                    ...anim(`fadeSlideIn 0.4s ease 0.3s both`),
                  }}>
                    <div style={{
                      ...S.sectionHeading, color: C.midGray, marginBottom: "0.4rem",
                    }}>RENDITE-HEBEL</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.0rem",
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
                          fontFamily: "Calibri, sans-serif", fontSize: "1.15rem",
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
                        fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                        color: C.midGray,
                      }}>Autarkie-Status: <span style={{ color: C.goldLight, fontWeight: 700 }}>{phase.independenceLabel}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── FÖRDERMITTEL (Normal Phases) ─── */}
            {phase.funding && phase.funding.length > 0 && (
              <div style={{ marginTop: "0.75rem" }}>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                  letterSpacing: "2.5px", textTransform: "uppercase",
                  color: C.midGray, fontWeight: 700, marginBottom: "0.4rem",
                }}>FÖRDERMITTEL & FINANZIERUNGSHEBEL</div>
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: "0.35rem",
                }}>
                  {phase.funding.map((f, i) => (
                    <div key={i} style={{
                      background: `linear-gradient(135deg, ${C.gold}10, ${C.gold}04)`,
                      border: `1px solid ${C.gold}25`,
                      borderRadius: "8px", padding: "0.45rem 0.7rem",
                      ...anim(`fadeSlideIn 0.4s ease ${0.4 + i * 0.08}s both`),
                      display: "flex", alignItems: "center", gap: "0.5rem",
                    }}>
                      <span style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.85rem",
                        fontWeight: 700, color: C.goldLight,
                      }}>{f.label}</span>
                      <span style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.5)",
                      }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── IHRE BERECHNUNG (when config active, normal phases) ── */}
            {showCalc && (() => {
              const items = phaseCalcItems;
              if (!items) return null;
              return (
                <div style={{
                  marginTop: "0.75rem",
                  background: `linear-gradient(135deg, ${C.gold}08, ${C.green}05)`,
                  border: `1px solid ${C.gold}30`,
                  borderRadius: "10px", padding: "0.7rem 0.85rem",
                  ...anim("fadeSlideIn 0.4s ease 0.5s both"),
                }}>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                    letterSpacing: "2.5px", textTransform: "uppercase",
                    color: C.gold, fontWeight: 700, marginBottom: "0.45rem",
                    display: "flex", alignItems: "center", gap: "0.35rem",
                  }}>
                    <Icon name="gear" size={11} color={C.gold} />
                    IHRE BERECHNUNG
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(auto-fit, minmax(130px, 1fr))`,
                    gap: "0.35rem",
                  }}>
                    {items.map((item, i) => (
                      <div key={i} style={{
                        background: "rgba(255,255,255,0.03)", borderRadius: "6px",
                        padding: "0.35rem 0.5rem",
                        borderLeft: item.accent ? `2px solid ${C.gold}60` : "none",
                      }}>
                        <div style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                          color: C.midGray, letterSpacing: "0.5px",
                        }}>{item.label}</div>
                        <div style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.9rem",
                          fontWeight: 700, color: item.accent ? C.goldLight : C.white,
                        }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
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
            fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
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
                fontSize: "0.85rem", fontFamily: "Calibri, sans-serif",
                fontWeight: 600,
                background: i <= active
                  ? `linear-gradient(135deg, ${C.green}25, ${C.green}10)`
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${i <= active ? C.green + "40" : "rgba(255,255,255,0.05)"}`,
                color: i <= active ? C.greenLight : C.midGray,
                transition: "all 0.4s ease",
              }}>
                <Icon name={i <= active ? "check" : "circle"} size={10} />
                <span>{["Nach I", "Nach II", "Nach III", "Nach IV", "Nach V", "Gesamt"][i]}: {c}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: "1rem 2rem",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "0.5rem",
        fontFamily: "Calibri, sans-serif", fontSize: "0.75rem", color: C.midGray,
        position: "relative", zIndex: 2,
      }}>
        <span>ECKART GmbH · Güntersthal 4, 91235 Hartenstein</span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.25rem",
            padding: "0.15rem 0.4rem", borderRadius: "3px",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "0.7rem", color: "rgba(255,255,255,0.3)",
          }}><Icon name="arrowLeft" size={8} style={{ opacity: 0.5 }} /> <Icon name="arrowRight" size={8} style={{ opacity: 0.5 }} /> Phasen wechseln</span>
          <span style={{ fontStyle: "italic" }}>Energiewirtschaftliche Konzeptbegleitung: Elite PV</span>
        </span>
      </footer>

      <style>{`
        /* content-visibility for below-fold Gesamtergebnis sections */
        .cv-auto {
          content-visibility: auto;
          contain-intrinsic-size: auto 300px;
        }
        .skip-link {
          position: absolute;
          left: -9999px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
          z-index: 10000;
        }
        .skip-link:focus {
          position: fixed;
          top: 8px;
          left: 8px;
          width: auto;
          height: auto;
          padding: 0.6rem 1.2rem;
          background: #D4A843;
          color: #1B2A4A;
          font-family: Calibri, sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          border-radius: 6px;
          text-decoration: none;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        /* Performance: CSS containment for independent subtrees */
        .pitch-grid > div {
          contain: content;
        }
        @-webkit-keyframes fadeSlideIn {
          from { opacity: 0; -webkit-transform: translateY(12px); transform: translateY(12px); }
          to { opacity: 1; -webkit-transform: translateY(0); transform: translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; -webkit-transform: translateY(12px); transform: translateY(12px); }
          to { opacity: 1; -webkit-transform: translateY(0); transform: translateY(0); }
        }
        @-webkit-keyframes ringPulse {
          0%, 100% { -webkit-filter: drop-shadow(0 0 8px ${C.gold}20); filter: drop-shadow(0 0 8px ${C.gold}20); }
          50% { -webkit-filter: drop-shadow(0 0 16px ${C.gold}40); filter: drop-shadow(0 0 16px ${C.gold}40); }
        }
        @keyframes ringPulse {
          0%, 100% { -webkit-filter: drop-shadow(0 0 8px ${C.gold}20); filter: drop-shadow(0 0 8px ${C.gold}20); }
          50% { -webkit-filter: drop-shadow(0 0 16px ${C.gold}40); filter: drop-shadow(0 0 16px ${C.gold}40); }
        }
        * { box-sizing: border-box; margin: 0; }
        button:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }
        a:hover { opacity: 0.9; }
        @media (max-width: 800px) {
          header, footer, .content { padding-left: 1rem !important; padding-right: 1rem !important; }
        }

        /* ── Mobile Responsive Fixes ── */
        @media (max-width: 768px) {
          /* Issue 1: Collapse two-column grid to single column */
          .pitch-grid {
            grid-template-columns: 1fr !important;
          }
          /* Hero cards stack on mobile */
          .hero-cards-grid {
            grid-template-columns: 1fr !important;
          }
          /* Issue 2: Header buttons wrap gracefully */
          .header-actions {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }
          /* Issue 3: Touch targets min 44px */
          .progress-dot {
            min-height: 44px !important;
            min-width: 44px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: relative !important;
          }
          .progress-dot::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            min-width: 44px;
            min-height: 44px;
          }
          .phase-btn {
            min-height: 44px !important;
            min-width: 44px !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Shimmer loading placeholder */
        .shimmer-placeholder {
          background: linear-gradient(90deg, rgba(27,42,74,0.3) 25%, rgba(212,168,67,0.08) 50%, rgba(27,42,74,0.3) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Print Stylesheet ── */
        @media print {
          body { background: white !important; color: black !important; }
          .pitch-root { background: white !important; min-height: auto !important; }
          .skip-link, .progress-dot, .header-actions button,
          .phase-btn { display: none !important; }
          header { padding: 1rem !important; }
          main { padding: 1rem !important; }
          .pitch-grid { grid-template-columns: 1fr !important; }
          svg { max-width: 100% !important; height: auto !important; }
          * { color: black !important; background: white !important;
              box-shadow: none !important; text-shadow: none !important; }
          h1, h2 { color: #1B2A4A !important; }
          a { text-decoration: underline !important; }
          @page { margin: 2cm; }
        }
      `}</style>

      {/* ── Combined Analysis & Kalkulation Overlay (lazy) ── */}
      {analysisOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9000, background: "rgba(10,18,32,0.97)",
          display: "flex", flexDirection: "column",
        }}>
          <style>{`@media (max-width: 768px) { .analysis-split { flex-direction: column !important; } .analysis-split > div:first-child { width: 100% !important; max-height: 40vh; border-right: none !important; border-bottom: 1px solid rgba(212,168,67,0.2); } }`}</style>
          {/* Sticky header */}
          <div style={{
            position: "sticky", top: 0, zIndex: 10, background: "rgba(27,42,74,0.97)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(212,168,67,0.2)",
            padding: "0.6rem 1.2rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ fontFamily: "Calibri, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: C.gold, letterSpacing: "0.5px" }}>Analyse & Kalkulation</div>
              </div>
              <button onClick={() => setAnalysisOpen(false)} aria-label="Panel schließen" style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#ccc", borderRadius: "8px", width: 44, height: 44, fontSize: "1rem",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Calibri, sans-serif",
              }}><Icon name="close" size={14} /></button>
            </div>
            <div style={{ fontFamily: "Calibri, sans-serif", fontSize: "0.68rem", color: C.midGray, letterSpacing: "1px" }}>
              Kalkulation · Marktanalyse · BESS-Optimierung
            </div>
          </div>

          {/* Combined content: ConfigPanel left sidebar + MarketAnalysis main area */}
          <div className="analysis-split" style={{ flex: 1, overflow: "auto", display: "flex" }}>
            <Suspense fallback={null}>
              {/* Left sidebar: Kalkulation sliders */}
              <div style={{
                width: "min(380px, 40vw)", flexShrink: 0,
                borderRight: `1px solid ${C.gold}20`,
                background: "rgba(27,42,74,0.3)",
                overflow: "hidden", display: "flex", flexDirection: "column",
              }}>
                <ConfigPanel
                  config={config}
                  setConfig={setConfig}
                  calc={calc}
                  onClose={() => setAnalysisOpen(false)}
                  onSave={() => { setSavedConfig({ ...config }); setAnalysisOpen(false); setSaveToast(true); setTimeout(() => setSaveToast(false), 2500); }}
                  embedded
                />
              </div>

              {/* Right main area: Marktanalyse */}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <MarketAnalysis
                  config={config}
                  configActive={true}
                  onClose={() => setAnalysisOpen(false)}
                  embedded
                />
              </div>
            </Suspense>
          </div>
        </div>
      )}

      {/* ── PDF Export Modal (lazy) ── */}
      {exportOpen && (
        <Suspense fallback={null}>
          <ExportModal
            phases={phases}
            config={configSaved ? savedConfig : config}
            calc={configSaved ? activeCalc : calc}
            configActive={showCalc}
            onClose={() => setExportOpen(false)}
          />
        </Suspense>
      )}

      {/* Save confirmation toast */}
      {saveToast && (
        <div style={{
          position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
          background: `linear-gradient(135deg, ${C.green}, ${C.green}dd)`,
          color: "#fff", padding: "0.6rem 1.4rem", borderRadius: "8px",
          fontFamily: "Calibri, sans-serif", fontSize: "0.9rem", fontWeight: 700,
          display: "flex", alignItems: "center", gap: "0.4rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          zIndex: 9999,
          ...anim("fadeSlideIn 0.3s ease"),
        }} role="status" aria-live="polite">
          <Icon name="check" size={16} color="#fff" /> Kalkulation gespeichert
        </div>
      )}
    </div>
  );
}
