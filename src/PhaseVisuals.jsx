/**
 * PhaseVisuals — Stylized isometric SVG illustrations per phase.
 * Based on the real Eckart Werke aerial layout (Hartenstein valley site).
 */

const C = {
  navy: "#1B2A4A",
  navyLight: "#253757",
  gold: "#D4A843",
  goldLight: "#E8C97A",
  green: "#2D6A4F",
  greenLight: "#3A8A66",
  forest: "#1A4D2E",
  forestLight: "#2B7A4B",
  warmWhite: "#F5F5F0",
  midGray: "#9A9A90",
};

/* ── Shared site base: simplified aerial view ─────────── */
function SiteBase({ children, dim = false }) {
  return (
    <g opacity={dim ? 0.35 : 1}>
      {/* Terrain / hills */}
      <ellipse cx="200" cy="250" rx="210" ry="90" fill={C.forest} opacity="0.3" />
      <ellipse cx="200" cy="240" rx="190" ry="75" fill={C.forest} opacity="0.4" />

      {/* Forest ring */}
      <path d="M40,180 Q80,100 160,90 Q200,85 240,95 Q320,110 360,180 Q370,220 340,240 Q280,270 200,270 Q120,270 60,240 Q30,220 40,180Z"
        fill={C.forest} opacity="0.5" />

      {/* Inner cleared area */}
      <path d="M80,175 Q110,130 170,120 Q200,115 230,125 Q290,140 320,175 Q330,205 310,225 Q270,245 200,248 Q130,245 90,225 Q70,205 80,175Z"
        fill={C.navyLight} opacity="0.3" />

      {/* Access road */}
      <path d="M50,260 Q80,230 120,210 Q160,195 200,195 Q250,195 290,210 Q330,230 360,255"
        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeLinecap="round" />
      <path d="M200,195 Q200,170 210,150"
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" strokeLinecap="round" />

      {/* Main building cluster */}
      {/* Large production halls */}
      <rect x="145" y="140" width="50" height="25" rx="2" fill={C.navyLight} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <rect x="200" y="135" width="55" height="30" rx="2" fill={C.navyLight} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <rect x="155" y="168" width="45" height="22" rx="2" fill={C.navyLight} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <rect x="205" y="168" width="50" height="22" rx="2" fill={C.navyLight} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

      {/* Smaller buildings */}
      <rect x="125" y="155" width="25" height="18" rx="1" fill={C.navyLight} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <rect x="260" y="145" width="30" height="20" rx="1" fill={C.navyLight} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <rect x="260" y="170" width="28" height="18" rx="1" fill={C.navyLight} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <rect x="170" y="193" width="35" height="16" rx="1" fill={C.navyLight} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <rect x="210" y="193" width="40" height="16" rx="1" fill={C.navyLight} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

      {/* Admin building */}
      <rect x="140" y="120" width="30" height="18" rx="1" fill={C.navyLight} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

      {/* Parking areas */}
      <rect x="115" y="200" width="40" height="20" rx="1" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <rect x="270" y="195" width="35" height="22" rx="1" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

      {children}
    </g>
  );
}

