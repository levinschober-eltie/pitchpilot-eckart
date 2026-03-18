/**
 * PhaseVisuals v3 — Rich isometric-style SVG illustrations.
 * Based on the real Eckart Werke aerial layout (Hartenstein valley site).
 *
 * Iteration rounds:
 * R1: Foundation — realistic terrain, 3D buildings with shadows
 * R2: Detail — panel textures, vehicle shapes, infrastructure detail
 * R3: Atmosphere — glow filters, depth gradients, lighting
 * R4: Animation — energy particles, scanning sweeps, flow lines
 * R5: Composition — unique focus per phase, callout system, polish
 */

const C = {
  navy: "#1B2A4A",
  navyLight: "#253757",
  navyMid: "#1E3050",
  gold: "#D4A843",
  goldLight: "#E8C97A",
  goldDim: "#B8923A",
  green: "#2D6A4F",
  greenLight: "#3A8A66",
  forest: "#1A4D2E",
  forestMid: "#245E3A",
  forestLight: "#2B7A4B",
  warmOrange: "#E8785A",
  warmOrangeLight: "#F4A589",
  midGray: "#9A9A90",
  shadow: "rgba(0,0,0,0.25)",
};

/* ── Shared SVG Defs (filters, gradients) ─────────────────────── */
function SharedDefs() {
  return (
    <defs>
      {/* Glow filter */}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="shadowDrop" x="-10%" y="-10%" width="130%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
      </filter>

      {/* Background radial */}
      <radialGradient id="bgGlow" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="rgba(212,168,67,0.06)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>

      {/* Terrain gradient */}
      <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.forestMid} />
        <stop offset="100%" stopColor={C.forest} />
      </linearGradient>

      {/* Solar panel gradient */}
      <linearGradient id="solarGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={C.gold} stopOpacity="0.7" />
        <stop offset="100%" stopColor={C.goldDim} stopOpacity="0.5" />
      </linearGradient>

      {/* Building roof gradient */}
      <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
      </linearGradient>

      {/* Heat gradient */}
      <linearGradient id="heatGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor={C.warmOrange} stopOpacity="0.6" />
        <stop offset="100%" stopColor={C.warmOrangeLight} stopOpacity="0.1" />
      </linearGradient>

      {/* Arrow markers */}
      <marker id="arrowGold" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
        <path d="M0,0 L6,2 L0,4" fill={C.gold} opacity="0.6" />
      </marker>
      <marker id="arrowGreen" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
        <path d="M0,0 L6,2 L0,4" fill={C.greenLight} opacity="0.6" />
      </marker>
    </defs>
  );
}

/* ── Tree cluster generator ───────────────────────────────────── */
function Trees({ cx, cy, count = 5, spread = 15, opacity = 0.7 }) {
  const trees = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (i * 0.7);
    const dist = spread * (0.3 + Math.random() * 0.7);
    const tx = cx + Math.cos(angle) * dist * (0.5 + i * 0.1);
    const ty = cy + Math.sin(angle) * dist * 0.6 * (0.5 + i * 0.08);
    const size = 3 + (i % 3) * 1.5;
    trees.push(
      <circle key={i} cx={tx} cy={ty} r={size}
        fill={i % 2 === 0 ? C.forest : C.forestMid} opacity={opacity - i * 0.03} />
    );
  }
  return <g>{trees}</g>;
}

/* ── Building with 3D effect ──────────────────────────────────── */
function Building({ x, y, w, h, height = 6, roofColor, highlight = false, opacity: op = 1 }) {
  const rc = roofColor || "url(#roofGrad)";
  return (
    <g opacity={op}>
      {/* Shadow */}
      <rect x={x + 3} y={y + 3} width={w} height={h} rx="1" fill={C.shadow} opacity="0.3" />
      {/* Side faces (depth) */}
      <path d={`M${x + w},${y} L${x + w + height * 0.6},${y - height * 0.4} L${x + w + height * 0.6},${y + h - height * 0.4} L${x + w},${y + h} Z`}
        fill={C.navyMid} opacity="0.6" />
      <path d={`M${x},${y} L${x + height * 0.6},${y - height * 0.4} L${x + w + height * 0.6},${y - height * 0.4} L${x + w},${y} Z`}
        fill={rc} opacity={highlight ? 0.8 : 0.5} />
      {/* Main face */}
      <rect x={x} y={y} width={w} height={h} rx="1"
        fill={C.navyLight} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      {/* Windows */}
      {w > 15 && (
        <g opacity="0.15">
          {Array.from({ length: Math.floor(w / 8) }, (_, i) => (
            <rect key={i} x={x + 3 + i * 8} y={y + h * 0.3} width="4" height="3" rx="0.5" fill="#fff" />
          ))}
        </g>
      )}
      {highlight && (
        <rect x={x} y={y} width={w} height={h} rx="1"
          fill="none" stroke={C.gold} strokeWidth="0.8" opacity="0.4" />
      )}
    </g>
  );
}

