import { useState, useEffect, useRef, useMemo } from "react";
import PhaseVisual from "./PhaseVisuals";
import ConfigPanel, { defaultConfig, calculateAll, fmtEuro, getPhaseCalcItems, getDynamicHeroCards } from "./ConfigPanel";
import ExportModal from "./PdfExport";
import MarketAnalysis from "./MarketAnalysis";

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
    description: "50 Hektar Industriegelände, 800+ Mitarbeiter am Standort, energieintensive Aluminiumverarbeitung – und bereits 2 MWp Freiflächen-PV in Betrieb. Die Analyse bewertet das Gesamtpotenzial: Gebäude, Prozesswärme, Lastprofile und den 110-kV-Netzanschluss.",
    results: [
      "Bestandsaufnahme: 2 MWp Freiflächen-PV dokumentiert",
      "Vermessung aller Hallen und Flächen (50 ha Gelände)",
      "Dachgutachten mit Sanierungsplan (Cluster A–E)",
      "Lastprofil 15-Min-Intervall (12 Monate)",
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
    icon: "🔍",
    highlights: [
      { icon: "📡", title: "Drohnen- & Laservermessung", text: "50 ha Gelände vollständig digital erfasst — Gebäude, Freiflächen, Verschattung" },
      { icon: "📊", title: "15-Min-Lastprofil", text: "12 Monate reale Verbrauchsdaten als Grundlage für jede Dimensionierung" },
      { icon: "🔬", title: "Thermografie & Abwärme", text: "IR-Aufnahmen aller Hallen — Wärmeverluste und Abwärmequellen identifiziert" },
      { icon: "⚡", title: "110-kV Netzanalyse", text: "Einspeise- und Bezugskapazität dokumentiert — Grundlage für Phase VI" },
    ],
  },
  {
    num: "II",
    title: "Gebäudehülle & PV",
    subtitle: "Das physische Fundament",
    months: "Monat 4–12",
    color: C.green,
    headline: "Belastbare Gebäude, produktive Flächen",
    description: "Auf 50 Hektar Gelände mit Dutzenden Hallen liegt enormes Potenzial. Dachsanierung + PV als integriertes 30-Jahres-Investment. Vier Erzeugungsarten ergänzen sich jahreszeitlich. Die 800–1.200 Mitarbeiter-Stellplätze werden zu Carport-Kraftwerken mit Ladeinfrastruktur.",
    results: [
      "Dachsanierung priorisierter Cluster (A–E)",
      "Dach-PV in Betrieb (2,5–5,0 MWp)",
      "Fassaden-PV Süd/SW (0,5–1,0 MWp)",
      "Carport-PV: 800–1.200 Stellplätze (1,5–3,0 MWp)",
      "E-Ladeinfrastruktur an Carport-Stellplätzen",
      "Gesamt inkl. Bestand: 6,5–11,0 MWp",
      "Eigenverbrauch bereits >60 %",
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
    icon: "🏗️",
    highlights: [
      { icon: "🏭", title: "Dach-PV auf allen Hallen", text: "Cluster A–E saniert und mit PV bestückt — 3,5–6 MWp allein auf den Dächern" },
      { icon: "🏢", title: "Fassaden-PV Süd/West", text: "Vertikale Module erzeugen auch bei flachem Sonnenstand — ideal im Winter" },
      { icon: "🅿️", title: "Carport-Kraftwerke", text: "800–1.200 Stellplätze mit Solar-Carports — Laden und Erzeugen kombiniert" },
      { icon: "📈", title: "Vier Erzeugungsarten", text: "Dach + Fassade + Carport + Freifläche ergänzen sich jahreszeitlich optimal" },
    ],
  },
  {
    num: "III",
    title: "Speicher & Steuerung",
    subtitle: "Vom Erzeuger zum steuerbaren System",
    months: "Monat 10–18",
    color: C.green,
    headline: "Der Unterschied zwischen Erzeugung und Kontrolle",
    description: "Mit 6,5–11,0 MWp Gesamtleistung wird Steuerbarkeit zum entscheidenden Faktor. Der Speicher wird 1:1 zur PV-Leistung ausgelegt – 6,5–11,0 MWh bei 0,5C Entladerate (3,25–5,5 MW). Zusammen mit einem standortweiten EMS entsteht ein vollständig steuerbares Energiesystem mit Peak Shaving und Spotmarkt-Optimierung.",
    results: [
      "BESS 6,5–11,0 MWh in Betrieb (1:1 PV, 0,5C / 3,25–5,5 MW)",
      "Peak Shaving aktiv (10–15 % Leistungspreis-Reduktion)",
      "Spotmarkt-Strategie Winter implementiert",
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
    icon: "⚡",
    highlights: [
      { icon: "🔋", title: "1:1 PV-Speicher", text: "6,5–11 MWh Kapazität — exakt auf die PV-Leistung dimensioniert (0,5C)" },
      { icon: "🧠", title: "Intelligentes EMS", text: "Prognosebasierte Steuerung: PV-Ertrag, Lastprofile und Wetter in Echtzeit" },
      { icon: "📉", title: "Peak Shaving aktiv", text: "Lastspitzen um 10–15 % gekappt — direkte Reduktion der Leistungspreise" },
      { icon: "💰", title: "Spotmarkt-Trading", text: "Günstig laden bei 2 ct/kWh, teuer zurückspeisen — automatisiert durch EMS" },
    ],
  },
  {
    num: "IV",
    title: "Wärmekonzept",
    subtitle: "Die thermische Lücke schließen",
    months: "Monat 15–24",
    color: C.goldDim,
    headline: "50 Hektar Industriewärme – das erfordert eine industrielle Lösung",
    description: "Aluminiumpigment-Produktion bedeutet energieintensive Prozesswärme: Kugelmühlen, Atomisierung, Trocknungsanlagen. Auf 50 Hektar mit dutzenden Hallen reicht keine Einzelanlage. Die Lösung: eine 5–10 MW Wärmepumpen-Kaskade, die Abwärme aus Produktion und Druckluft als Quelle nutzt, ein standortweites Wärmenetz und Pufferspeicher für Lastspitzen.",
    results: [
      "5–10 MW Wärmepumpen-Kaskade in Betrieb (Hochtemperatur bis 90 °C)",
      "Standortweites Wärmenetz verbindet alle Produktionshallen",
      "Abwärmekaskade: Mühlen → Kompressoren → Trockner → Rücklauf",
      "Pufferspeicher (200–500 m³) für thermische Lastspitzen",
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
    icon: "🔥",
    highlights: [
      { icon: "♨️", title: "WP-Kaskade 5–10 MW", text: "Hochtemperatur-Wärmepumpen bis 90 °C — direkt aus industrieller Abwärme" },
      { icon: "🔄", title: "Abwärme-Kaskade", text: "Mühlen → Kompressoren → Trockner → Rücklauf — keine Energie geht verloren" },
      { icon: "🏗️", title: "Standortweites Netz", text: "Alle Produktionshallen über ein zentrales Wärmenetz verbunden" },
      { icon: "🌿", title: "65–80 % weniger Gas", text: "Fossile Kessel nur noch als Spitzenlast-Reserve — CO₂-Bilanz drastisch verbessert" },
    ],
  },
  {
    num: "V",
    title: "Ladeinfrastruktur",
    subtitle: "Mobilität elektrifizieren",
    months: "Monat 15–24",
    color: C.greenLight,
    headline: "800 Mitarbeiter, Fuhrpark, LKW-Logistik – alles elektrisch vom eigenen Dach",
    description: "Der eigene PV-Strom wird zum günstigsten Kraftstoff am Standort. 60+ AC-Ladepunkte für Mitarbeiter und Dienstwagen, DC-Schnelllader für den Fuhrpark und ein HPC-Depot für die LKW-Logistik. Dynamisches Lastmanagement integriert alles ins EMS – ohne Netzausbau. Ab 2026 greift zudem die GEIG-Ladepflicht für Unternehmen.",
    results: [
      "60+ AC-Wallboxen (22 kW) auf Mitarbeiter- & Besucherparkplätzen",
      "4–6 DC-Schnelllader (50–150 kW) für Firmenflotte",
      "4–6 HPC-Ladepunkte (150–400 kW CCS) für E-LKW Depot",
      "Dynamisches Lastmanagement über bestehendes EMS",
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
    icon: "🔌",
    highlights: [
      { icon: "🔌", title: "60+ AC-Wallboxen", text: "Mitarbeiter laden während der Arbeit — direkt vom eigenen PV-Strom" },
      { icon: "⚡", title: "DC-Fleet 150 kW", text: "Firmenflotte in 30 Min. geladen — Schnellladung aus dem Betriebsspeicher" },
      { icon: "🚛", title: "HPC-LKW-Depot", text: "150–400 kW CCS-Ladung für E-LKW — Logistik wird elektrisch" },
      { icon: "📋", title: "GEIG-konform ab 2026", text: "Gesetzliche Ladepflicht für Unternehmen erfüllt — keine Nachrüstung nötig" },
    ],
  },
  {
    num: "VI",
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
    icon: "🏭",
    highlights: [
      { icon: "🏦", title: "Separates Investment", text: "Eigenständige Projektfinanzierung möglich — unabhängig von Standort-Invest" },
      { icon: "📊", title: "Drei Erlösströme", text: "Arbitrage + Regelenergie (FCR/aFRR) + Redispatch — maximale Diversifikation" },
      { icon: "⚡", title: "100 MW / 200 MWh", text: "Großspeicher am 110-kV-Netz — eine der größten Anlagen in der Region" },
      { icon: "💹", title: "15–25 % p.a. Rendite", text: "Cashflow vom ersten Betriebstag — Amortisation in 4–6 Jahren realistisch" },
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
      { icon: "⚡", title: "Reduktion externer Strombezug", desc: "~800–1.400 T€/a Einsparung durch Eigenerzeugung" },
      { icon: "📉", title: "Lastspitzenreduktion", desc: "10–15 % Peak Shaving → 100–200 T€/a Leistungspreis-Senkung" },
      { icon: "🔥", title: "Gaskosten-Reduktion", desc: "65–80 % weniger → 300–600 T€/a Einsparung" },
      { icon: "🔌", title: "Kraftstoff-Elektrifizierung", desc: "~65 % weniger Mobilitätskosten → 110–180 T€/a" },
      { icon: "🎯", title: "Aktive Steuerbarkeit", desc: "Echtzeit-EMS optimiert Erzeugung, Speicher und Verbrauch" },
      { icon: "🏭", title: "BESS-Ertragsmodell", desc: "15–25 % p.a. auf 35–48 Mio € → eigenständiger Cashflow" },
    ],
    /* ── Two hero numbers for Vollausbau at-a-glance ── */
    heroCards: [
      {
        icon: "🌿", accent: "#2D6A4F",
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
        icon: "💰", accent: "#D4A843",
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
      { icon: "📋", title: "CSRD-Berichtspflicht", desc: "Ab 2025 verpflichtend für große Unternehmen — Scope 1–3 Emissionen müssen offengelegt und reduziert werden", status: "Erfüllt durch Phasen I–VI" },
      { icon: "🏛️", title: "EU-Taxonomie", desc: "Investitionen gelten als nachhaltig — verbessert ESG-Rating und Zugang zu Green Finance", status: "Taxonomie-konform" },
      { icon: "💨", title: "CO₂-Bepreisung", desc: "Nationaler CO₂-Preis steigt von 55 €/t (2025) auf 65 €/t (2026) — jedes Jahr Nicht-Handeln wird teurer", status: "264–312 T€/a vermieden" },
      { icon: "⚡", title: "EnEfG (Energieeffizienzgesetz)", desc: "Unternehmen > 7,5 GWh/a müssen Energiemanagementsystem und Effizienzmaßnahmen nachweisen", status: "Vollständig abgedeckt" },
      { icon: "🌍", title: "CBAM (CO₂-Grenzausgleich)", desc: "Ab 2026 CO₂-Zölle auf Importe — ECKART als Exporteur profitiert von niedrigem CO₂-Fußabdruck", status: "Wettbewerbsvorteil" },
      { icon: "🔌", title: "GEIG (Ladepflicht)", desc: "Ab 2026 Ladepflicht für Nichtwohngebäude > 20 Stellplätze — durch Phase V vollständig erfüllt", status: "Seit Phase V erfüllt" },
    ],
    riskManagement: [
      { icon: "📊", title: "Energiepreisvolatilität", desc: "95 % Autarkie eliminiert Abhängigkeit von Strom- und Gaspreisschwankungen", impact: "Kalkulierbare Kosten" },
      { icon: "🛡️", title: "Versorgungssicherheit", desc: "Eigenerzeugung + Speicher = Inselfähigkeit bei Netzstörungen — Produktion läuft weiter", impact: "Kein Produktionsausfall" },
      { icon: "🌐", title: "Geopolitische Unabhängigkeit", desc: "Keine Abhängigkeit von fossilen Importen — Standort ist energiepolitisch resilient", impact: "Strategische Absicherung" },
      { icon: "📈", title: "Regulatorisches Risiko", desc: "Steigende CO₂-Preise, verschärfte Berichtspflichten — proaktives Handeln statt Nachrüsten", impact: "Zukunftssicherheit" },
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
      { label: "Eigenerzeugung", phase: "II", icon: "☀️" },
      { label: "Steuerbarkeit", phase: "III", icon: "⚡" },
      { label: "Wärmeautarkie", phase: "IV", icon: "🔥" },
      { label: "E-Mobilität", phase: "V", icon: "🔌" },
      { label: "Ertragsmodell", phase: "VI", icon: "🏭" },
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
    icon: "🏆",
    highlights: [
      { icon: "🎯", title: "95 % Autarkie", text: "Strom, Wärme und Mobilität nahezu vollständig aus eigener Erzeugung" },
      { icon: "💰", title: "1,4–2,5 Mio €/a", text: "Jährliche Einsparung über alle Energiedimensionen — ab Jahr 1" },
      { icon: "⏱️", title: "Amortisation 6–9 J.", text: "Standort-Invest (Phasen I–V) amortisiert sich innerhalb eines Jahrzehnts" },
      { icon: "🏭", title: "Eigenständiger Cashflow", text: "Graustrom-BESS als separates Ertragsmodell mit 15–25 % p.a." },
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
  const [configOpen, setConfigOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [config, setConfig] = useState(defaultConfig);
  const [savedConfig, setSavedConfig] = useState(null);
  const configSaved = savedConfig !== null;
  const calc = useMemo(() => calculateAll(config), [config]);
  const activeCalc = useMemo(() => configSaved ? calculateAll(savedConfig) : calc, [configSaved, savedConfig, calc]);
  // showCalc: true when presentation should display calculated values (saved OR panel open)
  const showCalc = configOpen || configSaved;

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
          {/* Kalkulator toggle */}
          <button
            onClick={() => setConfigOpen(o => !o)}
            style={{
              background: configSaved ? `${C.green}25` : configOpen ? `${C.gold}20` : "rgba(255,255,255,0.06)",
              border: `1px solid ${configSaved ? C.green + "60" : configOpen ? C.gold + "50" : "rgba(255,255,255,0.12)"}`,
              borderRadius: "6px", padding: "0.3rem 0.7rem",
              fontFamily: "Calibri, sans-serif", fontSize: "0.68rem",
              letterSpacing: "1.5px", textTransform: "uppercase",
              fontWeight: 700, color: configSaved ? C.green : configOpen ? C.gold : C.midGray,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem",
              transition: "all 0.3s", marginTop: "0.6rem", whiteSpace: "nowrap",
            }}
          >{configSaved ? "✓" : "⚙"} Kalkulator</button>
          {configSaved && (
            <button
              onClick={() => { setSavedConfig(null); setConfig(defaultConfig); setConfigOpen(false); }}
              style={{
                background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.3)",
                borderRadius: "6px", padding: "0.3rem 0.7rem",
                fontFamily: "Calibri, sans-serif", fontSize: "0.68rem",
                letterSpacing: "1.5px", textTransform: "uppercase",
                fontWeight: 700, color: "#ff8888",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem",
                transition: "all 0.3s", marginTop: "0.6rem", whiteSpace: "nowrap",
              }}
            >↺ Zurücksetzen</button>
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
          >📄 PDF Export</button>
          <button
            onClick={() => setMarketOpen(true)}
            style={{
              background: "rgba(212,168,67,0.15)", border: "1px solid rgba(212,168,67,0.4)",
              color: C.goldLight, borderRadius: "2rem", padding: "0.35rem 1rem",
              fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.03em",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem",
              transition: "all 0.3s", whiteSpace: "nowrap",
            }}
          >📊 Marktanalyse</button>
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
      <div key={animKey} style={{
        padding: "1rem 2rem 2rem",
        position: "relative", zIndex: 2,
        animation: "fadeSlideIn 0.5s ease forwards",
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
            {phase.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "Calibri, sans-serif", fontSize: "0.75rem",
              letterSpacing: "3px", textTransform: "uppercase",
              color: C.gold, fontWeight: 700, marginBottom: "0.2rem",
            }}>{phase.isFinal ? "Gesamtergebnis" : `Phase ${phase.num}`} · {phase.subtitle}</div>
            <h2 style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
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
        <div style={{
          display: "grid",
          gridTemplateColumns: "5fr 4fr",
          gap: "1.25rem",
          alignItems: "start",
          marginBottom: "1.25rem",
        }}>
          {/* Left: Rich content panel */}
          <div>
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
                    background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))`,
                    borderRadius: "7px",
                    padding: "0.45rem 0.5rem",
                    borderLeft: `2px solid ${phase.color || C.gold}50`,
                    animation: `fadeSlideIn 0.3s ease ${0.1 + i * 0.05}s both`,
                  }}>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
                      letterSpacing: "0.5px", textTransform: "uppercase",
                      color: C.midGray, marginBottom: "0.15rem",
                    }}>{kpi.label}</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.05rem",
                      fontWeight: 700, color: C.goldLight, lineHeight: 1.1,
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
                    border: `1px solid ${phase.color || C.gold}15`,
                    borderRadius: "8px",
                    padding: "0.45rem 0.55rem",
                    animation: `fadeSlideIn 0.4s ease ${0.15 + i * 0.07}s both`,
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.3rem",
                      marginBottom: "0.15rem",
                    }}>
                      <span style={{ fontSize: "0.9rem" }}>{h.icon}</span>
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
                  fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
                  letterSpacing: "2px", textTransform: "uppercase",
                  color: C.midGray, fontWeight: 700, marginBottom: "0.35rem",
                }}>{phase.isFinal ? "ERGEBNISSE" : "LIEFERERGEBNISSE"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  {phase.results.slice(0, 5).map((r, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: "0.4rem",
                      animation: `fadeSlideIn 0.3s ease ${0.25 + i * 0.05}s both`,
                    }}>
                      <span style={{
                        color: phase.color || C.gold, fontSize: "0.6rem",
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
                animation: "fadeSlideIn 0.4s ease 0.5s both",
              }}>
                <div style={{
                  background: `linear-gradient(135deg, ${phase.color || C.gold}12, ${phase.color || C.gold}05)`,
                  border: `1px solid ${phase.color || C.gold}25`,
                  borderRadius: "8px", padding: "0.45rem 0.65rem",
                  flex: "1 1 auto",
                }}>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
                    letterSpacing: "1.5px", textTransform: "uppercase",
                    color: C.midGray, fontWeight: 700,
                  }}>INVESTMENT</div>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "1.1rem",
                    fontWeight: 700, color: C.goldLight, lineHeight: 1.2,
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
                    fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
                    letterSpacing: "1.5px", textTransform: "uppercase",
                    color: C.midGray, fontWeight: 700,
                  }}>WIRTSCHAFTLICHKEIT</div>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.95rem",
                    fontWeight: 700, color: C.greenLight, lineHeight: 1.2,
                    marginTop: "0.1rem",
                  }}>{phase.roiValue}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Illustration (with Autarkie ring inside SVG) */}
          <PhaseVisual phaseNum={phase.num} score={displayScore} />
        </div>

        {/* === FINAL RESULT SPECIAL LAYOUT === */}
        {phase.isFinal ? (
          <>
            {/* ── HERO CARDS: CO2 + Gesamtertrag auf einen Blick ── */}
            {phase.heroCards && (() => {
              const cards = showCalc ? getDynamicHeroCards(configOpen ? calc : activeCalc) : phase.heroCards;
              return (
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}>
                {cards.map((card, ci) => (
                  <div key={ci} style={{
                    background: `linear-gradient(145deg, ${card.accent}18, ${card.accent}06)`,
                    border: `2px solid ${card.accent}40`,
                    borderRadius: "14px",
                    padding: "1.2rem 1.3rem",
                    position: "relative",
                    overflow: "hidden",
                    animation: `fadeSlideIn 0.5s ease ${ci * 0.15}s both`,
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
                      <span style={{ fontSize: "1.3rem" }}>{card.icon}</span>
                      <span style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                        letterSpacing: "2px", textTransform: "uppercase",
                        color: C.midGray, fontWeight: 700,
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
                animation: "fadeSlideIn 0.4s ease 0.3s both",
              }}>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
                  letterSpacing: "2.5px", textTransform: "uppercase",
                  color: C.gold, fontWeight: 700, marginBottom: "0.6rem",
                  display: "flex", alignItems: "center", gap: "0.4rem",
                }}>
                  <span style={{ fontSize: "0.8rem" }}>⚙</span>
                  IHRE GESAMTBERECHNUNG
                </div>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: "0.4rem",
                }}>
                  {(() => { const c = configOpen ? calc : activeCalc; return [
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
                        fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
                        color: C.midGray, letterSpacing: "0.5px", textTransform: "uppercase",
                      }}>{item.label}</div>
                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.95rem",
                        fontWeight: 700, color: item.accent ? C.goldLight : C.white,
                      }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System KPIs - 6 big numbers */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{
                fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
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
                      fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
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
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{
                fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
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
                  animation: `fadeSlideIn 0.4s ease 0.7s both`,
                  flexWrap: "wrap", gap: "0.5rem",
                }}>
                  <div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                      letterSpacing: "2px", textTransform: "uppercase",
                      color: C.midGray, fontWeight: 700,
                    }}>GESAMTINVESTITION</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.35rem",
                      fontWeight: 700, color: C.goldLight, marginTop: "0.15rem",
                    }}>43–70 Mio €</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                      letterSpacing: "2px", textTransform: "uppercase",
                      color: C.midGray, fontWeight: 700,
                    }}>DAVON GRAUSTROM-BESS</div>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "1.35rem",
                      fontWeight: 700, color: C.gold, marginTop: "0.15rem",
                    }}>35–48 Mio € <span style={{ fontSize: "0.85rem", color: C.midGray, fontWeight: 400 }}>· sep. Finanzierung</span></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                      letterSpacing: "2px", textTransform: "uppercase",
                      color: C.midGray, fontWeight: 700,
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
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
                }}>GESAMTWIRTSCHAFTLICHE BETRACHTUNG</div>

                {/* Savings table */}
                <div style={{
                  background: `linear-gradient(135deg, rgba(45,106,79,0.08), rgba(45,106,79,0.02))`,
                  border: `1px solid ${C.green}25`,
                  borderRadius: "10px", padding: "0.85rem 1rem",
                  marginBottom: "0.5rem",
                  animation: "fadeSlideIn 0.4s ease 0.2s both",
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
                      animation: `fadeSlideIn 0.4s ease ${0.3 + i * 0.08}s both`,
                    }}>
                      <div style={{
                        fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
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
                  animation: "fadeSlideIn 0.4s ease 0.5s both",
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
                fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                letterSpacing: "3px", textTransform: "uppercase",
                color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
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
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
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
                      animation: `fadeSlideIn 0.4s ease ${0.1 + i * 0.06}s both`,
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
                        <span style={{ fontSize: "0.9rem" }}>{r.icon}</span>
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
                      }}>✓ {r.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── RISIKOMANAGEMENT ─── */}
            {phase.riskManagement && (
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{
                  fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: C.midGray, fontWeight: 700, marginBottom: "0.6rem",
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
                      animation: `fadeSlideIn 0.4s ease ${0.2 + i * 0.08}s both`,
                      display: "flex", alignItems: "flex-start", gap: "0.6rem",
                    }}>
                      <span style={{
                        fontSize: "1.1rem", flexShrink: 0, marginTop: "0.05rem",
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: `rgba(45,106,79,0.15)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{r.icon}</span>
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
                fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
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
                          fontFamily: "Calibri, sans-serif", fontSize: "0.9rem",
                          fontWeight: 700, color: C.white,
                        }}>{p.label}</div>
                        <div style={{
                          fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
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
                  fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
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
                        fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
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
                  fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
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
                        color: C.green, fontSize: "0.95rem", marginTop: "0.05rem", flexShrink: 0,
                      }}>✓</span>
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
                  fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
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
                      animation: `fadeSlideIn 0.4s ease 0.4s both`,
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
                    animation: `fadeSlideIn 0.4s ease 0.3s both`,
                  }}>
                    <div style={{
                      fontFamily: "Calibri, sans-serif", fontSize: "0.7rem",
                      letterSpacing: "2px", textTransform: "uppercase",
                      color: C.midGray, fontWeight: 700, marginBottom: "0.4rem",
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
                  fontFamily: "Calibri, sans-serif", fontSize: "0.65rem",
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
                      animation: `fadeSlideIn 0.4s ease ${0.4 + i * 0.08}s both`,
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
              const c = configOpen ? calc : activeCalc;
              const cfg = configOpen ? config : savedConfig;
              const items = getPhaseCalcItems(active, c, cfg);
              if (!items) return null;
              return (
                <div style={{
                  marginTop: "0.75rem",
                  background: `linear-gradient(135deg, ${C.gold}08, ${C.green}05)`,
                  border: `1px solid ${C.gold}30`,
                  borderRadius: "10px", padding: "0.7rem 0.85rem",
                  animation: "fadeSlideIn 0.4s ease 0.5s both",
                }}>
                  <div style={{
                    fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
                    letterSpacing: "2.5px", textTransform: "uppercase",
                    color: C.gold, fontWeight: 700, marginBottom: "0.45rem",
                    display: "flex", alignItems: "center", gap: "0.35rem",
                  }}>
                    <span style={{ fontSize: "0.7rem" }}>⚙</span>
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
                          fontFamily: "Calibri, sans-serif", fontSize: "0.6rem",
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
        fontFamily: "Calibri, sans-serif", fontSize: "0.75rem", color: C.midGray,
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
        @media (max-width: 800px) {
          header, footer, .content { padding-left: 1rem !important; padding-right: 1rem !important; }
        }
      `}</style>

      {/* ── Interactive Config Panel ── */}
      {configOpen && (
        <ConfigPanel
          config={config}
          setConfig={setConfig}
          calc={calc}
          onClose={() => setConfigOpen(false)}
          onSave={() => { setSavedConfig({ ...config }); setConfigOpen(false); }}
        />
      )}

      {/* ── PDF Export Modal ── */}
      {exportOpen && (
        <ExportModal
          phases={phases}
          config={configSaved ? savedConfig : config}
          calc={configSaved ? activeCalc : calc}
          configActive={showCalc}
          onClose={() => setExportOpen(false)}
        />
      )}

      {/* ── Market Analysis Overlay ── */}
      {marketOpen && (
        <MarketAnalysis
          config={configSaved ? savedConfig : config}
          configActive={showCalc}
          onClose={() => setMarketOpen(false)}
        />
      )}
    </div>
  );
}