/* ── Phase I: Analyse — Grid overlay, measurement points, drone ── */
function AnalyseVisual() {
  return (
    <>
      <SiteBase>
        {/* Measurement grid overlay */}
        <g opacity="0.4">
          {[120, 160, 200, 240, 280].map((x) => (
            <line key={`v${x}`} x1={x} y1="110" x2={x} y2="230" stroke={C.gold} strokeWidth="0.5" strokeDasharray="3,3" />
          ))}
          {[130, 155, 180, 205, 230].map((y) => (
            <line key={`h${y}`} x1="110" y1={y} x2="300" y2={y} stroke={C.gold} strokeWidth="0.5" strokeDasharray="3,3" />
          ))}
        </g>

        {/* Measurement data points */}
        {[
          [150, 145], [220, 150], [175, 175], [240, 180], [130, 165],
          [270, 160], [195, 200], [145, 210], [280, 200],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill={C.gold} opacity="0.8">
              <animate attributeName="r" values="2;4;2" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r="7" fill="none" stroke={C.gold} strokeWidth="0.5" opacity="0.3">
              <animate attributeName="r" values="5;10;5" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Drone */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,0; 15,-5; 30,0; 15,5; 0,0" dur="8s" repeatCount="indefinite" />
          <rect x="180" y="115" width="12" height="8" rx="2" fill={C.gold} opacity="0.9" />
          <line x1="176" y1="119" x2="180" y2="119" stroke={C.gold} strokeWidth="1.5" />
          <line x1="192" y1="119" x2="196" y2="119" stroke={C.gold} strokeWidth="1.5" />
          {/* Propellers */}
          <ellipse cx="176" cy="119" rx="5" ry="1.5" fill={C.gold} opacity="0.3">
            <animate attributeName="rx" values="5;3;5" dur="0.15s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="196" cy="119" rx="5" ry="1.5" fill={C.gold} opacity="0.3">
            <animate attributeName="rx" values="3;5;3" dur="0.15s" repeatCount="indefinite" />
          </ellipse>
          {/* Scan beam */}
          <path d="M186,123 L176,145 L196,145 Z" fill={C.gold} opacity="0.08" />
        </g>

        {/* "50 ha" label */}
        <rect x="310" y="120" width="50" height="18" rx="4" fill={C.navy} stroke={C.gold} strokeWidth="0.8" opacity="0.9" />
        <text x="335" y="132" textAnchor="middle" fill={C.goldLight} fontSize="8" fontFamily="Calibri, sans-serif" fontWeight="700">50 ha</text>
      </SiteBase>

      {/* Existing PV field indicator */}
      <g>
        <rect x="50" y="160" width="30" height="20" rx="2" fill={C.gold} opacity="0.25" stroke={C.gold} strokeWidth="0.8" />
        <text x="65" y="173" textAnchor="middle" fill={C.goldLight} fontSize="5" fontFamily="Calibri, sans-serif">2 MWp</text>
        <text x="65" y="155" textAnchor="middle" fill={C.midGray} fontSize="4.5" fontFamily="Calibri, sans-serif">Bestand</text>
      </g>
    </>
  );
}

/* ── Phase II: PV & Gebäudehülle — Solar on roofs, carports ───── */
function PVVisual() {
  return (
    <>
      <SiteBase>
        {/* Solar panels on main halls (gold overlay) */}
        <rect x="146" y="141" width="48" height="23" rx="1" fill={C.gold} opacity="0.55" />
        <rect x="201" y="136" width="53" height="28" rx="1" fill={C.gold} opacity="0.55" />
        <rect x="156" y="169" width="43" height="20" rx="1" fill={C.gold} opacity="0.5" />
        <rect x="206" y="169" width="48" height="20" rx="1" fill={C.gold} opacity="0.5" />
        <rect x="261" y="146" width="28" height="18" rx="1" fill={C.gold} opacity="0.45" />

        {/* Panel line details on largest hall */}
        {[140, 144, 148, 152, 156, 160].map((y) => (
          <line key={y} x1="203" y1={y} x2="252" y2={y} stroke={C.goldLight} strokeWidth="0.4" opacity="0.6" />
        ))}

        {/* Facade PV strips */}
        <rect x="145" y="163" width="1.5" height="23" fill={C.goldLight} opacity="0.5" />
        <rect x="199" y="163" width="1.5" height="28" fill={C.goldLight} opacity="0.5" />
        <rect x="254" y="136" width="1.5" height="28" fill={C.goldLight} opacity="0.5" />

        {/* Carport structures over parking */}
        <g opacity="0.7">
          {/* Left parking carport */}
          <rect x="113" y="199" width="44" height="22" rx="1" fill="none" stroke={C.gold} strokeWidth="1" />
          <rect x="115" y="201" width="40" height="18" rx="1" fill={C.gold} opacity="0.35" />
          {/* Support columns */}
          {[119, 127, 135, 143, 151].map((x) => (
            <line key={x} x1={x} y1="201" x2={x} y2="219" stroke={C.goldLight} strokeWidth="0.3" opacity="0.4" />
          ))}

          {/* Right parking carport */}
          <rect x="268" y="193" width="39" height="24" rx="1" fill="none" stroke={C.gold} strokeWidth="1" />
          <rect x="270" y="195" width="35" height="20" rx="1" fill={C.gold} opacity="0.35" />
        </g>

        {/* Sun rays */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i}
            x1={320 + i * 12} y1={85 - i * 3}
            x2={310 + i * 12} y2={100 - i * 3}
            stroke={C.goldLight} strokeWidth="1.5" opacity="0.25" strokeLinecap="round">
            <animate attributeName="opacity" values="0.15;0.35;0.15" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </line>
        ))}
      </SiteBase>

      {/* MWp label */}
      <rect x="310" y="130" width="65" height="22" rx="5" fill={C.navy} stroke={C.gold} strokeWidth="0.8" />
      <text x="342" y="139" textAnchor="middle" fill={C.goldLight} fontSize="6" fontFamily="Calibri, sans-serif" fontWeight="700">6,5–11 MWp</text>
      <text x="342" y="148" textAnchor="middle" fill={C.midGray} fontSize="5" fontFamily="Calibri, sans-serif">Gesamt-PV</text>

      {/* Existing PV field */}
      <rect x="50" y="160" width="30" height="20" rx="2" fill={C.gold} opacity="0.4" stroke={C.gold} strokeWidth="0.8" />
      <text x="65" y="173" textAnchor="middle" fill={C.goldLight} fontSize="5" fontFamily="Calibri, sans-serif">2 MWp</text>
    </>
  );
}