/* ── Shared site base with rich terrain ───────────────────────── */
function SiteBase({ children, dim = false }) {
  return (
    <g opacity={dim ? 0.3 : 1}>
      {/* Background hills */}
      <ellipse cx="200" cy="265" rx="220" ry="80" fill={C.forest} opacity="0.25" />

      {/* Forest ring — layered for depth */}
      <path d="M30,190 Q60,95 150,80 Q200,72 250,85 Q340,105 380,185 Q390,230 355,252 Q290,280 200,282 Q110,280 50,252 Q15,230 30,190Z"
        fill={C.forest} opacity="0.45" />
      <path d="M50,185 Q75,110 155,95 Q200,88 245,100 Q325,118 360,185 Q368,218 340,240 Q280,265 200,267 Q120,265 65,240 Q38,218 50,185Z"
        fill={C.forestMid} opacity="0.35" />

      {/* Individual tree clusters */}
      <Trees cx={65} cy={155} count={7} spread={18} />
      <Trees cx={340} cy={150} count={8} spread={20} />
      <Trees cx={50} cy={210} count={6} spread={14} />
      <Trees cx={360} cy={215} count={5} spread={12} />
      <Trees cx={90} cy={120} count={5} spread={16} />
      <Trees cx={310} cy={115} count={6} spread={15} />
      <Trees cx={200} cy={85} count={4} spread={12} opacity={0.5} />

      {/* Inner cleared area */}
      <path d="M85,178 Q108,128 168,118 Q200,112 232,122 Q292,138 318,178 Q328,208 308,228 Q270,250 200,252 Q130,250 92,228 Q72,208 85,178Z"
        fill={C.navyLight} opacity="0.15" />

      {/* Access roads */}
      <path d="M40,265 Q75,235 115,215 Q150,200 190,197 Q220,195 250,200 Q295,210 335,235 Q365,255 385,270"
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" strokeLinecap="round" />
      <path d="M190,197 Q195,175 205,155"
        fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" strokeLinecap="round" />
      {/* Road center line */}
      <path d="M40,265 Q75,235 115,215 Q150,200 190,197 Q220,195 250,200 Q295,210 335,235"
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6,6" />

      {/* Main production halls (3D) */}
      <Building x={145} y={140} w={50} h={25} height={7} />
      <Building x={200} y={133} w={55} h={32} height={8} />
      <Building x={153} y={168} w={45} h={22} height={6} />
      <Building x={203} y={168} w={52} h={22} height={6} />

      {/* Smaller buildings */}
      <Building x={122} y={155} w={25} h={18} height={4} />
      <Building x={260} y={143} w={32} h={22} height={5} />
      <Building x={260} y={170} w={28} h={18} height={4} />
      <Building x={168} y={194} w={36} h={16} height={4} />
      <Building x={210} y={194} w={42} h={16} height={4} />

      {/* Admin / office building */}
      <Building x={138} y={118} w={32} h={18} height={5} />

      {/* Parking areas */}
      <g>
        <rect x="112" y="202" width="42" height="22" rx="1"
          fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        {/* Parking lines */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1={117 + i * 5} y1="204" x2={117 + i * 5} y2="212"
            stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))}
      </g>
      <g>
        <rect x="268" y="196" width="37" height="24" rx="1"
          fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={273 + i * 5} y1="198" x2={273 + i * 5} y2="208"
            stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))}
      </g>

      {children}
    </g>
  );
}

/* ── Callout label component ──────────────────────────────────── */
function Callout({ x, y, text, sub, lineFrom, color = C.gold, align = "left" }) {
  const tx = align === "right" ? x - 4 : x + 4;
  const anchor = align === "right" ? "end" : "start";
  return (
    <g>
      {lineFrom && (
        <line x1={lineFrom[0]} y1={lineFrom[1]} x2={x} y2={y}
          stroke={color} strokeWidth="0.6" opacity="0.4" strokeDasharray="2,2" />
      )}
      <circle cx={x} cy={y} r="2" fill={color} opacity="0.8" />
      <text x={tx} y={y - 3} textAnchor={anchor} fill={color}
        fontSize="7" fontFamily="Calibri, sans-serif" fontWeight="700">{text}</text>
      {sub && (
        <text x={tx} y={y + 5} textAnchor={anchor} fill={C.midGray}
          fontSize="5" fontFamily="Calibri, sans-serif">{sub}</text>
      )}
    </g>
  );
}

/* ── Animated energy particle along path ──────────────────────── */
function EnergyParticle({ path, color = C.gold, dur = "3s", size = 2, delay = "0s" }) {
  return (
    <circle r={size} fill={color} opacity="0.8">
      <animateMotion dur={dur} repeatCount="indefinite" begin={delay}>
        <mpath href={`#${path}`} />
      </animateMotion>
      <animate attributeName="opacity" values="0;0.9;0.9;0" dur={dur} repeatCount="indefinite" begin={delay} />
    </circle>
  );
}

/* ── Car silhouette ───────────────────────────────────────────── */
function Car({ x, y, color = "rgba(255,255,255,0.12)", scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <rect x="0" y="2" width="12" height="5" rx="1.5" fill={color} />
      <rect x="2" y="0" width="8" height="4" rx="1.5" fill={color} opacity="0.7" />
      {/* Wheels */}
      <circle cx="3" cy="7.5" r="1.2" fill="rgba(0,0,0,0.3)" />
      <circle cx="9" cy="7.5" r="1.2" fill="rgba(0,0,0,0.3)" />
      {/* Windshield */}
      <rect x="3" y="0.5" width="3" height="2.5" rx="0.5" fill="rgba(150,200,255,0.15)" />
    </g>
  );
}

