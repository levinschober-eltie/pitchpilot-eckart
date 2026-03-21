/**
 * Site Configuration — Standard-Template für PitchPilot Präsentationen.
 *
 * Alle kundenspezifischen Daten zentral definiert.
 * Für neue Kunden: Kopie erstellen, Werte anpassen.
 * Die SVG-Simulationen, Timeline, Intro und Berechnungen lesen aus dieser Datei.
 */

/* ── Firmen-Identität ── */
export const company = {
  name: "Eckart Werke",
  legal: "ECKART GmbH",
  signage: "ECKART",           // Schriftzug auf Hauptgebäude (max ~8 Zeichen)
  industry: "Aluminiumverarbeitung",
  employees: "800+",
  address: "Güntersthal 4, 91235 Hartenstein",
  location: "Hartenstein",
  region: "Oberfranken",
  date: "März 2026",
  confidential: true,
  consultant: {
    company: "Elite PV GmbH",
    name: "Levin Schober",
    email: "levinschober@elite-pv.de",
    label: "Energiewirtschaftliche Konzeptbegleitung",
  },
};

/* ── Standort-Koordinaten ── */
export const coordinates = {
  name: "Hartenstein",
  lat: 49.63,
  lon: 11.52,
  tz: 1,                       // CET offset
};

/* ── Standort-Kennzahlen ── */
export const site = {
  area: "50 Hektar",
  gridConnection: "110 kV",
  existingPV: 2.0,             // MWp Bestand (Freifläche)
  existingPVLabel: "Freifläche (Bestand)",
  buildingClusters: "A–E",
  buildingCount: "Dutzende Hallen",
};

/* ── Gebäude-Beschriftung (SVG-Illustrationen) ── */
export const buildings = {
  mainSign: "PRODUKTION",      // Hauptgebäude-Schild
  halls: [
    { sign: "HALLE A", chimney: true, flag: true },
    { sign: "PRODUKTION", vent: true, antenna: true },  // + Firmenschild
    { sign: "LAGER" },
    { sign: "MÜHLE", chimney: true },
    { sign: "BÜRO" },
    { sign: "TROCKNER", vent: true },
    { sign: "VERWALTUNG" },
  ],
  // Abwärme-Quellen (Phase IV Labels)
  heatSources: ["Mühlen", "Trockner", "Kompress."],
};

/* ── Standard-Konfiguration für Berechnungsengine ── */
export const defaultCalcConfig = {
  stromverbrauch: 20000,       // MWh/a
  gasverbrauch: 10000,         // MWh/a
  strompreis: 22,              // ct/kWh
  gaspreis: 7,                 // ct/kWh
  pvDach: 3.5,                 // MWp
  pvFassade: 0.7,              // MWp
  pvCarport: 2.0,              // MWp
  pvBestand: 2.0,              // MWp (fixed)
  standortBESS: 8,             // MWh
  graustromBESS: 200,          // MWh
  wpLeistung: 7.5,             // MW
  pufferspeicher: 350,         // m³
  anzahlPKW: 60,
  anzahlLKW: 6,
  kmPKW: 15000,                // km/a
  kmLKW: 60000,                // km/a
  dieselpreis: 1.55,           // €/l
  lastgangFile: null,
  lastgangData: null,
  stromrechnungFile: null,
  ekAnteil: 30,                // % Eigenkapital
  kreditZins: 4.5,             // % p.a.
  kreditLaufzeit: 15,          // Jahre
  tilgungsfrei: 2,             // Jahre tilgungsfrei
};