/* ── Phase III: Speicher & Steuerung — BESS + EMS ──────────────── */
function SpeicherVisual() {
  return (
    <>
      <SiteBase dim>
        {/* PV panels dim */}
        <rect x="146" y="141" width="48" height="23" rx="1" fill={C.gold} opacity="0.2" />
        <rect x="201" y="136" width="53" height="28" rx="1" fill={C.gold} opacity="0.2" />
      </SiteBase>

      {/* BESS container array */}
      <g>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={155 + i * 25} y="215" width="20" height="10" rx="2"
              fill={C.green} opacity="0.6" stroke={C.greenLight} strokeWidth="0.8" />
            <rect x={157 + i * 25} y="217" width="4" height="6" rx="0.5" fill={C.greenLight} opacity="0.4" />
            {/* Status LED */}
            <circle cx={170 + i * 25} cy="220" r="1.5" fill={C.greenLight}>
              <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        <text x="205" y="235" textAnchor="middle" fill={C.greenLight} fontSize="6" fontFamily="Calibri, sans-serif" fontWeight="700">6,5–11 MWh BESS</text>
      </g>

      {/* EMS central hub */}
      <g>
        <rect x="185" y="150" width="30" height="20" rx="4" fill={C.navy} stroke={C.gold} strokeWidth="1" />
        <text x="200" y="162" textAnchor="middle" fill={C.goldLight} fontSize="6" fontFamily="Calibri, sans-serif" fontWeight="700">EMS</text>
        {/* Glow */}
        <rect x="185" y="150" width="30" height="20" rx="4" fill="none" stroke={C.gold} strokeWidth="0.5" opacity="0.3">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* Energy flow lines from buildings to BESS to EMS */}
      {[
        "M170,165 Q170,190 175,215", // Left hall → BESS
        "M225,165 Q225,190 220,215", // Right hall → BESS
        "M200,170 L200,215",          // Center → BESS
        "M155,220 Q140,200 155,180",  // BESS → left
        "M250,220 Q265,200 255,180",  // BESS → right
      ].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={C.greenLight} strokeWidth="1" opacity="0.4" strokeDasharray="4,3">
          <animate attributeName="strokeDashoffset" values="0;-14" dur="2s" repeatCount="indefinite" />
        </path>
      ))}

      {/* Peak shaving indicator */}
      <g>
        <rect x="295" y="150" width="70" height="35" rx="5" fill={C.navy} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        {/* Mini load curve */}
        <polyline points="305,175 315,168 320,172 325,160 335,158 340,165 345,170 350,162 355,175"
          fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        {/* Shaved peak line */}
        <line x1="305" y1="163" x2="355" y2="163" stroke={C.greenLight} strokeWidth="0.8" strokeDasharray="2,2" />
        <text x="330" y="155" textAnchor="middle" fill={C.midGray} fontSize="5" fontFamily="Calibri, sans-serif">Peak Shaving</text>
      </g>
    </>
  );
}