/* ── Truck silhouette ─────────────────────────────────────────── */
function Truck({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Trailer */}
      <rect x="0" y="0" width="22" height="7" rx="1" fill="rgba(255,255,255,0.08)" />
      {/* Cab */}
      <rect x="-6" y="1" width="7" height="6" rx="1" fill="rgba(255,255,255,0.12)" />
      <rect x="-5" y="1.5" width="3" height="3" rx="0.5" fill="rgba(150,200,255,0.12)" />
      {/* Wheels */}
      <circle cx="-3" cy="8" r="1.5" fill="rgba(0,0,0,0.3)" />
      <circle cx="6" cy="8" r="1.5" fill="rgba(0,0,0,0.3)" />
      <circle cx="16" cy="8" r="1.5" fill="rgba(0,0,0,0.3)" />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE I: ANALYSE & BEWERTUNG
   ══════════════════════════════════════════════════════════════════ */
function AnalyseVisual() {
  return (
    <>
      <SiteBase>
        {/* Scanning grid overlay */}
        <g opacity="0.3">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={115 + i * 22} y1="108" x2={115 + i * 22} y2="235"
              stroke={C.gold} strokeWidth="0.4" strokeDasharray="2,4" />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`h${i}`} x1="108" y1={115 + i * 20} x2="310" y2={115 + i * 20}
              stroke={C.gold} strokeWidth="0.4" strokeDasharray="2,4" />
          ))}
        </g>

        {/* Animated scan sweep line */}
        <line x1="108" y1="115" x2="108" y2="235" stroke={C.goldLight} strokeWidth="1.5" opacity="0.5">
          <animate attributeName="x1" values="108;310;108" dur="6s" repeatCount="indefinite" />
          <animate attributeName="x2" values="108;310;108" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="6s" repeatCount="indefinite" />
        </line>

        {/* Data collection points with animated rings */}
        {[
          [155, 148, "Dach A"], [225, 142, "Dach B"], [175, 178, "Halle C"],
          [240, 175, "Halle D"], [135, 163, "Nebengeb."], [272, 155, "Lager"],
          [185, 202, "Halle E"], [128, 210, "Parkpl."], [280, 205, "Parkpl."],
        ].map(([x, y, label], i) => (
          <g key={i}>
            {/* Outer ring pulse */}
            <circle cx={x} cy={y} r="8" fill="none" stroke={C.gold} strokeWidth="0.5" opacity="0">
              <animate attributeName="r" values="4;12;4" dur={`${2 + i * 0.25}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur={`${2 + i * 0.25}s`} repeatCount="indefinite" />
            </circle>
            {/* Point */}
            <circle cx={x} cy={y} r="2.5" fill={C.gold} opacity="0.85">
              <animate attributeName="r" values="2;3;2" dur={`${1.5 + i * 0.15}s`} repeatCount="indefinite" />
            </circle>
            {/* Mini label */}
            <text x={x} y={y - 5} textAnchor="middle" fill={C.goldLight}
              fontSize="3.5" fontFamily="Calibri, sans-serif" opacity="0.6">{label}</text>
          </g>
        ))}

        {/* Drone with detailed design */}
        <g filter="url(#shadowDrop)">
          <animateTransform attributeName="transform" type="translate"
            values="0,0; 20,-8; 40,-3; 25,5; 0,0" dur="10s" repeatCount="indefinite" />
          {/* Body */}
          <rect x="178" y="100" width="16" height="10" rx="3" fill={C.goldDim} />
          <rect x="180" y="102" width="12" height="6" rx="2" fill={C.gold} opacity="0.8" />
          {/* Camera lens */}
          <circle cx="186" cy="111" r="2" fill={C.navy} stroke={C.gold} strokeWidth="0.5" />
          {/* Arms */}
          <line x1="173" y1="105" x2="178" y2="105" stroke={C.goldDim} strokeWidth="2" />
          <line x1="194" y1="105" x2="199" y2="105" stroke={C.goldDim} strokeWidth="2" />
          <line x1="178" y1="100" x2="175" y2="98" stroke={C.goldDim} strokeWidth="1.5" />
          <line x1="194" y1="100" x2="197" y2="98" stroke={C.goldDim} strokeWidth="1.5" />
          {/* Propellers */}
          <ellipse cx="173" cy="105" rx="7" ry="2" fill={C.gold} opacity="0.2">
            <animate attributeName="rx" values="7;4;7" dur="0.12s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="199" cy="105" rx="7" ry="2" fill={C.gold} opacity="0.2">
            <animate attributeName="rx" values="4;7;4" dur="0.12s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="175" cy="98" rx="5" ry="1.5" fill={C.gold} opacity="0.15">
            <animate attributeName="rx" values="5;3;5" dur="0.12s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="197" cy="98" rx="5" ry="1.5" fill={C.gold} opacity="0.15">
            <animate attributeName="rx" values="3;5;3" dur="0.12s" repeatCount="indefinite" />
          </ellipse>
          {/* Scan cone */}
          <path d="M186,111 L172,140 L200,140 Z" fill={C.gold} opacity="0.06" />
          <path d="M186,111 L176,135 L196,135 Z" fill="none" stroke={C.gold} strokeWidth="0.3" opacity="0.2" />
        </g>
      </SiteBase>

      {/* Existing PV field */}
      <g>
        <rect x="42" y="162" width="35" height="22" rx="2" fill={C.gold} opacity="0.2"
          stroke={C.gold} strokeWidth="0.8" />
        {/* Panel lines */}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="44" y1={166 + i * 4} x2="75" y2={166 + i * 4}
            stroke={C.goldLight} strokeWidth="0.3" opacity="0.4" />
        ))}
        <Callout x={59} y={155} text="2 MWp" sub="Bestandsanlage" />
      </g>

      {/* Info badges */}
      <Callout x={335} y={118} text="50 Hektar" sub="Industriegelände" color={C.gold} align="right" />
      <Callout x={340} y={145} text="800+" sub="Mitarbeiter" color={C.midGray} align="right" />
      <Callout x={338} y={170} text="110 kV" sub="Netzanschluss" color={C.midGray} align="right" />

      {/* Thermographic inset */}
      <g>
        <rect x="310" y="200" width="70" height="45" rx="4" fill={C.navy}
          stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <text x="345" y="210" textAnchor="middle" fill={C.midGray}
          fontSize="4" fontFamily="Calibri, sans-serif" letterSpacing="1">THERMOGRAFIE</text>
        {/* Fake thermal image */}
        <rect x="315" y="214" width="60" height="25" rx="2" fill="url(#heatGrad)" opacity="0.6" />
        <rect x="320" y="218" width="20" height="12" rx="1" fill={C.warmOrange} opacity="0.3" />
        <rect x="342" y="216" width="28" height="16" rx="1" fill={C.warmOrangeLight} opacity="0.2" />
        {/* Temp scale */}
        <rect x="378" y="214" width="3" height="25" rx="1" fill="url(#heatGrad)" />
        <text x="383" y="218" fill={C.warmOrangeLight} fontSize="3.5" fontFamily="Calibri, sans-serif">80°</text>
        <text x="383" y="237" fill="rgba(100,150,255,0.6)" fontSize="3.5" fontFamily="Calibri, sans-serif">15°</text>
      </g>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE II: PV & GEBÄUDEHÜLLE
   ══════════════════════════════════════════════════════════════════ */
function PVVisual() {
  return (
    <>
      <SiteBase>
        {/* Solar panels on all main halls — with grid texture */}
        {[
          [145, 140, 50, 25], [200, 133, 55, 32], [153, 168, 45, 22],
          [203, 168, 52, 22], [260, 143, 32, 22],
        ].map(([x, y, w, h], bi) => (
          <g key={bi}>
            {/* Panel base glow */}
            <rect x={x} y={y - 7} width={w + 5} height={h}
              fill="url(#solarGrad)" opacity="0.7" rx="1" />
            {/* Panel grid lines */}
            {Array.from({ length: Math.floor(h / 4) }, (_, i) => (
              <line key={`h${i}`} x1={x + 1} y1={y - 6 + i * 4} x2={x + w + 3} y2={y - 6 + i * 4}
                stroke={C.goldLight} strokeWidth="0.3" opacity="0.5" />
            ))}
            {Array.from({ length: Math.floor(w / 6) }, (_, i) => (
              <line key={`v${i}`} x1={x + 2 + i * 6} y1={y - 7} x2={x + 2 + i * 6} y2={y - 7 + h}
                stroke={C.goldLight} strokeWidth="0.2" opacity="0.3" />
            ))}
          </g>
        ))}

        {/* Facade PV strips with detail */}
        {[[145, 140, 25], [200, 133, 32], [255, 133, 32]].map(([x, y, h], i) => (
          <g key={i}>
            <rect x={x - 1} y={y} width="2.5" height={h} fill={C.goldLight} opacity="0.45" />
            {Array.from({ length: Math.floor(h / 4) }, (_, j) => (
              <rect key={j} x={x - 0.5} y={y + j * 4 + 1} width="1.5" height="2.5" rx="0.3"
                fill={C.gold} opacity="0.3" />
            ))}
          </g>
        ))}

        {/* Carport structure — left parking (detailed 3D) */}
        <g>
          {/* Roof */}
          <path d="M110,195 L112,190 L157,190 L159,195 Z" fill={C.gold} opacity="0.4" />
          <rect x="110" y="195" width="49" height="1.5" fill={C.goldDim} opacity="0.6" />
          {/* Panel grid on roof */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line key={i} x1={114 + i * 6} y1="190.5" x2={114 + i * 6} y2="195"
              stroke={C.goldLight} strokeWidth="0.3" opacity="0.4" />
          ))}
          {/* Support columns */}
          {[113, 127, 141, 156].map((x) => (
            <line key={x} x1={x} y1="196" x2={x} y2="222"
              stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          ))}
          {/* Parked cars */}
          <Car x={114} y={207} />
          <Car x={128} y={207} />
          <Car x={142} y={207} />
        </g>

        {/* Carport — right parking */}
        <g>
          <path d="M265,189 L267,184 L308,184 L310,189 Z" fill={C.gold} opacity="0.4" />
          <rect x="265" y="189" width="45" height="1.5" fill={C.goldDim} opacity="0.6" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={269 + i * 6} y1="184.5" x2={269 + i * 6} y2="189"
              stroke={C.goldLight} strokeWidth="0.3" opacity="0.4" />
          ))}
          {[268, 280, 292, 307].map((x) => (
            <line key={x} x1={x} y1="190" x2={x} y2="218"
              stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          ))}
          <Car x={270} y={203} />
          <Car x={284} y={203} />
        </g>

        {/* Sun with animated rays */}
        <g>
          <circle cx="355" cy="70" r="12" fill={C.gold} opacity="0.15" />
          <circle cx="355" cy="70" r="8" fill={C.goldLight} opacity="0.25" />
          <circle cx="355" cy="70" r="4" fill={C.goldLight} opacity="0.5" />
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const x1 = 355 + Math.cos(angle) * 16;
            const y1 = 70 + Math.sin(angle) * 16;
            const x2 = 355 + Math.cos(angle) * 22;
            const y2 = 70 + Math.sin(angle) * 22;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={C.goldLight} strokeWidth="1" opacity="0.2" strokeLinecap="round">
                <animate attributeName="opacity" values="0.1;0.3;0.1"
                  dur={`${2 + (i % 3) * 0.5}s`} repeatCount="indefinite" />
              </line>
            );
          })}
        </g>

        {/* Sunbeams hitting panels */}
        {[[170, 105], [225, 100], [275, 108]].map(([x, y], i) => (
          <line key={i} x1={340 - i * 5} y1={75 + i * 2} x2={x} y2={y}
            stroke={C.goldLight} strokeWidth="0.5" opacity="0.12" strokeDasharray="4,8">
            <animate attributeName="opacity" values="0.05;0.18;0.05" dur={`${3 + i * 0.7}s`} repeatCount="indefinite" />
          </line>
        ))}
      </SiteBase>

      {/* Existing PV field */}
      <g>
        <rect x="42" y="162" width="35" height="22" rx="2" fill={C.gold} opacity="0.35"
          stroke={C.gold} strokeWidth="0.8" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="44" y1={166 + i * 4} x2="75" y2={166 + i * 4}
            stroke={C.goldLight} strokeWidth="0.3" opacity="0.5" />
        ))}
      </g>

      {/* Callouts */}
      <Callout x={55} y={155} text="2 MWp" sub="Freifläche (Bestand)" lineFrom={[59, 162]} />
      <Callout x={340} y={120} text="6,5–11 MWp" sub="Gesamt-Erzeugung" color={C.gold} align="right" />
      <Callout x={345} y={148} text="Dach + Fassade" sub="+ Carport + Bestand" color={C.midGray} align="right" />

      {/* Energy generation indicator */}
      <g>
        <rect x="320" y="200" width="65" height="28" rx="5" fill={C.navy} stroke={C.gold} strokeWidth="0.6" />
        <text x="352" y="212" textAnchor="middle" fill={C.goldLight}
          fontSize="6.5" fontFamily="Calibri, sans-serif" fontWeight="700">5.800–9.800</text>
        <text x="352" y="221" textAnchor="middle" fill={C.midGray}
          fontSize="5" fontFamily="Calibri, sans-serif">MWh/a Erzeugung</text>
      </g>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE III: SPEICHER & STEUERUNG
   ══════════════════════════════════════════════════════════════════ */
function SpeicherVisual() {
  return (
    <>
      <SiteBase dim>
        {/* Dim PV on roofs */}
        {[[145, 133, 50, 25], [200, 126, 55, 32]].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill={C.gold} opacity="0.15" rx="1" />
        ))}
      </SiteBase>

      {/* BESS container row — detailed */}
      <g filter="url(#shadowDrop)">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            {/* Container body */}
            <rect x={130 + i * 28} y="218" width="24" height="13" rx="2"
              fill={C.green} opacity="0.55" stroke={C.greenLight} strokeWidth="0.8" />
            {/* Container side (3D) */}
            <path d={`M${154 + i * 28},218 L${157 + i * 28},215 L${157 + i * 28},228 L${154 + i * 28},231`}
              fill={C.forestMid} opacity="0.4" />
            {/* Ventilation grills */}
            {[0, 1, 2].map((j) => (
              <rect key={j} x={133 + i * 28 + j * 6} y="221" width="4" height="7" rx="0.5"
                fill={C.navy} opacity="0.4" />
            ))}
            {/* Status LED strip */}
            <rect x={132 + i * 28} y="219" width="18" height="1.5" rx="0.5" fill={C.greenLight} opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.7;0.3"
                dur={`${1.5 + i * 0.25}s`} repeatCount="indefinite" />
            </rect>
            {/* Door handle */}
            <rect x={148 + i * 28} y="224" width="1" height="4" rx="0.5" fill="rgba(255,255,255,0.15)" />
          </g>
        ))}
      </g>

      {/* EMS central display */}
      <g filter="url(#glow)">
        <rect x="178" y="148" width="44" height="28" rx="5" fill={C.navy} stroke={C.gold} strokeWidth="1.2" />
        {/* Screen */}
        <rect x="182" y="152" width="36" height="16" rx="2" fill="rgba(0,0,0,0.3)" />
        {/* Mini bar chart */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={185 + i * 5} y={165 - (3 + (i * 2.3) % 7)} width="3"
            height={3 + (i * 2.3) % 7} fill={i < 4 ? C.gold : C.greenLight} opacity="0.6" rx="0.5" />
        ))}
        <text x="200" y="160" textAnchor="middle" fill={C.goldLight}
          fontSize="4" fontFamily="Calibri, sans-serif" opacity="0.6">ECHTZEIT</text>
        <text x="200" y="172" textAnchor="middle" fill={C.goldLight}
          fontSize="7" fontFamily="Calibri, sans-serif" fontWeight="700">EMS</text>
      </g>

      {/* Animated energy flow paths */}
      <defs>
        <path id="flow1" d="M170,170 Q170,195 155,218" />
        <path id="flow2" d="M230,170 Q230,195 240,218" />
        <path id="flow3" d="M200,176 L200,218" />
        <path id="flow4" d="M142,218 Q120,195 130,170" />
        <path id="flow5" d="M258,218 Q280,195 270,170" />
      </defs>
      {["flow1", "flow2", "flow3", "flow4", "flow5"].map((id, i) => (
        <g key={id}>
          <use href={`#${id}`} fill="none" stroke={C.greenLight} strokeWidth="1" opacity="0.2" strokeDasharray="3,4" />
          <EnergyParticle path={id} color={C.greenLight} dur={`${2.5 + i * 0.3}s`} delay={`${i * 0.4}s`} />
        </g>
      ))}

      {/* Peak Shaving chart — detailed */}
      <g>
        <rect x="300" y="140" width="82" height="52" rx="5" fill={C.navy}
          stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <text x="341" y="151" textAnchor="middle" fill={C.midGray}
          fontSize="4.5" fontFamily="Calibri, sans-serif" letterSpacing="1">PEAK SHAVING</text>
        {/* Axes */}
        <line x1="310" y1="158" x2="310" y2="183" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <line x1="310" y1="183" x2="375" y2="183" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        {/* Original load curve */}
        <polyline points="312,178 320,170 326,175 332,162 338,158 344,164 350,168 356,160 362,166 370,178"
          fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
        {/* Shaved load curve */}
        <polyline points="312,178 320,170 326,175 332,166 338,166 344,166 350,168 356,166 362,166 370,178"
          fill="none" stroke={C.greenLight} strokeWidth="1.2" />
        {/* Shaved area */}
        <path d="M332,162 L332,166 L338,166 L338,158 Z" fill={C.greenLight} opacity="0.15" />
        <path d="M356,160 L356,166 L362,166 L362,166 Z" fill={C.greenLight} opacity="0.15" />
        {/* Peak limit line */}
        <line x1="310" y1="166" x2="375" y2="166" stroke={C.greenLight} strokeWidth="0.6"
          strokeDasharray="3,2" opacity="0.5" />
        <text x="376" y="168" fill={C.greenLight} fontSize="3.5" fontFamily="Calibri, sans-serif">Limit</text>
      </g>

      {/* Callouts */}
      <Callout x={195} y={240} text="6,5–11 MWh" sub="BESS · 0,5C · 1:1 PV" color={C.greenLight} />
      <Callout x={345} y={198} text="10–15 %" sub="Leistungspreis-Senkung" color={C.greenLight} align="right" />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE IV: WÄRMEKONZEPT
   ══════════════════════════════════════════════════════════════════ */
function WaermeVisual() {
  const pc = C.warmOrange;
  const pl = C.warmOrangeLight;
  return (
    <>
      <SiteBase dim />

      {/* Heat pipe network — main backbone */}
      <defs>
        <path id="hpipe1" d="M170,155 L170,182 L230,182 L230,155" />
        <path id="hpipe2" d="M170,182 L142,182 L142,165" />
        <path id="hpipe3" d="M230,182 L268,182 L268,160" />
        <path id="hpipe4" d="M200,182 L200,202" />
        <path id="hpipe5" d="M170,182 L155,202" />
        <path id="hpipe6" d="M230,182 L248,202" />
      </defs>
      {/* Pipe casing (thick) */}
      {["hpipe1", "hpipe2", "hpipe3", "hpipe4", "hpipe5", "hpipe6"].map((id) => (
        <use key={id} href={`#${id}`} fill="none" stroke={pc} strokeWidth="3.5"
          opacity="0.25" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {/* Animated flow */}
      {["hpipe1", "hpipe2", "hpipe3", "hpipe4", "hpipe5", "hpipe6"].map((id, i) => (
        <g key={`a${id}`}>
          <use href={`#${id}`} fill="none" stroke={pl} strokeWidth="1.2"
            opacity="0.5" strokeDasharray="5,5" strokeLinecap="round">
            <animate attributeName="strokeDashoffset" values="0;-20" dur="2.5s" repeatCount="indefinite" />
          </use>
          <EnergyParticle path={id} color={pl} dur={`${3 + i * 0.4}s`} size={2.5} delay={`${i * 0.5}s`} />
        </g>
      ))}

      {/* Pipe junction nodes with glow */}
      {[[170, 182], [230, 182], [200, 182]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill={pc} opacity="0.5" />
          <circle cx={x} cy={y} r="2" fill={pl} opacity="0.8" />
        </g>
      ))}

      {/* Heat pump cascade — detailed units */}
      {[0, 1, 2].map((i) => (
        <g key={i} filter="url(#shadowDrop)">
          <rect x={148 + i * 32} y="122" width="26" height="20" rx="3"
            fill={C.navy} stroke={pc} strokeWidth="1.2" />
          {/* Fan grill */}
          <circle cx={161 + i * 32} cy="130" r="5" fill="none" stroke={pc} strokeWidth="0.6" opacity="0.4" />
          <circle cx={161 + i * 32} cy="130" r="3" fill="none" stroke={pc} strokeWidth="0.4" opacity="0.3" />
          <circle cx={161 + i * 32} cy="130" r="1" fill={pc} opacity="0.5" />
          {/* Label */}
          <text x={161 + i * 32} y="139" textAnchor="middle" fill={pl}
            fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700">WP {i + 1}</text>
          {/* Heat waves rising */}
          {[0, 1, 2].map((j) => (
            <path key={j}
              d={`M${156 + i * 32 + j * 4},120 Q${158 + i * 32 + j * 4},115 ${160 + i * 32 + j * 4},120`}
              fill="none" stroke={pl} strokeWidth="0.8" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.6;0.2"
                dur={`${1.2 + j * 0.3 + i * 0.2}s`} repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate"
                values="0,0;0,-5;0,0" dur={`${1.2 + j * 0.3 + i * 0.2}s`} repeatCount="indefinite" />
            </path>
          ))}
          {/* Pipe connections down */}
          <line x1={161 + i * 32} y1="142" x2={161 + i * 32} y2="155"
            stroke={pc} strokeWidth="2" opacity="0.4" />
        </g>
      ))}

      {/* Pufferspeicher — cylindrical tank */}
      <g filter="url(#shadowDrop)">
        <ellipse cx="265" cy="124" rx="10" ry="3" fill={C.navyMid} stroke={pc} strokeWidth="0.6" />
        <rect x="255" y="124" width="20" height="28" fill={C.navy} stroke={pc} strokeWidth="0.8" />
        <ellipse cx="265" cy="152" rx="10" ry="3" fill={C.navyMid} stroke={pc} strokeWidth="0.6" />
        {/* Fill level */}
        <rect x="257" y="135" width="16" height="15" fill={pc} opacity="0.2" rx="1" />
        <text x="265" y="144" textAnchor="middle" fill={pl}
          fontSize="4.5" fontFamily="Calibri, sans-serif" fontWeight="700">500 m³</text>
        {/* Temperature indicator */}
        <rect x="257" y="126" width="3" height="22" rx="1" fill="url(#heatGrad)" opacity="0.6" />
      </g>

      {/* Abwärme source arrows */}
      {[
        [155, 155, "Mühlen"], [210, 148, "Trockner"], [245, 158, "Kompr."],
      ].map(([x, y, label], i) => (
        <g key={i} opacity="0.5">
          <path d={`M${x},${y} L${x},${y - 15}`}
            stroke={pl} strokeWidth="1.2" markerEnd="url(#arrowGold)" />
          <text x={x} y={y - 18} textAnchor="middle" fill={pl}
            fontSize="3.5" fontFamily="Calibri, sans-serif">{label}</text>
        </g>
      ))}

      {/* Callouts */}
      <Callout x={335} y={120} text="5–10 MW" sub="WP-Kaskade" color={pc} align="right" />
      <Callout x={340} y={150} text="COP 4–5" sub="Abwärme als Quelle" color={pl} align="right" />
      <Callout x={338} y={178} text="65–80 %" sub="Gaskosten-Reduktion" color={C.greenLight} align="right" />

      {/* Building heat overlay */}
      {[[145, 140, 50, 25], [200, 133, 55, 32], [153, 168, 45, 22], [203, 168, 52, 22]].map(
        ([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="1"
            fill={pc} opacity={0.08 + i * 0.02}>
            <animate attributeName="opacity" values={`${0.05 + i * 0.02};${0.12 + i * 0.02};${0.05 + i * 0.02}`}
              dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
          </rect>
        )
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE V: LADEINFRASTRUKTUR
   ══════════════════════════════════════════════════════════════════ */
function LadeVisual() {
  return (
    <>
      <SiteBase dim />

      {/* Energy supply line from buildings (PV → chargers) */}
      <defs>
        <path id="pvFlow1" d="M200,168 L200,198 Q180,210 135,215" />
        <path id="pvFlow2" d="M200,168 L200,198 Q225,210 285,205" />
        <path id="pvFlow3" d="M200,198 L200,245" />
      </defs>
      {["pvFlow1", "pvFlow2", "pvFlow3"].map((id, i) => (
        <g key={id}>
          <use href={`#${id}`} fill="none" stroke={C.gold} strokeWidth="0.8" opacity="0.15" />
          <EnergyParticle path={id} color={C.goldLight} dur={`${3 + i * 0.5}s`} delay={`${i * 0.8}s`} />
        </g>
      ))}

      {/* === LEFT PARKING: AC Wallboxes === */}
      <g>
        <rect x="98" y="198" width="56" height="32" rx="2"
          fill="rgba(255,255,255,0.03)" stroke={C.greenLight} strokeWidth="0.8" />
        <text x="126" y="196" textAnchor="middle" fill={C.greenLight}
          fontSize="4.5" fontFamily="Calibri, sans-serif" letterSpacing="1">AC-LADEPARK</text>

        {/* Wallbox columns with cables */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const wx = 103 + col * 12;
          const wy = 202 + row * 14;
          return (
            <g key={i}>
              <rect x={wx} y={wy} width="6" height="9" rx="1.2"
                fill={C.navy} stroke={C.greenLight} strokeWidth="0.6" />
              {/* Screen */}
              <rect x={wx + 1} y={wy + 1} width="4" height="3" rx="0.5" fill="rgba(58,138,102,0.3)" />
              {/* Cable */}
              <path d={`M${wx + 3},${wy + 9} Q${wx + 3},${wy + 11} ${wx + 5},${wy + 11}`}
                fill="none" stroke={C.greenLight} strokeWidth="0.5" opacity="0.5" />
              {/* LED */}
              <circle cx={wx + 3} cy={wy + 7} r="0.8" fill={C.greenLight}>
                <animate attributeName="opacity" values="0.4;1;0.4"
                  dur={`${1 + i * 0.15}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Cars at chargers */}
        <Car x={103} y={213} color="rgba(100,180,255,0.15)" />
        <Car x={127} y={213} color="rgba(255,255,255,0.12)" />
        <Car x={115} y={222} color="rgba(180,255,180,0.12)" scale={0.9} />
      </g>

      {/* === RIGHT PARKING: DC Fleet Chargers === */}
      <g>
        <rect x="262" y="192" width="50" height="34" rx="2"
          fill="rgba(255,255,255,0.03)" stroke={C.gold} strokeWidth="0.8" />
        <text x="287" y="190" textAnchor="middle" fill={C.goldLight}
          fontSize="4.5" fontFamily="Calibri, sans-serif" letterSpacing="1">DC-FLEET</text>

        {/* DC charger towers (taller, more detail) */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={268 + i * 10} y="197" width="8" height="14" rx="2"
              fill={C.navy} stroke={C.gold} strokeWidth="0.8" />
            {/* Screen */}
            <rect x={269 + i * 10} y="199" width="6" height="4" rx="0.5" fill="rgba(212,168,67,0.2)" />
            {/* Lightning bolt */}
            <path d={`M${273 + i * 10},205 L${274 + i * 10},207 L${272 + i * 10},208 L${274 + i * 10},211`}
              fill="none" stroke={C.goldLight} strokeWidth="0.7" opacity="0.7">
              <animate attributeName="opacity" values="0.4;0.9;0.4"
                dur={`${0.8 + i * 0.2}s`} repeatCount="indefinite" />
            </path>
          </g>
        ))}

        {/* Fleet cars */}
        <Car x={269} y={214} color="rgba(212,168,67,0.15)" />
        <Car x={289} y={214} color="rgba(212,168,67,0.12)" />
      </g>

      {/* === HPC TRUCK DEPOT === */}
      <g>
        <rect x="140" y="242" width="120" height="34" rx="3"
          fill="rgba(255,255,255,0.02)" stroke={C.greenLight} strokeWidth="1"
          strokeDasharray="4,2" />
        <text x="200" y="240" textAnchor="middle" fill={C.greenLight}
          fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700" letterSpacing="1">
          LKW HPC-DEPOT
        </text>

        {/* HPC charger towers (tall, industrial) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={150 + i * 22} y="248" width="12" height="18" rx="2.5"
              fill={C.navy} stroke={C.greenLight} strokeWidth="1" />
            {/* Display */}
            <rect x={152 + i * 22} y="250" width="8" height="5" rx="1" fill="rgba(58,138,102,0.25)" />
            {/* Power bar */}
            <rect x={153 + i * 22} y="260" width="6" height="2" rx="0.5" fill={C.greenLight} opacity="0.5">
              <animate attributeName="width" values="2;6;2" dur={`${1.8 + i * 0.25}s`} repeatCount="indefinite" />
            </rect>
            {/* kW label */}
            <text x={156 + i * 22} y="258" textAnchor="middle" fill={C.greenLight}
              fontSize="3.5" fontFamily="Calibri, sans-serif" fontWeight="700">
              {150 + i * 50}
            </text>
          </g>
        ))}

        {/* Trucks at chargers */}
        <Truck x={150} y={268} />
        <Truck x={196} y={268} />
      </g>

      {/* Callouts */}
      <Callout x={50} y={205} text="60+ AC" sub="22 kW Wallboxen" color={C.greenLight} />
      <Callout x={335} y={235} text="150–400 kW" sub="CCS Depot-Laden" color={C.greenLight} align="right" />
      <Callout x={340} y={260} text="~65 % günstiger" sub="vs. Diesel/Benzin" color={C.gold} align="right" />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE VI: GRAUSTROM-BESS
   ══════════════════════════════════════════════════════════════════ */
function BESSVisual() {
  return (
    <>
      <SiteBase dim />

      {/* 110 kV Power line with lattice pylon */}
      <g>
        {/* Line */}
        <line x1="15" y1="85" x2="85" y2="125" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <line x1="85" y1="125" x2="125" y2="148" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        {/* Catenary sag */}
        <path d="M15,85 Q50,80 85,125" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        {/* Lattice pylon */}
        <g>
          <line x1="80" y1="135" x2="85" y2="110" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <line x1="90" y1="135" x2="85" y2="110" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          {/* Cross braces */}
          <line x1="82" y1="128" x2="88" y2="128" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          <line x1="83" y1="122" x2="87" y2="122" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          {/* Arms */}
          <line x1="75" y1="113" x2="95" y2="113" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <line x1="78" y1="118" x2="92" y2="118" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          {/* Insulators */}
          <circle cx="76" cy="113" r="1.5" fill="rgba(100,180,255,0.3)" />
          <circle cx="94" cy="113" r="1.5" fill="rgba(100,180,255,0.3)" />
        </g>
        <text x="42" y="80" fill={C.midGray} fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">110 kV</text>
      </g>

      {/* Transformer station — detailed */}
      <g filter="url(#shadowDrop)">
        <rect x="112" y="145" width="24" height="18" rx="2" fill={C.navy} stroke={C.gold} strokeWidth="1.2" />
        {/* Transformer coils */}
        <circle cx="120" cy="154" r="4" fill="none" stroke={C.gold} strokeWidth="0.8" opacity="0.4" />
        <circle cx="128" cy="154" r="4" fill="none" stroke={C.gold} strokeWidth="0.8" opacity="0.4" />
        {/* Insulators on top */}
        {[117, 124, 131].map((x) => (
          <rect key={x} x={x} y="142" width="2" height="4" rx="0.5" fill="rgba(100,180,255,0.3)" />
        ))}
        <text x="124" y="161" textAnchor="middle" fill={C.goldLight}
          fontSize="4" fontFamily="Calibri, sans-serif" fontWeight="700">TRAFO</text>
      </g>

      {/* Animated power flow: Trafo → BESS */}
      <defs>
        <path id="bessFlow" d="M136,154 Q145,154 150,150" />
      </defs>
      <use href="#bessFlow" fill="none" stroke={C.gold} strokeWidth="2" opacity="0.3" />
      <EnergyParticle path="bessFlow" color={C.goldLight} dur="1.5s" size={3} />

      {/* Massive BESS container array (6x5 = 30 containers) */}
      <g>
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => {
            const x = 150 + col * 23;
            const y = 130 + row * 16;
            return (
              <g key={`${row}-${col}`}>
                {/* Shadow */}
                <rect x={x + 2} y={y + 2} width="19" height="12" rx="1.5" fill="rgba(0,0,0,0.2)" />
                {/* Container */}
                <rect x={x} y={y} width="19" height="12" rx="1.5"
                  fill={C.green} opacity={0.35 + (row + col) * 0.03}
                  stroke={C.greenLight} strokeWidth="0.5" />
                {/* Side face */}
                <path d={`M${x + 19},${y} L${x + 21},${y - 1.5} L${x + 21},${y + 10.5} L${x + 19},${y + 12}`}
                  fill={C.forestMid} opacity="0.25" />
                {/* Ventilation */}
                <rect x={x + 2} y={y + 3} width="3" height="6" rx="0.5" fill={C.navy} opacity="0.3" />
                {/* LED */}
                <circle cx={x + 16} cy={y + 3} r="1" fill={C.greenLight} opacity="0.5">
                  <animate attributeName="opacity"
                    values={`0.3;0.8;0.3`}
                    dur={`${1.5 + row * 0.2 + col * 0.15}s`} repeatCount="indefinite" />
                </circle>
              </g>
            );
          })
        )}
      </g>

      {/* Revenue stream cards */}
      <g>
        {[
          [310, 135, "Arbitrage", "2–5 ct → Peak", C.gold],
          [310, 158, "FCR / aFRR", "< 1s Reaktion", C.greenLight],
          [310, 181, "Redispatch", "Netzstabilität", C.midGray],
        ].map(([x, y, title, sub, color], i) => (
          <g key={i}>
            <rect x={x} y={y} width="72" height="18" rx="4"
              fill={C.navy} stroke={color} strokeWidth="0.6" opacity="0.9" />
            <circle cx={x + 8} cy={y + 9} r="3" fill={color} opacity="0.3" />
            <text x={x + 8} y={y + 11} textAnchor="middle" fill={color}
              fontSize="4" fontFamily="Calibri, sans-serif" fontWeight="700">{i + 1}</text>
            <text x={x + 16} y={y + 8} fill={color}
              fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700">{title}</text>
            <text x={x + 16} y={y + 14} fill={C.midGray}
              fontSize="3.5" fontFamily="Calibri, sans-serif">{sub}</text>
          </g>
        ))}
      </g>

      {/* Main KPI badge */}
      <g>
        <rect x="308" y="205" width="75" height="30" rx="6" fill={C.navy}
          stroke={C.green} strokeWidth="1.2" />
        <text x="345" y="218" textAnchor="middle" fill={C.greenLight}
          fontSize="9" fontFamily="Calibri, sans-serif" fontWeight="700">100 MW</text>
        <text x="345" y="229" textAnchor="middle" fill={C.midGray}
          fontSize="6" fontFamily="Calibri, sans-serif">200 MWh · 15–25 % p.a.</text>
      </g>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   GESAMTERGEBNIS: Everything combined with glory
   ══════════════════════════════════════════════════════════════════ */
function GesamtVisual() {
  return (
    <>
      <SiteBase>
        {/* Solar panels on all roofs */}
        {[[145, 133, 50, 25], [200, 126, 55, 32], [153, 161, 45, 22],
          [203, 161, 52, 22], [260, 136, 32, 22]].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="1" fill={C.gold} opacity="0.35" />
        ))}

        {/* Carports */}
        <rect x="112" y="193" width="44" height="2" fill={C.gold} opacity="0.4" rx="0.5" />
        <rect x="267" y="188" width="38" height="2" fill={C.gold} opacity="0.4" rx="0.5" />

        {/* BESS containers */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={130 + i * 16} y="233" width="12" height="7" rx="1.5"
            fill={C.green} opacity="0.45" stroke={C.greenLight} strokeWidth="0.4" />
        ))}

        {/* Heat pipes (subtle) */}
        <path d="M170,165 L170,182 L230,182 L230,165"
          fill="none" stroke={C.warmOrange} strokeWidth="1.5" opacity="0.2" />

        {/* EV chargers */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={275 + i * 8} y="218" width="4" height="6" rx="1"
            fill={C.greenLight} opacity="0.4" />
        ))}

        {/* Cars at chargers */}
        <Car x={113} y={198} scale={0.7} />
        <Car x={125} y={198} scale={0.7} />
      </SiteBase>

      {/* Glowing energy rings */}
      <ellipse cx="200" cy="185" rx="115" ry="60" fill="none"
        stroke={C.gold} strokeWidth="1.2" opacity="0.12" strokeDasharray="6,4">
        <animate attributeName="strokeDashoffset" values="0;-20" dur="5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="200" cy="185" rx="125" ry="68" fill="none"
        stroke={C.greenLight} strokeWidth="0.8" opacity="0.08" strokeDasharray="4,8">
        <animate attributeName="strokeDashoffset" values="0;16" dur="7s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="200" cy="185" rx="135" ry="75" fill="none"
        stroke={C.gold} strokeWidth="0.4" opacity="0.06" strokeDasharray="2,10">
        <animate attributeName="strokeDashoffset" values="0;-24" dur="9s" repeatCount="indefinite" />
      </ellipse>

      {/* Large BESS array (separate, right side) */}
      <g opacity="0.35">
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2].map((col) => (
            <rect key={`${row}-${col}`} x={325 + col * 16} y={170 + row * 12}
              width="12" height="8" rx="1.5"
              fill={C.green} stroke={C.greenLight} strokeWidth="0.3" />
          ))
        )}
        <text x="349" y="225" textAnchor="middle" fill={C.midGray}
          fontSize="4" fontFamily="Calibri, sans-serif">BESS 200 MWh</text>
      </g>

      {/* 95% Autarkie badge — prominent */}
      <g filter="url(#glowSoft)">
        <circle cx="200" cy="95" r="22" fill={C.navy} stroke={C.gold} strokeWidth="2" />
        <text x="200" y="99" textAnchor="middle" fill={C.goldLight}
          fontSize="14" fontFamily="Calibri, sans-serif" fontWeight="700">95%</text>
        <text x="200" y="108" textAnchor="middle" fill={C.midGray}
          fontSize="5" fontFamily="Calibri, sans-serif">Autarkie</text>
      </g>

      {/* Floating KPI badges */}
      {[
        [55, 130, "6,5–11 MWp", "☀️"],
        [55, 155, "5–10 MW", "🔥"],
        [55, 180, "70+ Lader", "🔌"],
        [345, 130, "1,4–2,5 Mio €/a", "📈"],
        [345, 155, "6–9 J. ROI", "🎯"],
      ].map(([x, y, text, icon], i) => (
        <g key={i}>
          <rect x={x - 30} y={y - 7} width="60" height="14" rx="7" fill={C.navy}
            stroke={C.gold} strokeWidth="0.5" opacity="0.85" />
          <text x={x - 18} y={y + 2} fill="white" fontSize="6" fontFamily="Calibri, sans-serif">{icon}</text>
          <text x={x - 10} y={y + 2} fill={C.goldLight}
            fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700">{text}</text>
        </g>
      ))}

      {/* Connecting lines from badges to site */}
      {[[85, 135, 130, 155], [85, 160, 155, 175], [85, 185, 140, 210],
        [315, 135, 275, 155], [315, 160, 280, 185]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={C.gold} strokeWidth="0.4" opacity="0.15" strokeDasharray="2,3" />
      ))}
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
      background: "linear-gradient(145deg, rgba(27,42,74,0.7), rgba(30,48,80,0.4), rgba(37,55,87,0.2))",
      border: "1px solid rgba(212,168,67,0.1)",
      position: "relative",
      boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
    }}>
      <svg viewBox="0 0 400 280" style={{ width: "100%", height: "auto", display: "block" }}
        xmlns="http://www.w3.org/2000/svg">
        <SharedDefs />
        <rect width="400" height="280" fill="url(#bgGlow)" />
        <Visual />
      </svg>
    </div>
  );
}