/* ── Phasen-spezifische KPI-Werte (für SVG Info-Panels) ── */
export const phaseKPIs = {
  analyse: {
    panelTitle: "STANDORT-PROFIL",
    items: [
      ["50 ha", "Gelände"],
      ["800+", "Mitarbeiter"],
      ["110 kV", "Netzanschluss"],
      ["12 Mon.", "Lastprofil"],
      ["5 Cluster", "Dachgutachten"],
    ],
    checklist: ["Dachstatik", "Leitungen", "Lastprofil", "Netzanschl.", "Thermogr."],
  },
  pv: {
    panelTitle: "NEUE PV-ANLAGEN",
    arrays: [
      { icon: "sun", label: "Dach-PV", power: "2,5–5,0 MWp", detail: "Cluster A–E" },
      { icon: "building", label: "Fassade", power: "0,5–1,0 MWp", detail: "Süd + West" },
      { icon: "parking", label: "Carports", power: "1,5–3,0 MWp", detail: "Parkplätze" },
    ],
    totalLabel: "ERZEUGUNG GESAMT",
    totalPower: "6,5–11 MWp",
    totalYield: "5.800–9.800 MWh/a",
  },
  speicher: {
    panelTitle: "INTELLIGENTES EMS",
    capacity: "6,5–11 MWh · 0,5C · 3,25–5,5 MW",
    strategies: [
      { num: "1", title: "Eigenverbrauch", sub: "PV → Produktion max." },
      { num: "2", title: "Peak Shaving", sub: "Lastspitzen kappen" },
      { num: "3", title: "Spotmarkt-Handel", sub: "Günstig laden, teuer verkaufen" },
    ],
    savingsLabel: "10–15 % Einsparung/a",
  },
  waerme: {
    panelTitle: "WÄRMESYSTEM",
    items: [
      ["5–10 MW", "WP-Kaskade"],
      ["COP 4–5", "Abwärme-Quelle"],
      ["65–80 %", "Gasreduktion"],
      ["Standortweit", "Wärmenetz"],
    ],
    co2Savings: "–2.400 t",
    bufferSize: "500 m³",
    bufferTemp: "65°C",
  },
  lade: {
    acCount: "60+",
    acLabel: "Wallboxen",
    dcRange: "150–400 kW",
    dcLabel: "CCS Depot-Laden",
  },
  bess: {
    power: "100 MW",
    capacity: "200 MWh",
    rendite: "15–25 % p.a.",
    revenueRange: "+€ 5,2M – 8,7M p.a.",
    streams: [
      { title: "Arbitrage", sub: "2–5 ct → Peak-Spread" },
      { title: "FCR / aFRR", sub: "< 1s Regelenergie" },
      { title: "Inertia", sub: "Grid-Forming ab 01/2026" },
      { title: "Redispatch", sub: "Netzstabilität §13.2" },
    ],
  },
  gesamt: {
    co2Total: "–3.800 t",
    systemKPIs: [
      { icon: "sun", text: "6,5–11 MWp" },
      { icon: "battery", text: "6,5–11 MWh" },
      { icon: "fire", text: "5–10 MW WP" },
      { icon: "plug", text: "70+ Lader" },
      { icon: "chartUp", text: "1,4–2,5 Mio €/a" },
    ],
    bessLabel: "100 MW / 200 MWh",
    bessRevenueLabel: "+8,7M p.a.",
  },
};

/* ── Projekt-Titel (PDF Cover, HTML Title) ── */
export const project = {
  title: "Energietransformation\nPhasenkonzept",
  tagline: "Integriertes Energiesystem",
};

/* ── Wirtschaftliche Annahmen (Region/Markt-spezifisch) ── */
export const economicModel = {
  specificYield: 950,       // kWh/kWp (Oberfranken); 1100 für Süd-DE, 800 für Nord-DE
  feedInTariffCt: 7,        // ct/kWh Einspeisevergütung
  bessRevenuePerMWh: 42500, // €/MWh/a (kalibriert: 200 MWh → 8,5M)
  co2GridMix: 0.382,        // t/MWh (dt. Strommix 382 g/kWh)
  co2Gas: 0.201,            // t/MWh (Erdgas 201 g/kWh)
  dieselCo2Factor: 2.65,    // kg CO₂/l Diesel
  co2Price: 60,             // €/t CO₂-Preis
};