/* ── Phase IV: Wärmekonzept — WP-Kaskade, Wärmenetz ────────────── */
function WaermeVisual() {
  const pipeColor = "#E8785A";
  const pipeLight = "#F4A589";
  return (
    <>
      <SiteBase dim />

      {/* Heat pipe network connecting buildings */}
      <g>
        {[
          "M170,152 L170,180 L230,180 L230,152",
          "M170,180 L145,180 L145,165",
          "M230,180 L265,180 L265,156",
          "M200,180 L200,200",
          "M170,180 L170,200 L155,200",
          "M230,180 L250,200",
        ].map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke={pipeColor} strokeWidth="2.5" opacity="0.35" strokeLinecap="round" />
            <path d={d} fill="none" stroke={pipeLight} strokeWidth="1" opacity="0.5" strokeLinecap="round" strokeDasharray="6,4">
              <animate attributeName="strokeDashoffset" values="0;-20" dur="3s" repeatCount="indefinite" />
            </path>
          </g>
        ))}

        {/* Pipe junction nodes */}
        {[[170, 180], [230, 180], [200, 180]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill={pipeColor} opacity="0.6" />
        ))}
      </g>

      {/* Heat pump cascade units */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={158 + i * 28} y="125" width="22" height="16" rx="3"
            fill={C.navy} stroke={pipeColor} strokeWidth="1" />
          <text x={169 + i * 28} y="136" textAnchor="middle" fill={pipeLight} fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">WP</text>
          {/* Heat waves */}
          <path d={`M${164 + i * 28},123 Q${167 + i * 28},118 ${170 + i * 28},123 Q${173 + i * 28},118 ${176 + i * 28},123`}
            fill="none" stroke={pipeLight} strokeWidth="0.8" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />
          </path>
        </g>
      ))}

      {/* Pufferspeicher (thermal buffer) */}
      <g>
        <rect x="255" y="125" width="16" height="24" rx="8" fill={C.navy} stroke={pipeColor} strokeWidth="1" />
        <rect x="258" y="138" width="10" height="8" rx="2" fill={pipeColor} opacity="0.4" />
        <text x="263" y="135" textAnchor="middle" fill={pipeLight} fontSize="4" fontFamily="Calibri, sans-serif">PS</text>
      </g>

      {/* Labels */}
      <rect x="295" y="120" width="75" height="22" rx="5" fill={C.navy} stroke={pipeColor} strokeWidth="0.8" />
      <text x="332" y="131" textAnchor="middle" fill={pipeLight} fontSize="6.5" fontFamily="Calibri, sans-serif" fontWeight="700">5–10 MW</text>
      <text x="332" y="139" textAnchor="middle" fill={C.midGray} fontSize="5" fontFamily="Calibri, sans-serif">WP-Kaskade</text>

      {/* COP indicator */}
      <g>
        <rect x="300" y="155" width="60" height="18" rx="4" fill="rgba(232,120,90,0.1)" stroke={pipeColor} strokeWidth="0.5" />
        <text x="330" y="164" textAnchor="middle" fill={pipeLight} fontSize="5" fontFamily="Calibri, sans-serif">COP 4–5</text>
        <text x="330" y="170" textAnchor="middle" fill={C.midGray} fontSize="4" fontFamily="Calibri, sans-serif">Abwärme-Quelle</text>
      </g>

      {/* Abwärme arrows from buildings */}
      {[[155, 150], [210, 145], [240, 155]].map(([x, y], i) => (
        <g key={i} opacity="0.4">
          <path d={`M${x},${y} L${x},${y - 12}`} stroke={pipeLight} strokeWidth="1" markerEnd="url(#arrowUp)" />
        </g>
      ))}
      <defs>
        <marker id="arrowUp" markerWidth="5" markerHeight="5" refX="2.5" refY="5" orient="auto">
          <path d="M0,5 L2.5,0 L5,5" fill={pipeLight} opacity="0.5" />
        </marker>
      </defs>
    </>
  );
}

/* ── Phase V: Ladeinfrastruktur — Chargers, EVs, trucks ─────── */
function LadeVisual() {
  return (
    <>
      <SiteBase dim />

      {/* Left parking: AC wallboxes with EVs */}
      <g>
        <rect x="110" y="196" width="48" height="28" rx="2" fill="rgba(255,255,255,0.04)" stroke={C.greenLight} strokeWidth="0.8" />
        {/* Wallbox columns */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <rect x={114 + i * 7} y={200 + (i % 2) * 10} width="5" height="7" rx="1"
              fill={C.navy} stroke={C.greenLight} strokeWidth="0.5" />
            {/* Charging cable */}
            <line x1={116.5 + i * 7} y1={207 + (i % 2) * 10} x2={116.5 + i * 7} y2={211 + (i % 2) * 10}
              stroke={C.greenLight} strokeWidth="0.5" opacity="0.6" />
            {/* LED */}
            <circle cx={116.5 + i * 7} cy={201 + (i % 2) * 10} r="0.8" fill={C.greenLight}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${1.2 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {/* Car silhouettes */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={115 + i * 14} y="213" width="10" height="5" rx="2"
            fill="rgba(255,255,255,0.12)" />
        ))}
        <text x="134" y="232" textAnchor="middle" fill={C.greenLight} fontSize="5" fontFamily="Calibri, sans-serif">60+ AC</text>
      </g>

      {/* Right parking: DC fleet chargers */}
      <g>
        <rect x="265" y="190" width="42" height="30" rx="2" fill="rgba(255,255,255,0.04)" stroke={C.gold} strokeWidth="0.8" />
        {/* DC charger towers */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={272 + i * 12} y="195" width="7" height="12" rx="1.5"
              fill={C.navy} stroke={C.gold} strokeWidth="0.8" />
            <text x={275.5 + i * 12} y="203" textAnchor="middle" fill={C.goldLight} fontSize="3.5" fontFamily="Calibri, sans-serif" fontWeight="700">DC</text>
            {/* Lightning bolt */}
            <path d={`M${275 + i * 12},193 L${276 + i * 12},195 L${274.5 + i * 12},195 L${276 + i * 12},198`}
              fill="none" stroke={C.goldLight} strokeWidth="0.6" />
          </g>
        ))}
        {/* Fleet cars */}
        {[0, 1].map((i) => (
          <rect key={i} x={273 + i * 14} y="210" width="10" height="5" rx="2" fill="rgba(255,255,255,0.12)" />
        ))}
        <text x="286" y="228" textAnchor="middle" fill={C.goldLight} fontSize="5" fontFamily="Calibri, sans-serif">DC Fleet</text>
      </g>

      {/* HPC Truck depot */}
      <g>
        <rect x="155" y="240" width="90" height="28" rx="3" fill="rgba(255,255,255,0.03)" stroke={C.greenLight} strokeWidth="1" strokeDasharray="3,2" />
        {/* HPC charger towers */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={165 + i * 20} y="245" width="10" height="15" rx="2"
              fill={C.navy} stroke={C.greenLight} strokeWidth="1" />
            <text x={170 + i * 20} y="254" textAnchor="middle" fill={C.greenLight} fontSize="4" fontFamily="Calibri, sans-serif" fontWeight="700">HPC</text>
            {/* Power indicator */}
            <rect x={167 + i * 20} y="258" width="6" height="1.5" rx="0.5" fill={C.greenLight} opacity="0.6">
              <animate attributeName="width" values="2;6;2" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
            </rect>
          </g>
        ))}
        {/* Truck silhouettes */}
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={170 + i * 40} y="262" width="18" height="4" rx="1" fill="rgba(255,255,255,0.1)" />
            <rect x={168 + i * 40} y="261" width="5" height="5" rx="1" fill="rgba(255,255,255,0.08)" />
          </g>
        ))}
        <text x="200" y="275" textAnchor="middle" fill={C.greenLight} fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">LKW HPC-Depot · 150–400 kW</text>
      </g>

      {/* Energy flow from PV to chargers */}
      <path d="M200,165 L200,195 M200,195 L134,200 M200,195 L286,195 M200,195 L200,240"
        fill="none" stroke={C.gold} strokeWidth="0.8" opacity="0.3" strokeDasharray="3,3">
        <animate attributeName="strokeDashoffset" values="0;-12" dur="2s" repeatCount="indefinite" />
      </path>
    </>
  );
}