/* ── Investitions-Koeffizienten (€-Beträge pro Einheit) ── */
export const investmentCosts = {
  phase1Fixed: 65000,           // € Analyse & Gutachten
  pvPerKWp: 650000,             // €/MWp Dach + Fassade
  carportPerKWp: 1200000,       // €/MWp Carport-PV
  bessPerMWh: 187000,           // €/MWh Standort-BESS
  bessFixed: 185000,            // € EMS-Integration
  wpPerMW: 400000,              // €/MW Wärmepumpe
  wpFixed: 1000000,             // € Pufferspeicher-Basis
  pufferPerM3: 600,             // €/m³ Pufferspeicher
  waermenetzFixed: 800000,      // € Wärmenetz + Dämmung
  wallboxPerStk: 2500,          // €/Stk AC-Wallbox
  dcChargerPerStk: 75000,       // €/Stk DC-Schnelllader
  hpcPerStk: 200000,            // €/Stk HPC-Lader
  ladeFixed: 350000,            // € Lastmanagement
  ladeMisc: 40000,              // € Netzanschluss-Erweiterung
  graustromPerMWh: 175000,      // €/MWh Graustrom-BESS
  graustromGridFixed: 6500000,  // € Netzanschluss + Trafo
  maintenanceStandort: 0.015,   // 1,5 % p.a.
  maintenancePhase6: 0.008,     // 0,8 % p.a.
};

/* ── Projektions-Faktoren (20-Jahres-Cashflow) ── */
export const projectionFactors = {
  pvDegradation: 0.995,         // 0,5 %/a Leistungsabnahme
  priceInflation: 1.02,         // 2 %/a Strom-/Dienstleistungsinflation
  gasInflation: 1.025,          // 2,5 %/a Gaspreis-Inflation
  bessGrowth: 1.01,             // 1 %/a BESS-Erlöswachstum
};

/* ── Intro-Screen Texte ── */
export const intro = {
  subtitle: "Phasenkonzept zur ganzheitlichen Energietransformation",
  description: `Aufbauend auf den bereits realisierten 2 MWp Freiflächen-PV zeigt dieses interaktive Dokument die strategische Roadmap zur vollständigen Energietransformation Ihres Standorts in Hartenstein – in sechs aufeinander aufbauenden Phasen von Strom über Wärme und Mobilität bis zum eigenständigen Ertragsmodell.`,
  cta: "Konzept entdecken",
  footerRight: company.consultant.label,
  phasePills: [
    { num: "I", label: "Analyse" },
    { num: "II", label: "PV & Hülle" },
    { num: "III", label: "Speicher" },
    { num: "IV", label: "Wärme" },
    { num: "V", label: "Laden" },
    { num: "VI", label: "BESS" },
  ],
};