/* ── Phase VI: Graustrom-BESS — Massive container array ──────── */
function BESSVisual() {
  return (
    <>
      <SiteBase dim />

      {/* 110 kV power line */}
      <g opacity="0.6">
        <line x1="30" y1="100" x2="100" y2="140" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <line x1="100" y1="140" x2="140" y2="155" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        {/* Pylon */}
        <path d="M95,135 L100,140 L105,135 M97,137 L103,137" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        <text x="50" y="98" fill={C.midGray} fontSize="5" fontFamily="Calibri, sans-serif">110 kV</text>
      </g>

      {/* Transformer station */}
      <rect x="120" y="148" width="18" height="14" rx="2" fill={C.navy} stroke={C.gold} strokeWidth="1" />
      <text x="129" y="157" textAnchor="middle" fill={C.goldLight} fontSize="4.5" fontFamily="Calibri, sans-serif" fontWeight="700">Trafo</text>

      {/* Massive BESS array */}
      <g>
        {/* Container rows */}
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => (
            <rect key={`${row}-${col}`}
              x={155 + col * 22} y={135 + row * 14}
              width="18" height="10" rx="1.5"
              fill={C.green} opacity={0.3 + (row + col) * 0.04}
              stroke={C.greenLight} strokeWidth="0.5"
            >
              <animate attributeName="opacity"
                values={`${0.3 + (row + col) * 0.04};${0.5 + (row + col) * 0.04};${0.3 + (row + col) * 0.04}`}
                dur={`${2 + row * 0.3 + col * 0.2}s`} repeatCount="indefinite" />
            </rect>
          ))
        )}

        {/* Container status LEDs */}
        {[0, 1, 2, 3, 4].map((row) => (
          <circle key={row} cx={285} cy={140 + row * 14} r="1.5" fill={C.greenLight}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1 + row * 0.25}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* Power flow from Trafo to BESS */}
      <path d="M138,155 L155,155" fill="none" stroke={C.gold} strokeWidth="1.5" opacity="0.5" strokeDasharray="3,2">
        <animate attributeName="strokeDashoffset" values="0;-10" dur="1s" repeatCount="indefinite" />
      </path>

      {/* Labels */}
      <rect x="295" y="140" width="80" height="30" rx="6" fill={C.navy} stroke={C.green} strokeWidth="1" />
      <text x="335" y="153" textAnchor="middle" fill={C.greenLight} fontSize="7" fontFamily="Calibri, sans-serif" fontWeight="700">100 MW</text>
      <text x="335" y="163" textAnchor="middle" fill={C.midGray} fontSize="5.5" fontFamily="Calibri, sans-serif">200 MWh</text>

      {/* Revenue streams */}
      {[
        [310, 185, "Arbitrage"],
        [340, 195, "FCR / aFRR"],
        [370, 185, "Redispatch"],
      ].map(([x, y, label], i) => (
        <g key={i}>
          <rect x={x - 18} y={y - 6} width="36" height="12" rx="3"
            fill="rgba(45,106,79,0.15)" stroke={C.greenLight} strokeWidth="0.5" />
          <text x={x} y={y + 2} textAnchor="middle" fill={C.greenLight} fontSize="4.5" fontFamily="Calibri, sans-serif">{label}</text>
        </g>
      ))}
    </>
  );
}

/* ── Gesamtergebnis: Everything combined ──────────────────────── */
function GesamtVisual() {
  return (
    <>
      <SiteBase>
        {/* Solar panels (gold) */}
        <rect x="146" y="141" width="48" height="23" rx="1" fill={C.gold} opacity="0.4" />
        <rect x="201" y="136" width="53" height="28" rx="1" fill={C.gold} opacity="0.4" />
        <rect x="156" y="169" width="43" height="20" rx="1" fill={C.gold} opacity="0.35" />
        <rect x="206" y="169" width="48" height="20" rx="1" fill={C.gold} opacity="0.35" />

        {/* Carports */}
        <rect x="115" y="201" width="38" height="18" rx="1" fill={C.gold} opacity="0.25" />
        <rect x="270" y="196" width="33" height="18" rx="1" fill={C.gold} opacity="0.25" />

        {/* BESS containers */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={135 + i * 15} y="230" width="12" height="7" rx="1.5"
            fill={C.green} opacity="0.5" stroke={C.greenLight} strokeWidth="0.4" />
        ))}

        {/* Heat pipes */}
        <path d="M170,165 L170,180 L230,180 L230,165" fill="none" stroke="#E8785A" strokeWidth="1.5" opacity="0.3" />

        {/* EV chargers */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={275 + i * 8} y="218" width="4" height="6" rx="1" fill={C.greenLight} opacity="0.5" />
        ))}
      </SiteBase>

      {/* Glowing energy ring around site */}
      <ellipse cx="200" cy="185" rx="120" ry="65" fill="none"
        stroke={C.gold} strokeWidth="1" opacity="0.15" strokeDasharray="5,5">
        <animate attributeName="strokeDashoffset" values="0;-20" dur="4s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="200" cy="185" rx="125" ry="68" fill="none"
        stroke={C.greenLight} strokeWidth="0.5" opacity="0.1" strokeDasharray="3,7">
        <animate attributeName="strokeDashoffset" values="0;20" dur="6s" repeatCount="indefinite" />
      </ellipse>

      {/* BESS array (separate) */}
      <g opacity="0.4">
        {[0, 1, 2, 3].map((col) => (
          <rect key={col} x={320 + col * 16} y="225" width="12" height="8" rx="1.5"
            fill={C.green} stroke={C.greenLight} strokeWidth="0.4" />
        ))}
        <text x="352" y="240" textAnchor="middle" fill={C.midGray} fontSize="4" fontFamily="Calibri, sans-serif">BESS 200 MWh</text>
      </g>

      {/* 95% badge */}
      <g>
        <circle cx="200" cy="105" r="18" fill={C.navy} stroke={C.gold} strokeWidth="1.5" />
        <text x="200" y="109" textAnchor="middle" fill={C.goldLight} fontSize="10" fontFamily="Calibri, sans-serif" fontWeight="700">95%</text>
        <text x="200" y="116" textAnchor="middle" fill={C.midGray} fontSize="4" fontFamily="Calibri, sans-serif">Autarkie</text>
        {/* Glow */}
        <circle cx="200" cy="105" r="20" fill="none" stroke={C.gold} strokeWidth="0.5" opacity="0.3">
          <animate attributeName="r" values="19;22;19" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>
    </>
  );
}

/* ── Main export ──────────────────────────────────────────────── */
const visuals = {
  "I": AnalyseVisual,
  "II": PVVisual,
  "III": SpeicherVisual,
  "IV": WaermeVisual,
  "V": LadeVisual,
  "VI": BESSVisual,
  "✦": GesamtVisual,
};

export default function PhaseVisual({ phaseNum }) {
  const Visual = visuals[phaseNum];
  if (!Visual) return null;

  return (
    <div style={{
      width: "100%",
      maxWidth: "700px",
      margin: "0.75rem 0",
      borderRadius: "12px",
      overflow: "hidden",
      background: "linear-gradient(135deg, rgba(27,42,74,0.6), rgba(37,55,87,0.3))",
      border: "1px solid rgba(212,168,67,0.12)",
      position: "relative",
    }}>
      <svg viewBox="0 0 400 280" style={{ width: "100%", height: "auto", display: "block" }}>
        {/* Background gradient */}
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212,168,67,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <rect width="400" height="280" fill="url(#bgGlow)" />
        <Visual />
      </svg>
    </div>
  );
}