/* ── Phasen-Daten (Timeline) ── */
export const phases = [
  {
    num: "I",
    title: "Analyse & Bewertung",
    subtitle: "Das Fundament",
    months: "Monat 1–3",
    colorKey: "gold",
    headline: "Ohne belastbare Daten keine belastbaren Entscheidungen",
    description: "Energieintensive Aluminiumverarbeitung, 800+ Mitarbeiter und bereits Freiflächen-PV in Betrieb. Die Analyse bewertet das Gesamtpotenzial: Gebäude, Prozesswärme, Lastprofile und den Hochspannungs-Netzanschluss. Erfüllt gleichzeitig die Pflicht zum Energieaudit nach DIN EN 16247 (EDL-G).",
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
      { label: "KfW 295 Modul 4 (Energieeffizienz)", value: "bis 15 % Tilgungszuschuss" },
      { label: "Industriestrompreis 2026", value: "50 % Reinvestitionspflicht → Dekarbonisierung" },
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
    colorKey: "green",
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
    colorKey: "green",
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
      { icon: "chart", title: "Peak Shaving", text: "Automatische Kappung aller Lastspitzen — messbare Leistungspreis-Reduktion ab Tag 1" },
      { icon: "bolt", title: "Spotmarkt-Handel", text: "EPEX-optimierte Lade-/Entladezyklen — zusätzliche Erlöse aus Preisvolatilität" },
      { icon: "search", title: "EMS Echtzeit", text: "Standortweites Energiemanagement mit Prognose-Algorithmus — alle Flüsse in einer Hand" },
    ],
  },
  {
    num: "IV",
    title: "Wärmekonzept",
    subtitle: "Die vergessene Dimension",
    months: "Monat 12–24",
    colorKey: "warmOrange",
    headline: "Wer Wärme beherrscht, beherrscht die Betriebskosten",
    description: "Die Aluminiumpigment-Produktion benötigt Prozesswärme an Dutzenden Stellen: Kugelmühlen, Atomisierung, Trocknungsanlagen — verteilt über Dutzende Hallen. Eine WP-Kaskade nutzt die erhebliche Abwärme als Quelle und senkt den Gasbezug um 65–80 %.",
    results: [
      "Großwärmepumpen-Kaskade in Betrieb",
      "Abwärmerückgewinnung an allen identifizierten Quellen",
      "Pufferspeicher für Lastausgleich installiert",
      "Wärmenetz verbindet alle Verbraucher",
      "Gasreduktion 65–80 % erreicht",
    ],
    kpis: [
      { label: "WP-Kaskade", value: "5–10 MW" },
      { label: "COP", value: "4–5 (Abwärme)" },
      { label: "Gasreduktion", value: "65–80 %" },
      { label: "CO₂-Reduktion", value: "~2.400 t/a" },
    ],
    investment: [
      { label: "WP-Kaskade (400 T€/MW)", range: "2,0–4,0 Mio €" },
      { label: "Pufferspeicher + Verteilung", range: "1,5–2,5 Mio €" },
      { label: "Wärmenetz + Dämmung", range: "800 T€–1,5 Mio €" },
    ],
    funding: [
      { label: "BEG NWG (Heizungstausch Gewerbe)", value: "30 % + 20 % Tauschbonus" },
      { label: "KfW 295 Modul 2 (Prozesswärme EE)", value: "bis 40 % Tilgungszuschuss" },
    ],
    investTotal: "4,3–8,0 Mio €",
    roi: "Gaskosten-Reduktion + CO₂-Vermeidung",
    roiValue: "65–80 % weniger Gas",
    independenceScore: 80,
    independenceLabel: "Thermische Unabhängigkeit",
    icon: "fire",
    highlights: [
      { icon: "fire", title: "WP-Kaskade", text: "Mehrstufige Großwärmepumpen nutzen Abwärme als Quelle — COP 4–5 ganzjährig" },
      { icon: "thermometer", title: "Abwärme-Rückgewinnung", text: "Mühlen, Öfen, Trockner — jede Abwärmequelle wird zur Energiequelle" },
      { icon: "battery", title: "Pufferspeicher", text: "Thermischer Speicher entkoppelt Erzeugung und Verbrauch — Lastspitzen ausgeglichen" },
      { icon: "bolt", title: "Standortweites Wärmenetz", text: "Alle Verbraucher über ein Netz verbunden — keine Wärmeinsel mehr" },
    ],
  },
  {
    num: "V",
    title: "Ladeinfrastruktur",
    subtitle: "Die Elektrifizierung der Mobilität",
    months: "Monat 18–30",
    colorKey: "greenLight",
    headline: "Jeder Stellplatz wird zur Tankstelle",
    description: "800 Mitarbeiter, Fuhrpark, LKW-Logistik — die Elektrifizierung der betrieblichen Mobilität schließt den Kreis. 60+ AC-Wallboxen für PKW, 4–6 DC-Schnelllader für den Fuhrpark und 4–6 HPC-Lader für die LKW-Flotte.",
    results: [
      "AC-Wallboxen an allen Mitarbeiter-Stellplätzen",
      "DC-Schnelllader für den Fuhrpark installiert",
      "HPC-Ladepark für LKW-Flotte in Betrieb",
      "Lastmanagement integriert (PV-geführtes Laden)",
      "GEIG-konforme Ausstattung",
      "V2G-Ready für zukünftige bidirektionale Nutzung",
    ],
    kpis: [
      { label: "AC-Wallboxen", value: "60+ × 22 kW" },
      { label: "DC Fuhrpark", value: "4–6 × 150 kW" },
      { label: "HPC LKW", value: "4–6 × 400 kW" },
      { label: "Lastmanagement", value: "PV-geführt" },
    ],
    investment: [
      { label: "AC-Wallboxen (2.500 €/Stk)", range: "150–200 T€" },
      { label: "DC-Schnelllader", range: "300–450 T€" },
      { label: "HPC LKW-Depot", range: "800 T€–1,2 Mio €" },
      { label: "Lastmanagement + Netzanschluss", range: "350–500 T€" },
    ],
    funding: [
      { label: "THG-Quotenhandel + Landesförderung", value: "Erstattung pro Ladepunkt" },
      { label: "GEIG-Pflicht ab 2026", value: "Regulatorische Compliance" },
    ],
    investTotal: "1,6–2,4 Mio €",
    roi: "Diesel-Einsparung + Compliance",
    roiValue: "Komplette Fuhrpark-Elektrifizierung",
    independenceScore: 88,
    independenceLabel: "Mobilität elektrifiziert",
    icon: "plug",
    highlights: [
      { icon: "plug", title: "AC-Ladepark", text: "22-kW-Wallboxen an allen Stellplätzen — Mitarbeiter laden während der Arbeitszeit" },
      { icon: "bolt", title: "DC-Fleet-Charger", text: "150-kW-Schnelllader für den Fuhrpark — Poolfahrzeuge in 30 Min auf 80 %" },
      { icon: "factory", title: "HPC-Depot", text: "Bis zu 400 kW pro LKW — Nachtladung für den gesamten Logistik-Betrieb" },
      { icon: "chart", title: "PV-geführtes Laden", text: "EMS priorisiert Eigenverbrauch — Laden wenn die Sonne scheint" },
    ],
  },
  {
    num: "VI",
    title: "Graustrom-BESS",
    subtitle: "Vom Verbraucher zum Energiehändler",
    months: "Monat 24–36",
    colorKey: "greenLight",
    headline: "Der Standort wird zum eigenständigen Ertragsmodell",
    description: "Ein 100 MW / 200 MWh Großspeicher nutzt den bestehenden 110-kV-Netzanschluss. Vier Erlösströme: Arbitrage (EPEX-Spread), FCR/aFRR (Regelenergie), Redispatch (Netzstabilität) und ab 2026 Trägheitsmarkt (Inertia Services) — zusammen 15–25 % Rendite p.a. Die MiSpeL-Verordnung (ab 02/2026) ermöglicht erstmals Mischbetrieb: Netz- und PV-Strom im selben Speicher bei Erhalt der EEG-Vergütung.",
    results: [
      "Graustrom-BESS (100 MW / 200 MWh) in Betrieb",
      "Vier Erlösströme aktiv: Arbitrage + FCR + Redispatch + Inertia",
      "24/7 SCADA-Monitoring und Fernsteuerung",
      "Brandschutzkonzept und Genehmigung abgeschlossen",
      "Netzanschluss erweitert und bidirektional",
    ],
    kpis: [
      { label: "Leistung", value: "100 MW" },
      { label: "Kapazität", value: "200 MWh" },
      { label: "Spread", value: "5–15 ct/kWh" },
      { label: "Rendite", value: "15–25 % p.a." },
    ],
    investment: [
      { label: "BESS-Container 200 MWh (175 T€/MWh)", range: "35–42 Mio €" },
      { label: "Netzanschluss + Trafo", range: "3,5–6,0 Mio €" },
    ],
    funding: [
      { label: "Projektfinanzierung (Non-Recourse SPV)", value: "Cashflow-besichert" },
      { label: "EU Innovation Fund", value: "Co-Finanzierung" },
    ],
    investTotal: "38–48 Mio €",
    roi: "Arbitrage + Regelenergie + Redispatch",
    roiValue: "15–25 % p.a.",
    independenceScore: 95,
    independenceLabel: "Strategisch unangreifbar",
    icon: "bolt",
    highlights: [
      { icon: "battery", title: "100 MW Großspeicher", text: "Einer der größten BESS-Projekte in Deutschland — Skaleneffekte senken €/kWh" },
      { icon: "chart", title: "Drei Erlösströme", text: "Arbitrage, FCR und Redispatch — diversifizierte Einnahmen reduzieren das Marktrisiko" },
      { icon: "bolt", title: "110-kV-Netzanschluss", text: "Bestehende Infrastruktur nutzen — kein teurer Netzausbau nötig" },
      { icon: "factory", title: "SCADA 24/7", text: "Vollautomatisches Monitoring mit Remote-Steuerung — minimale Betriebskosten" },
    ],
  },
  /* ── Phase 7: Gesamtzusammenfassung (Index 6) ── */
  {
    num: "∑",
    title: "Gesamtergebnis",
    subtitle: "Strategischer Standortvorteil",
    months: "36 Monate Gesamtlaufzeit",
    colorKey: "gold",
    headline: "Vom Energieverbraucher zur Energieplattform",
    description: "Sechs Phasen, ein integriertes System: Der Standort Hartenstein wird vom reinen Energieverbraucher zum steuerbaren Energieknotenpunkt mit eigenem Ertragsmodell. Erzeugung, Speicherung, Wärme, Mobilität und Großhandel greifen nahtlos ineinander.",
    icon: "trophy",
    isFinal: true,
    independenceScore: 95,
    independenceLabel: "Strategischer Standortvorteil",
    investTotal: "43–70 Mio €",
    results: [
      "Integriertes Energiesystem über alle 6 Phasen realisiert",
      "Energieautarkie von 50–65 % am Standort erreicht",
      "Jährliche Einsparungen und Erlöse von 1,4–2,5 Mio € (Standort) + 5,2–8,7 Mio € (BESS)",
      "CO₂-Reduktion von ~3.800–5.000 t/a — Klimaneutralität in Reichweite",
      "Amortisation des Standort-Invests in 6–9 Jahren",
      "Graustrom-BESS als eigenständiges Ertragsmodell mit 15–25 % Rendite p.a.",
    ],
    kpis: [
      { label: "Autarkie", value: "50–65 %" },
      { label: "CO₂-Reduktion", value: "~3.800–5.000 t/a" },
      { label: "Gesamtinvest", value: "43–70 Mio €" },
    ],
    investment: [
      { label: "Standort-Invest (Phasen I–V)", range: "8,5–22 Mio €" },
      { label: "Graustrom-BESS (Phase VI)", range: "35–48 Mio €" },
    ],
    funding: [
      { label: "KfW + Landesförderung + BEG", value: "Kombinierte Förderstruktur" },
      { label: "Projektfinanzierung (SPV)", value: "Non-Recourse für BESS" },
    ],
    roi: "Standort-Amortisation + eigenständiges BESS-Ertragsmodell",
    roiValue: "50–65 % Autarkie + 8,7M €/a BESS",

    /* ── Gesamtzusammenfassung-spezifische Daten ── */

    systemKpis: [
      { label: "GESAMTE PV-LEISTUNG", value: "6,5–11 MWp", sub: "Dach + Fassade + Carport + Bestand" },
      { label: "STANDORT-SPEICHER", value: "6,5–11 MWh", sub: "Peak Shaving + Eigenverbrauch" },
      { label: "WÄRMEPUMPEN-KASKADE", value: "5–10 MW", sub: "COP 4–5 · Abwärme-basiert" },
      { label: "LADEINFRASTRUKTUR", value: "70+ Ladepunkte", sub: "AC + DC + HPC" },
      { label: "GRAUSTROM-BESS", value: "100 MW / 200 MWh", sub: "Arbitrage + FCR + Redispatch" },
      { label: "CO₂-EINSPARUNG", value: "~3.800–5.000 t/a", sub: "Strom + Wärme + Mobilität" },
    ],

    investmentSummary: [
      { phase: "I",   label: "Analyse & Bewertung",   range: "50–80 T€",        roi: "Entscheidungsgrundlage",          score: 15, maxMio: 0.08 },
      { phase: "II",  label: "Gebäudehülle & PV",     range: "3,1–8,8 Mio €",   roi: ">60 % Eigenverbrauch",            score: 45, maxMio: 8.8  },
      { phase: "III", label: "Speicher & Steuerung",   range: "1,1–2,7 Mio €",   roi: "10–15 % Peak Shaving",            score: 65, maxMio: 2.7  },
      { phase: "IV",  label: "Wärmekonzept",           range: "4,3–8,0 Mio €",   roi: "65–80 % weniger Gas",             score: 80, maxMio: 8.0  },
      { phase: "V",   label: "Ladeinfrastruktur",      range: "1,6–2,4 Mio €",   roi: "Fuhrpark-Elektrifizierung",       score: 88, maxMio: 2.4  },
      { phase: "VI",  label: "Graustrom-BESS",         range: "35–48 Mio €",     roi: "15–25 % Rendite p.a.",            score: 95, maxMio: 48   },
    ],

    economicSummary: {
      savings: [
        { label: "PV-Eigenverbrauch (Stromkosten-Reduktion)", value: "800 T€–1,5 Mio €/a" },
        { label: "Einspeiseerlöse (EEG 7 ct/kWh)",            value: "200–350 T€/a" },
        { label: "Peak Shaving & Spotmarkt-Optimierung",       value: "100–250 T€/a" },
        { label: "Gaskosten-Reduktion (WP-Kaskade)",           value: "300–500 T€/a" },
        { label: "Mobilitäts-Einsparung (PKW + LKW)",          value: "80–150 T€/a" },
      ],
      totals: {
        annualSavings:   "1,4–2,5 Mio €/a",
        investStandort:  "8,5–22 Mio €",
        paybackStandort: "~6–9 Jahre",
        bessRevenue:     "5,2–8,7 Mio €/a",
      },
      conclusion: "Das integrierte Energiesystem erreicht eine Standort-Amortisation von 6–9 Jahren bei jährlichen Einsparungen von 1,4–2,5 Mio €. Hinzu kommen 5,2–8,7 Mio €/a aus dem Graustrom-BESS — ein eigenständiges Ertragsmodell mit 15–25 % Rendite, finanzierbar als separates SPV. Zusammen entsteht eine Energieplattform, die Eckart langfristig strategisch unangreifbar macht.",
    },

    levers: [
      { icon: "sun",     title: "PV-Eigenverbrauch",       desc: "6,5–11 MWp Erzeugung senken den Strombezug um bis zu 50 % — direkte Kostenreduktion ab Tag 1" },
      { icon: "battery", title: "Speicher & Peak Shaving",  desc: "Standort-BESS kappt Lastspitzen und optimiert den Eigenverbrauch — 10–15 % Leistungspreis-Senkung" },
      { icon: "fire",    title: "Wärme-Elektrifizierung",   desc: "WP-Kaskade mit COP 4–5 ersetzt 65–80 % des Gasbezugs — größter CO₂-Hebel am Standort" },
      { icon: "plug",    title: "E-Mobilität",              desc: "70+ Ladepunkte elektrifizieren Fuhrpark und Mitarbeiter-PKW — Dieselkosten entfallen vollständig" },
      { icon: "bolt",    title: "BESS-Arbitrage",           desc: "100 MW / 200 MWh am 110-kV-Anschluss — vier Erlösströme inkl. Trägheitsmarkt 2026, 15–25 % Rendite p.a." },
      { icon: "chart",   title: "EMS-Integration",          desc: "Standortweites Energiemanagement steuert alle Flüsse in Echtzeit — maximale Systemeffizienz" },
    ],

    regulatorik: [
      { icon: "leaf",     title: "CSRD / ESG-Reporting",     desc: "Omnibus I (März 2026): Schwellen auf 1.000 MA / 450 Mio € erhöht — ALTANA-Konzern weiterhin berichtspflichtig, Scope 1+2 Reduktion dokumentiert", status: "Adressiert" },
      { icon: "globe",    title: "EU-Taxonomie",             desc: "Alle Investitionen taxonomie-konform — Zugang zu Green Finance gesichert",             status: "Konform" },
      { icon: "document", title: "GEIG-Pflicht 2026",        desc: "Ladeinfrastruktur-Pflicht für Nicht-Wohngebäude vollständig erfüllt",                 status: "Erfüllt" },
      { icon: "bolt",     title: "§14a EnWG (Steuerbare Verbraucher)", desc: "Wärmepumpen und Ladeinfrastruktur netzdienlich steuerbar",                  status: "Ready" },
      { icon: "factory",  title: "ALTANA Konzernstandards",  desc: "Klimaneutralitätsziel des Konzerns am Standort Hartenstein adressiert",                status: "Aligned" },
      { icon: "bank",     title: "CO₂-Bepreisung (BEHG)",    desc: "Steigende CO₂-Kosten durch Elektrifizierung weitgehend eliminiert",                   status: "Abgesichert" },
    ],

    riskManagement: [
      { icon: "chartDown", title: "Strompreis-Volatilität",   desc: "Industriestrompreis 2026–2028 (5 ct/kWh für 50 % des Verbrauchs) senkt kurzfristig Bezugskosten — PV-Eigenverbrauch bleibt langfristig günstiger und unabhängig von Subventionen", impact: "Niedrig" },
      { icon: "battery",   title: "BESS-Marktrisiko",         desc: "Vier diversifizierte Erlösströme (Arbitrage, FCR, Redispatch, Inertia) — kein Single-Point-of-Failure", impact: "Mittel" },
      { icon: "gear",      title: "Technologie-Risiko",       desc: "Ausschließlich marktreife Komponenten (LFP-Batterien, monokristalline PV, Industrie-WP)",          impact: "Niedrig" },
      { icon: "document",  title: "Regulatorisches Risiko",   desc: "EEG, BEHG, GEIG — alle aktuellen Anforderungen erfüllt, EU-Taxonomie-konform",                    impact: "Niedrig" },
      { icon: "bolt",      title: "Netzanschluss-Risiko",     desc: "Bestehender 110-kV-Anschluss — kein Netzausbau nötig, Vorabstimmung mit Netzbetreiber empfohlen",  impact: "Mittel" },
    ],

    pillars: [
      { icon: "sun",     label: "Dezentrale Erzeugung",     phase: "II" },
      { icon: "battery", label: "Intelligente Speicherung",  phase: "III" },
      { icon: "fire",    label: "Wärme-Elektrifizierung",    phase: "IV" },
      { icon: "plug",    label: "Elektromobilität",           phase: "V" },
      { icon: "bolt",    label: "Energiehandel",              phase: "VI" },
      { icon: "chart",   label: "System-Steuerung",           phase: "I–VI" },
    ],

    heroCards: [
      {
        icon: "leaf", accentKey: "green",
        label: "CO₂-EINSPARUNG PRO JAHR",
        value: "~3.800 t",
        sub: "CO₂/Jahr weniger · ~230.000 €/a vermiedene CO₂-Kosten",
        details: [
          { label: "Strom (PV statt Netz)", value: "–1.600 t" },
          { label: "Wärme (WP statt Gas)", value: "–1.700 t" },
          { label: "Mobilität (E statt Diesel)", value: "–470 t" },
          { label: "CO₂-Preis (~60 €/t)", value: "230.000 €/a" },
        ],
      },
      {
        icon: "money", accentKey: "gold",
        label: "JÄHRLICHER GESAMTERTRAG",
        value: "6,6–11,2 Mio €",
        sub: "Einsparung + Erlöse pro Jahr",
        details: [
          { label: "Standort-Einsparungen (I–V)", value: "1,4–2,5 Mio €/a" },
          { label: "Graustrom-BESS Erlöse (VI)", value: "5,2–8,7 Mio €/a" },
        ],
      },
    ],

    highlights: [
      { icon: "trophy",  title: "50–65 % Energieautarkie",   text: "Erhebliche Unabhängigkeit vom Energiemarkt — strategischer Standortvorteil" },
      { icon: "money",   title: "6–9 Jahre Amortisation",   text: "Standort-Invest amortisiert sich schnell — BESS liefert zusätzlichen Cashflow ab Jahr 1" },
      { icon: "leaf",    title: "~3.800 t CO₂ weniger",     text: "Massive Reduktion über Strom, Wärme und Mobilität — Klimaneutralität in Reichweite" },
      { icon: "bolt",    title: "Eigenständiges Ertragsmodell", text: "100 MW BESS macht den Standort zum Energiehändler — 5,2–8,7 Mio €/a Zusatzerlöse" },
    ],
  },
];
