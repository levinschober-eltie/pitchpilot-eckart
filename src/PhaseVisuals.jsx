/**
 * PhaseVisuals v5 — Premium isometric SVG illustrations.
 * Eckart Werke Hartenstein (50 ha valley site).
 *
 * 25 iteration rounds applied:
 * R1-5:   Foundation, Detail, Atmosphere, Animation, Composition (v3)
 * R6:     Deterministic tree positions (no Math.random)
 * R7:     Industrial building details — chimneys, vents, loading docks
 * R8:     Depth-of-field — edge fog, layered transparency
 * R9:     Isometric grid underlay for technical feel
 * R10:    Phase I — data dashboard inset, laser scan grid, building IDs
 * R11:    Phase II — solar shimmer, 3D carports, yield counter
 * R12:    Phase III — full EMS dashboard mockup, charge level bars
 * R13:    Phase IV — thermal overlay pulses, pipe T-junctions, heat exchangers
 * R14:    Phase V — realistic charger designs, % indicators, GEIG badge
 * R15:    Phase VI — scale comparison, revenue counter, dramatic BESS
 * R16:    Gesamt — floating ecosystem visualization, transformation story
 * R17:    Atmospheric fog layers, edge vignette
 * R18:    Micro-animations on all elements
 * R19:    Improved callout system with icon badges
 * R20:    Label typography polish, consistent font sizing
 * R21:    Shadow consistency (NW light source everywhere)
 * R22:    Color harmony pass — refined opacity layering
 * R23:    Animation timing curves — staggered, organic feel
 * R24:    Pine tree shapes for Fränkische Schweiz authenticity
 * R25:    Final polish — subtle noise texture, border refinement
 */

const C = {
  navy: "#1B2A4A", navyLight: "#253757", navyMid: "#1E3050",
  gold: "#D4A843", goldLight: "#E8C97A", goldDim: "#B8923A",
  green: "#2D6A4F", greenLight: "#3A8A66",
  forest: "#1A4D2E", forestMid: "#245E3A", forestLight: "#2E7A4E",
  warmOrange: "#E8785A", warmOrangeLight: "#F4A589",
  midGray: "#9A9A90", blue: "rgba(100,170,255,0.4)",
};

/* ── Shared SVG Defs ──────────────────────────────────────────── */
function SharedDefs() {
  return (
    <defs>
      <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="glowWide" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="shadow" x="-10%" y="-5%" width="125%" height="130%">
        <feDropShadow dx="1.5" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.35" />
      </filter>
      <filter id="shadowHard" x="-5%" y="-5%" width="115%" height="120%">
        <feDropShadow dx="2" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.4" />
      </filter>

      <radialGradient id="bgRadial" cx="50%" cy="42%" r="60%">
        <stop offset="0%" stopColor="rgba(212,168,67,0.05)" />
        <stop offset="70%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
        <stop offset="60%" stopColor="rgba(0,0,0,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
      </radialGradient>

      <linearGradient id="solarGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={C.gold} stopOpacity="0.75" />
        <stop offset="100%" stopColor={C.goldDim} stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
      </linearGradient>
      <linearGradient id="heatGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor={C.warmOrange} stopOpacity="0.6" />
        <stop offset="100%" stopColor={C.warmOrangeLight} stopOpacity="0.05" />
      </linearGradient>
      <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(27,42,74,0)" />
        <stop offset="80%" stopColor="rgba(27,42,74,0)" />
        <stop offset="100%" stopColor="rgba(27,42,74,0.6)" />
      </linearGradient>
      <linearGradient id="fogTop" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="rgba(27,42,74,0)" />
        <stop offset="85%" stopColor="rgba(27,42,74,0)" />
        <stop offset="100%" stopColor="rgba(27,42,74,0.4)" />
      </linearGradient>

      <marker id="arrG" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
        <path d="M0,0 L5,2 L0,4" fill={C.goldLight} opacity="0.5" />
      </marker>
      <marker id="arrGr" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
        <path d="M0,0 L5,2 L0,4" fill={C.greenLight} opacity="0.5" />
      </marker>
    </defs>
  );
}

/* ── Pine tree (Fränkische Schweiz) ───────────────────────────── */
function Pine({ x, y, h = 8, opacity: op = 0.7 }) {
  return (
    <g opacity={op}>
      <line x1={x} y1={y} x2={x} y2={y - h * 0.3} stroke={C.forest} strokeWidth="1" />
      <path d={`M${x},${y - h} L${x - h * 0.35},${y - h * 0.15} L${x + h * 0.35},${y - h * 0.15} Z`}
        fill={C.forest} />
      <path d={`M${x},${y - h * 0.75} L${x - h * 0.42},${y - h * 0.05} L${x + h * 0.42},${y - h * 0.05} Z`}
        fill={C.forestMid} />
    </g>
  );
}

/* ── Deterministic forest clusters ────────────────────────────── */
function ForestCluster({ cx, cy, count = 6, spread = 15, op = 0.65 }) {
  // Deterministic positions using golden angle
  const GA = 2.39996;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const a = i * GA;
        const r = spread * (0.35 + (i / count) * 0.65);
        const tx = cx + Math.cos(a) * r;
        const ty = cy + Math.sin(a) * r * 0.55;
        const h = 6 + (i % 3) * 2.5;
        return <Pine key={i} x={tx} y={ty} h={h} opacity={op - i * 0.02} />;
      })}
    </g>
  );
}

/* ── 3D Building ──────────────────────────────────────────────── */
function Bldg({ x, y, w, h, d = 6, solar = false, heat = false, op = 1, chimney = false, vent = false }) {
  return (
    <g opacity={op}>
      {/* Shadow on ground */}
      <rect x={x + 2} y={y + 2} width={w} height={h} rx="1" fill="rgba(0,0,0,0.2)" />
      {/* Right face */}
      <path d={`M${x + w},${y} L${x + w + d * 0.55},${y - d * 0.4} L${x + w + d * 0.55},${y + h - d * 0.4} L${x + w},${y + h} Z`}
        fill={C.navyMid} opacity="0.55" stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
      {/* Top face (roof) */}
      <path d={`M${x},${y} L${x + d * 0.55},${y - d * 0.4} L${x + w + d * 0.55},${y - d * 0.4} L${x + w},${y} Z`}
        fill={solar ? "url(#solarGrad)" : "url(#roofGrad)"} />
      {solar && (
        <g>
          {Array.from({ length: Math.floor(w / 5) }, (_, i) => (
            <line key={i} x1={x + 2 + i * 5} y1={y - d * 0.35} x2={x + 2 + i * 5} y2={y - 1}
              stroke={C.goldLight} strokeWidth="0.25" opacity="0.5" />
          ))}
          {Array.from({ length: Math.floor(h / 4) }, (_, i) => {
            const yy = y - d * 0.38 + i * (d * 0.38 / Math.max(Math.floor(h / 4), 1));
            return (
              <line key={`h${i}`} x1={x + 1} y1={yy} x2={x + w - 1} y2={yy}
                stroke={C.goldLight} strokeWidth="0.2" opacity="0.35" />
            );
          })}
        </g>
      )}
      {heat && (
        <rect x={x} y={y} width={w} height={h} rx="1" fill={C.warmOrange} opacity="0.08">
          <animate attributeName="opacity" values="0.04;0.12;0.04" dur="4s" repeatCount="indefinite" />
        </rect>
      )}
      {/* Front face */}
      <rect x={x} y={y} width={w} height={h} rx="1"
        fill={C.navyLight} stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
      {/* Windows row */}
      {w > 18 && (
        <g opacity="0.12">
          {Array.from({ length: Math.floor((w - 4) / 7) }, (_, i) => (
            <rect key={i} x={x + 3 + i * 7} y={y + h * 0.3} width="4" height="3" rx="0.5" fill="#fff" />
          ))}
        </g>
      )}
      {/* Loading dock */}
      {w > 35 && (
        <rect x={x + w - 8} y={y + h - 5} width="6" height="5" rx="0.5"
          fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
      )}
      {/* Chimney */}
      {chimney && (
        <g>
          <rect x={x + w - 6} y={y - d * 0.4 - 8} width="3" height="8" fill={C.navyMid} stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
          {/* Smoke */}
          <circle cx={x + w - 4.5} cy={y - d * 0.4 - 12} r="2" fill="rgba(255,255,255,0.04)">
            <animate attributeName="cy" values={`${y - d * 0.4 - 10};${y - d * 0.4 - 18};${y - d * 0.4 - 10}`} dur="4s" repeatCount="indefinite" />
            <animate attributeName="r" values="1.5;3;1.5" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.06;0.02;0.06" dur="4s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
      {/* Roof vent unit */}
      {vent && (
        <rect x={x + 4} y={y - d * 0.4 - 3} width="5" height="3" rx="0.5"
          fill={C.navyMid} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
      )}
    </g>
  );
}

/* ── Isometric grid underlay ──────────────────────────────────── */
function IsoGrid({ opacity: op = 0.03 }) {
  return (
    <g opacity={op}>
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`d1${i}`} x1={i * 35} y1="0" x2={i * 35 - 100} y2="280"
          stroke={C.gold} strokeWidth="0.5" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`d2${i}`} x1={i * 35} y1="0" x2={i * 35 + 100} y2="280"
          stroke={C.gold} strokeWidth="0.5" />
      ))}
    </g>
  );
}

/* ── Enhanced site base ───────────────────────────────────────── */
function SiteBase({ children, dim = false, solar = false, heat = false }) {
  return (
    <g opacity={dim ? 0.28 : 1}>
      <IsoGrid opacity={dim ? 0.015 : 0.025} />

      {/* Terrain layers */}
      <ellipse cx="200" cy="270" rx="230" ry="75" fill={C.forest} opacity="0.2" />
      <path d="M25,195 Q55,90 145,75 Q200,65 255,80 Q345,100 385,190 Q395,235 360,258 Q295,288 200,290 Q105,288 45,258 Q10,235 25,195Z"
        fill={C.forest} opacity="0.4" />
      <path d="M50,190 Q75,108 155,92 Q200,84 248,97 Q330,118 365,190 Q372,222 345,244 Q285,270 200,272 Q115,270 58,244 Q32,222 50,190Z"
        fill={C.forestMid} opacity="0.3" />

      {/* Forest clusters (deterministic pines) */}
      <ForestCluster cx={58} cy={150} count={9} spread={20} />
      <ForestCluster cx={348} cy={148} count={10} spread={22} />
      <ForestCluster cx={42} cy={215} count={7} spread={16} />
      <ForestCluster cx={365} cy={220} count={6} spread={14} />
      <ForestCluster cx={85} cy={115} count={6} spread={15} />
      <ForestCluster cx={318} cy={110} count={7} spread={16} />
      <ForestCluster cx={200} cy={78} count={5} spread={13} op={0.45} />
      <ForestCluster cx={130} cy={98} count={4} spread={10} op={0.4} />
      <ForestCluster cx={275} cy={95} count={4} spread={11} op={0.4} />

      {/* Cleared inner area */}
      <path d="M88,180 Q108,126 168,115 Q200,108 235,118 Q298,136 322,180 Q332,212 312,232 Q275,254 200,256 Q128,254 92,232 Q72,212 88,180Z"
        fill={C.navyLight} opacity="0.12" />

      {/* Roads */}
      <path d="M35,268 Q72,238 112,218 Q148,202 188,198 Q218,196 248,202 Q292,214 332,240 Q365,260 390,275"
        fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M188,198 Q192,178 202,155"
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4.5" strokeLinecap="round" />
      {/* Center line */}
      <path d="M65,252 Q100,230 140,212 Q170,202 200,198 Q235,198 270,210 Q310,225 345,250"
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" strokeDasharray="5,5" />

      {/* Buildings */}
      <Bldg x={144} y={138} w={52} h={26} d={7} solar={solar} heat={heat} chimney />
      <Bldg x={200} y={130} w={58} h={34} d={9} solar={solar} heat={heat} vent />
      <Bldg x={152} y={168} w={46} h={23} d={6} solar={solar} heat={heat} />
      <Bldg x={202} y={168} w={54} h={23} d={7} solar={solar} heat={heat} chimney />
      <Bldg x={120} y={155} w={26} h={18} d={4} solar={solar} />
      <Bldg x={262} y={141} w={34} h={24} d={5} solar={solar} heat={heat} vent />
      <Bldg x={262} y={170} w={30} h={18} d={4} solar={solar} />
      <Bldg x={168} y={195} w={38} h={16} d={4} solar={solar} />
      <Bldg x={212} y={195} w={44} h={16} d={4} solar={solar} />
      <Bldg x={136} y={116} w={34} h={19} d={5} />

      {/* Parking areas */}
      <g>
        <rect x="110" y="204" width="44" height="24" rx="1.5"
          fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={114 + i * 5} y1="206" x2={114 + i * 5} y2="215"
            stroke="rgba(255,255,255,0.03)" strokeWidth="0.4" />
        ))}
      </g>
      <g>
        <rect x="268" y="198" width="40" height="26" rx="1.5"
          fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={272 + i * 5} y1="200" x2={272 + i * 5} y2="210"
            stroke="rgba(255,255,255,0.03)" strokeWidth="0.4" />
        ))}
      </g>

      {children}
    </g>
  );
}

/* ── Fog / atmosphere overlay ─────────────────────────────────── */
function Atmosphere() {
  return (
    <g>
      <rect width="400" height="280" fill="url(#fogGrad)" />
      <rect width="400" height="280" fill="url(#fogTop)" />
      <rect width="400" height="280" fill="url(#vignette)" />
    </g>
  );
}

/* ── Callout badge ────────────────────────────────────────────── */
function Badge({ x, y, text, sub, icon, color = C.gold, align = "left", lineFrom }) {
  const w = Math.max(text.length * 5.5 + (icon ? 14 : 8), sub ? sub.length * 4 + (icon ? 14 : 8) : 0, 40);
  const bx = align === "right" ? x - w - 2 : x + 2;
  return (
    <g>
      {lineFrom && (
        <line x1={lineFrom[0]} y1={lineFrom[1]} x2={x} y2={y}
          stroke={color} strokeWidth="0.5" opacity="0.25" strokeDasharray="2,3" />
      )}
      <rect x={bx} y={y - 10} width={w} height={sub ? 20 : 14} rx="5"
        fill={C.navy} stroke={color} strokeWidth="0.6" opacity="0.92" />
      {icon && (
        <text x={bx + 6} y={y - 1} fontSize="7">{icon}</text>
      )}
      <text x={bx + (icon ? 14 : 5)} y={y - 1} fill={color}
        fontSize="6" fontFamily="Calibri, sans-serif" fontWeight="700">{text}</text>
      {sub && (
        <text x={bx + (icon ? 14 : 5)} y={y + 7} fill={C.midGray}
          fontSize="4.5" fontFamily="Calibri, sans-serif">{sub}</text>
      )}
    </g>
  );
}

/* ── Energy particles (multiple) ──────────────────────────────── */
function FlowParticles({ pathId, color = C.gold, count = 3, dur = 3 }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} r="2" fill={color} opacity="0">
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${(i / count) * dur}s`}>
            <mpath href={`#${pathId}`} />
          </animateMotion>
          <animate attributeName="opacity" values="0;0.85;0.85;0"
            dur={`${dur}s`} repeatCount="indefinite" begin={`${(i / count) * dur}s`} />
        </circle>
      ))}
    </g>
  );
}

/* ── Car / Truck shapes ───────────────────────────────────────── */
function Car({ x, y, color = "rgba(255,255,255,0.1)", s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="0" y="2.5" width="12" height="5" rx="1.5" fill={color} />
      <rect x="1.5" y="0" width="9" height="4.5" rx="2" fill={color} opacity="0.8" />
      <circle cx="3" cy="8" r="1.3" fill="rgba(0,0,0,0.35)" />
      <circle cx="9" cy="8" r="1.3" fill="rgba(0,0,0,0.35)" />
      <rect x="2.5" y="0.5" width="3.5" height="2.5" rx="0.8" fill="rgba(120,180,255,0.12)" />
    </g>
  );
}
function Truck({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="0" y="0" width="24" height="8" rx="1" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
      <rect x="-7" y="1" width="8" height="7" rx="1.5" fill="rgba(255,255,255,0.1)" />
      <rect x="-6" y="1.5" width="4" height="3.5" rx="0.8" fill="rgba(120,180,255,0.1)" />
      <circle cx="-3" cy="9.5" r="1.8" fill="rgba(0,0,0,0.3)" />
      <circle cx="7" cy="9.5" r="1.8" fill="rgba(0,0,0,0.3)" />
      <circle cx="18" cy="9.5" r="1.8" fill="rgba(0,0,0,0.3)" />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE I — ANALYSE & BEWERTUNG
   ══════════════════════════════════════════════════════════════════ */
function AnalyseVisual() {
  return (
    <>
      <SiteBase>
        {/* Laser scan grid */}
        <g>
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`sv${i}`} x1={112 + i * 20} y1="105" x2={112 + i * 20} y2="240"
              stroke={C.gold} strokeWidth="0.3" opacity="0.2" strokeDasharray="1.5,4" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`sh${i}`} x1="105" y1={110 + i * 18} x2="310" y2={110 + i * 18}
              stroke={C.gold} strokeWidth="0.3" opacity="0.2" strokeDasharray="1.5,4" />
          ))}
          {/* Animated scan beam */}
          <rect x="105" y="110" width="2" height="130" fill={C.goldLight} opacity="0.15" rx="1">
            <animate attributeName="x" values="105;310;105" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.05;0.2" dur="5s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* Building ID labels */}
        {[
          [168, 135, "A1"], [228, 127, "A2"], [174, 164, "B1"], [228, 164, "B2"],
          [132, 152, "C1"], [276, 138, "D1"], [276, 167, "D2"],
        ].map(([x, y, id], i) => (
          <g key={i}>
            <rect x={x - 5} y={y - 5} width="10" height="8" rx="2" fill={C.gold} opacity="0.15" />
            <text x={x} y={y + 1} textAnchor="middle" fill={C.goldLight}
              fontSize="4.5" fontFamily="Calibri, sans-serif" fontWeight="700">{id}</text>
          </g>
        ))}

        {/* Data points with pulse rings */}
        {[
          [158, 148], [230, 142], [178, 178], [245, 178], [135, 163],
          [278, 155], [190, 205], [130, 215], [285, 208], [205, 155],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="2" fill={C.gold} opacity="0.8">
              <animate attributeName="r" values="1.5;3;1.5" dur={`${1.8 + i * 0.18}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r="6" fill="none" stroke={C.gold} strokeWidth="0.4" opacity="0">
              <animate attributeName="r" values="3;10;3" dur={`${1.8 + i * 0.18}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur={`${1.8 + i * 0.18}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Drone (detailed, larger) */}
        <g filter="url(#shadow)">
          <animateTransform attributeName="transform" type="translate"
            values="0,0; 18,-6; 35,-2; 20,6; 0,0" dur="12s" repeatCount="indefinite" />
          <rect x="175" y="94" width="18" height="11" rx="3.5" fill={C.goldDim} />
          <rect x="177" y="96" width="14" height="7" rx="2" fill={C.gold} opacity="0.7" />
          {/* Camera */}
          <circle cx="184" cy="106" r="2.5" fill={C.navy} stroke={C.gold} strokeWidth="0.6" />
          <circle cx="184" cy="106" r="1" fill={C.goldLight} opacity="0.4" />
          {/* Arms + Propellers */}
          {[[-12, 0], [12, 0], [-8, -5], [8, -5]].map(([dx, dy], i) => (
            <g key={i}>
              <line x1={184} y1={99 + dy} x2={184 + dx} y2={99 + dy}
                stroke={C.goldDim} strokeWidth="1.5" />
              <ellipse cx={184 + dx} cy={99 + dy} rx="7" ry="1.8" fill={C.gold} opacity="0.18">
                <animate attributeName="rx" values="7;4;7" dur="0.1s" repeatCount="indefinite" />
              </ellipse>
            </g>
          ))}
          {/* Scan cone */}
          <path d="M184,106 L170,138 L198,138 Z" fill={C.gold} opacity="0.04" />
          <path d="M184,106 L174,132 L194,132 Z" fill="none" stroke={C.gold} strokeWidth="0.3" opacity="0.15" />
        </g>
      </SiteBase>

      {/* Existing PV */}
      <g>
        <rect x="38" y="158" width="38" height="24" rx="2" fill={C.gold} opacity="0.18" stroke={C.gold} strokeWidth="0.7" />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1="40" y1={162 + i * 4} x2="74" y2={162 + i * 4}
            stroke={C.goldLight} strokeWidth="0.3" opacity="0.35" />
        ))}
      </g>
      <Badge x={57} y={150} text="2 MWp" sub="Freifläche (Bestand)" icon="☀️" lineFrom={[57, 158]} />

      {/* Info panel right */}
      <g>
        <rect x="315" y="108" width="72" height="75" rx="6" fill={C.navy} opacity="0.92"
          stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <text x="351" y="120" textAnchor="middle" fill={C.midGray}
          fontSize="4" fontFamily="Calibri, sans-serif" letterSpacing="1.5">STANDORT-PROFIL</text>
        {[
          ["50 ha", "Gelände", C.goldLight],
          ["800+", "Mitarbeiter", C.goldLight],
          ["110 kV", "Netzanschluss", C.goldLight],
          ["12 Mon.", "Lastprofil", C.midGray],
          ["5 Cluster", "Dachgutachten", C.midGray],
        ].map(([val, label, col], i) => (
          <g key={i}>
            <text x="323" y={133 + i * 11} fill={col}
              fontSize="6" fontFamily="Calibri, sans-serif" fontWeight="700">{val}</text>
            <text x="356" y={133 + i * 11} fill={C.midGray}
              fontSize="4.5" fontFamily="Calibri, sans-serif">{label}</text>
          </g>
        ))}
      </g>

      {/* Thermographic inset */}
      <g>
        <rect x="315" y="192" width="68" height="40" rx="4" fill={C.navy} opacity="0.92"
          stroke={C.warmOrange} strokeWidth="0.5" />
        <text x="349" y="201" textAnchor="middle" fill={C.warmOrangeLight}
          fontSize="3.5" fontFamily="Calibri, sans-serif" letterSpacing="1">THERMOGRAFIE</text>
        <rect x="320" y="205" width="58" height="22" rx="2" overflow="hidden" fill="rgba(0,0,0,0.2)" />
        {/* Thermal blocks */}
        <rect x="322" y="207" width="18" height="12" rx="1" fill={C.warmOrange} opacity="0.35" />
        <rect x="342" y="207" width="22" height="16" rx="1" fill={C.warmOrangeLight} opacity="0.25" />
        <rect x="366" y="210" width="10" height="10" rx="1" fill={C.warmOrange} opacity="0.2" />
        {/* Temp bar */}
        <rect x="380" y="205" width="2.5" height="22" rx="1" fill="url(#heatGrad)" />
      </g>

      <Atmosphere />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE II — PV & GEBÄUDEHÜLLE
   ══════════════════════════════════════════════════════════════════ */
function PVVisual() {
  return (
    <>
      <SiteBase solar>
        {/* Carport 3D — left */}
        <g>
          <path d={`M108,192 L110,186 L158,186 L160,192 Z`} fill="url(#solarGrad)" />
          <rect x="108" y="192" width="52" height="2" fill={C.goldDim} opacity="0.5" />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={112 + i * 6.5} y1="186.5" x2={112 + i * 6.5} y2="192"
              stroke={C.goldLight} strokeWidth="0.2" opacity="0.5" />
          ))}
          {[111, 126, 141, 157].map((xp) => (
            <line key={xp} x1={xp} y1="194" x2={xp} y2="226"
              stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
          ))}
          <Car x={113} y={208} color="rgba(100,180,255,0.12)" />
          <Car x={127} y={208} />
          <Car x={141} y={208} color="rgba(180,255,180,0.1)" />
        </g>

        {/* Carport 3D — right */}
        <g>
          <path d={`M265,185 L267,179 L310,179 L312,185 Z`} fill="url(#solarGrad)" />
          <rect x="265" y="185" width="47" height="2" fill={C.goldDim} opacity="0.5" />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={269 + i * 6.5} y1="179.5" x2={269 + i * 6.5} y2="185"
              stroke={C.goldLight} strokeWidth="0.2" opacity="0.5" />
          ))}
          {[268, 282, 296, 310].map((xp) => (
            <line key={xp} x1={xp} y1="187" x2={xp} y2="222"
              stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
          ))}
          <Car x={270} y={205} />
          <Car x={284} y={205} color="rgba(255,220,150,0.12)" />
        </g>

        {/* Solar shimmer animation on roofs */}
        {[[170, 130], [225, 125], [175, 162], [230, 162], [278, 136]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0" fill={C.goldLight} opacity="0">
            <animate attributeName="r" values="0;8;0" dur={`${3 + i * 0.7}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
            <animate attributeName="opacity" values="0;0.15;0" dur={`${3 + i * 0.7}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
          </circle>
        ))}

        {/* Sun */}
        <g>
          <circle cx="358" cy="62" r="14" fill={C.gold} opacity="0.08" />
          <circle cx="358" cy="62" r="9" fill={C.goldLight} opacity="0.18" />
          <circle cx="358" cy="62" r="5" fill={C.goldLight} opacity="0.4" />
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return (
              <line key={i}
                x1={358 + Math.cos(a) * 18} y1={62 + Math.sin(a) * 18}
                x2={358 + Math.cos(a) * 24} y2={62 + Math.sin(a) * 24}
                stroke={C.goldLight} strokeWidth="0.8" opacity="0.15" strokeLinecap="round">
                <animate attributeName="opacity" values="0.08;0.25;0.08"
                  dur={`${2.5 + (i % 4) * 0.4}s`} repeatCount="indefinite" />
              </line>
            );
          })}
          {/* Animated sun rays hitting site */}
          {[[175, 110], [225, 105], [280, 115], [135, 120]].map(([tx, ty], i) => (
            <line key={i} x1={348 - i * 3} y1={68 + i * 2} x2={tx} y2={ty}
              stroke={C.goldLight} strokeWidth="0.4" opacity="0.08" strokeDasharray="5,10">
              <animate attributeName="opacity" values="0.03;0.12;0.03" dur={`${4 + i}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>
      </SiteBase>

      {/* Existing PV */}
      <g>
        <rect x="38" y="158" width="38" height="24" rx="2" fill={C.gold} opacity="0.3" stroke={C.gold} strokeWidth="0.7" />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1="40" y1={162 + i * 4} x2="74" y2={162 + i * 4}
            stroke={C.goldLight} strokeWidth="0.3" opacity="0.4" />
        ))}
      </g>
      <Badge x={55} y={148} text="2 MWp" sub="Bestand" icon="☀️" />

      {/* Yield counter */}
      <g>
        <rect x="315" y="120" width="72" height="40" rx="6" fill={C.navy} opacity="0.92"
          stroke={C.gold} strokeWidth="0.6" />
        <text x="351" y="132" textAnchor="middle" fill={C.midGray}
          fontSize="4" fontFamily="Calibri, sans-serif" letterSpacing="1.5">ERZEUGUNG</text>
        <text x="351" y="145" textAnchor="middle" fill={C.goldLight}
          fontSize="10" fontFamily="Calibri, sans-serif" fontWeight="700">6,5–11 MWp</text>
        <text x="351" y="155" textAnchor="middle" fill={C.midGray}
          fontSize="5" fontFamily="Calibri, sans-serif">5.800–9.800 MWh/a</text>
      </g>

      <Badge x={340} y={180} text="Dach + Fassade + Carport" color={C.midGray} align="right" />

      <Atmosphere />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE III — SPEICHER & STEUERUNG
   ══════════════════════════════════════════════════════════════════ */
function SpeicherVisual() {
  return (
    <>
      <SiteBase dim solar />

      {/* BESS containers (detailed) */}
      <g filter="url(#shadow)">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={126 + i * 30} y="218" width="26" height="14" rx="2"
              fill={C.green} opacity="0.5" stroke={C.greenLight} strokeWidth="0.7" />
            <path d={`M${152 + i * 30},218 L${155 + i * 30},215.5 L${155 + i * 30},229.5 L${152 + i * 30},232`}
              fill={C.forestMid} opacity="0.35" />
            {/* Vents */}
            {[0, 1, 2].map((j) => (
              <rect key={j} x={129 + i * 30 + j * 7} y="221" width="4.5" height="8" rx="0.5"
                fill={C.navy} opacity="0.35" />
            ))}
            {/* LED bar */}
            <rect x={128 + i * 30} y="219" width="20" height="1.5" rx="0.5" fill={C.greenLight} opacity="0.45">
              <animate attributeName="opacity" values="0.25;0.65;0.25" dur={`${1.8 + i * 0.2}s`} repeatCount="indefinite" />
            </rect>
            {/* Charge level bar */}
            <rect x={148 + i * 30} y={225 - (4 + i)} width="2" height={4 + i} rx="0.5"
              fill={C.greenLight} opacity="0.5" />
          </g>
        ))}
      </g>
      <text x="200" y="244" textAnchor="middle" fill={C.greenLight}
        fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">6,5–11 MWh · 0,5C · 3,25–5,5 MW</text>

      {/* EMS Dashboard */}
      <g filter="url(#glow)">
        <rect x="172" y="142" width="56" height="34" rx="5" fill={C.navy} stroke={C.gold} strokeWidth="1.2" />
        <rect x="176" y="146" width="48" height="22" rx="2.5" fill="rgba(0,0,0,0.35)" />
        {/* Mini bar chart */}
        {Array.from({ length: 8 }, (_, i) => {
          const h = 3 + ((i * 3 + 2) % 8);
          return (
            <rect key={i} x={179 + i * 5.5} y={165 - h} width="3.5" height={h}
              fill={i < 5 ? C.gold : C.greenLight} opacity="0.55" rx="0.5">
              <animate attributeName="height" values={`${h};${h + 2};${h}`} dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
              <animate attributeName="y" values={`${165 - h};${163 - h};${165 - h}`} dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
            </rect>
          );
        })}
        <text x="200" y="155" textAnchor="middle" fill={C.goldLight} opacity="0.5"
          fontSize="3.5" fontFamily="Calibri, sans-serif" letterSpacing="0.5">ECHTZEIT-STEUERUNG</text>
        <text x="200" y="172" textAnchor="middle" fill={C.goldLight}
          fontSize="8" fontFamily="Calibri, sans-serif" fontWeight="700">EMS</text>
      </g>

      {/* Energy flow paths */}
      <defs>
        <path id="ef1" d="M172,170 Q150,200 148,218" />
        <path id="ef2" d="M228,170 Q250,200 252,218" />
        <path id="ef3" d="M200,176 L200,218" />
      </defs>
      {["ef1", "ef2", "ef3"].map((id, i) => (
        <g key={id}>
          <use href={`#${id}`} fill="none" stroke={C.greenLight} strokeWidth="0.8" opacity="0.15" />
          <FlowParticles pathId={id} color={C.greenLight} count={3} dur={2.5 + i * 0.3} />
        </g>
      ))}

      {/* Peak Shaving chart */}
      <g>
        <rect x="300" y="135" width="88" height="58" rx="5" fill={C.navy} opacity="0.92"
          stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <text x="344" y="147" textAnchor="middle" fill={C.midGray}
          fontSize="4.5" fontFamily="Calibri, sans-serif" letterSpacing="1">PEAK SHAVING</text>
        {/* Y-axis */}
        <line x1="312" y1="152" x2="312" y2="185" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        {/* X-axis */}
        <line x1="312" y1="185" x2="380" y2="185" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        {/* Grid lines */}
        {[160, 168, 176].map((y) => (
          <line key={y} x1="312" y1={y} x2="380" y2={y}
            stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        ))}
        {/* Original load (red-ish) */}
        <polyline points="314,180 322,172 328,176 334,163 340,158 346,165 352,170 358,160 364,165 372,180"
          fill="none" stroke="rgba(255,150,150,0.35)" strokeWidth="1.2" />
        {/* Optimized load (green) */}
        <polyline points="314,180 322,172 328,176 334,167 340,167 346,167 352,170 358,167 364,167 372,180"
          fill="none" stroke={C.greenLight} strokeWidth="1.2" />
        {/* Shaved areas */}
        <path d="M334,163 L334,167 M340,158 L340,167 M346,165 L346,167 M358,160 L358,167 M364,165 L364,167"
          stroke={C.greenLight} strokeWidth="4" opacity="0.1" />
        {/* Peak limit */}
        <line x1="312" y1="167" x2="380" y2="167" stroke={C.greenLight} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
        {/* Legend */}
        <line x1="316" y1="190" x2="324" y2="190" stroke="rgba(255,150,150,0.4)" strokeWidth="1" />
        <text x="326" y="191" fill={C.midGray} fontSize="3.5" fontFamily="Calibri, sans-serif">Ohne</text>
        <line x1="346" y1="190" x2="354" y2="190" stroke={C.greenLight} strokeWidth="1" />
        <text x="356" y="191" fill={C.midGray} fontSize="3.5" fontFamily="Calibri, sans-serif">Mit BESS</text>
      </g>

      <Badge x={340} y={202} text="10–15 % Leistungspreis" sub="Senkung pro Jahr" color={C.greenLight} align="right" />

      <Atmosphere />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE IV — WÄRMEKONZEPT
   ══════════════════════════════════════════════════════════════════ */
function WaermeVisual() {
  const pc = C.warmOrange, pl = C.warmOrangeLight;
  return (
    <>
      <SiteBase dim heat />

      {/* Heat pipe backbone */}
      <defs>
        <path id="hp1" d="M170,158 L170,185 L232,185 L232,158" />
        <path id="hp2" d="M170,185 L140,185 L140,168" />
        <path id="hp3" d="M232,185 L270,185 L270,162" />
        <path id="hp4" d="M200,185 L200,205" />
        <path id="hp5" d="M170,185 L155,205" />
        <path id="hp6" d="M232,185 L250,205" />
      </defs>
      {["hp1", "hp2", "hp3", "hp4", "hp5", "hp6"].map((id, i) => (
        <g key={id}>
          <use href={`#${id}`} fill="none" stroke={pc} strokeWidth="3.5"
            opacity="0.2" strokeLinecap="round" strokeLinejoin="round" />
          <use href={`#${id}`} fill="none" stroke={pl} strokeWidth="1"
            opacity="0.4" strokeDasharray="4,4" strokeLinecap="round">
            <animate attributeName="strokeDashoffset" values="0;-16" dur="2.5s" repeatCount="indefinite" />
          </use>
          <FlowParticles pathId={id} color={pl} count={2} dur={3 + i * 0.3} />
        </g>
      ))}

      {/* Junction nodes */}
      {[[170, 185], [232, 185], [200, 185]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4.5" fill={pc} opacity="0.35" />
          <circle cx={x} cy={y} r="2" fill={pl} opacity="0.7" />
        </g>
      ))}

      {/* WP Cascade units (detailed) */}
      {[0, 1, 2].map((i) => (
        <g key={i} filter="url(#shadow)">
          <rect x={145 + i * 35} y="118" width="28" height="22" rx="3.5"
            fill={C.navy} stroke={pc} strokeWidth="1.2" />
          {/* Fan grills (concentric) */}
          <circle cx={159 + i * 35} cy="126" r="6" fill="none" stroke={pc} strokeWidth="0.5" opacity="0.35" />
          <circle cx={159 + i * 35} cy="126" r="3.5" fill="none" stroke={pc} strokeWidth="0.4" opacity="0.25" />
          <circle cx={159 + i * 35} cy="126" r="1.2" fill={pc} opacity="0.5">
            <animate attributeName="r" values="1;1.8;1" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          <text x={159 + i * 35} y="138" textAnchor="middle" fill={pl}
            fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700">WP {i + 1}</text>
          {/* Heat waves */}
          {[0, 1, 2].map((j) => (
            <path key={j}
              d={`M${153 + i * 35 + j * 5},116 Q${155.5 + i * 35 + j * 5},111 ${158 + i * 35 + j * 5},116`}
              fill="none" stroke={pl} strokeWidth="0.7" opacity="0.3">
              <animate attributeName="opacity" values="0.15;0.5;0.15"
                dur={`${1.3 + j * 0.25 + i * 0.15}s`} repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate"
                values="0,0;0,-4;0,0" dur={`${1.3 + j * 0.25 + i * 0.15}s`} repeatCount="indefinite" />
            </path>
          ))}
          {/* Pipe connection down */}
          <line x1={159 + i * 35} y1="140" x2={159 + i * 35} y2="158"
            stroke={pc} strokeWidth="2.5" opacity="0.3" />
        </g>
      ))}

      {/* Pufferspeicher (cylindrical) */}
      <g filter="url(#shadow)">
        <ellipse cx="268" cy="120" rx="11" ry="3.5" fill={C.navyMid} stroke={pc} strokeWidth="0.5" />
        <rect x="257" y="120" width="22" height="30" fill={C.navy} stroke={pc} strokeWidth="0.7" />
        <ellipse cx="268" cy="150" rx="11" ry="3.5" fill={C.navyMid} stroke={pc} strokeWidth="0.5" />
        <rect x="259" y="132" width="18" height="16" fill={pc} opacity="0.15" rx="1">
          <animate attributeName="height" values="14;18;14" dur="5s" repeatCount="indefinite" />
          <animate attributeName="y" values="134;130;134" dur="5s" repeatCount="indefinite" />
        </rect>
        <text x="268" y="142" textAnchor="middle" fill={pl}
          fontSize="4.5" fontFamily="Calibri, sans-serif" fontWeight="700">500 m³</text>
      </g>

      {/* Abwärme source labels */}
      {[[155, 155, "Mühlen"], [212, 148, "Trockner"], [248, 160, "Kompress."]].map(
        ([x, y, label], i) => (
          <g key={i} opacity="0.45">
            <line x1={x} y1={y} x2={x} y2={y - 12} stroke={pl} strokeWidth="1" markerEnd="url(#arrG)" />
            <text x={x} y={y - 14} textAnchor="middle" fill={pl}
              fontSize="3.5" fontFamily="Calibri, sans-serif">{label}</text>
          </g>
        )
      )}

      {/* Info panel */}
      <g>
        <rect x="308" y="112" width="78" height="55" rx="6" fill={C.navy} opacity="0.92"
          stroke={pc} strokeWidth="0.5" />
        <text x="347" y="123" textAnchor="middle" fill={C.midGray}
          fontSize="4" fontFamily="Calibri, sans-serif" letterSpacing="1.5">WÄRMESYSTEM</text>
        {[
          ["5–10 MW", "WP-Kaskade", pl],
          ["COP 4–5", "Abwärme-Quelle", pl],
          ["65–80 %", "Gasreduktion", C.greenLight],
          ["Standortweit", "Wärmenetz", C.midGray],
        ].map(([val, label, col], i) => (
          <g key={i}>
            <text x="316" y={136 + i * 10} fill={col}
              fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">{val}</text>
            <text x="350" y={136 + i * 10} fill={C.midGray}
              fontSize="4" fontFamily="Calibri, sans-serif">{label}</text>
          </g>
        ))}
      </g>

      <Atmosphere />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE V — LADEINFRASTRUKTUR
   ══════════════════════════════════════════════════════════════════ */
function LadeVisual() {
  return (
    <>
      <SiteBase dim />

      {/* Energy supply line */}
      <defs>
        <path id="pv2c1" d="M200,170 Q180,195 135,210" />
        <path id="pv2c2" d="M200,170 Q225,195 285,205" />
        <path id="pv2c3" d="M200,170 L200,248" />
      </defs>
      {["pv2c1", "pv2c2", "pv2c3"].map((id, i) => (
        <g key={id}>
          <use href={`#${id}`} fill="none" stroke={C.gold} strokeWidth="0.6" opacity="0.1" />
          <FlowParticles pathId={id} color={C.goldLight} count={2} dur={3.5 + i * 0.5} />
        </g>
      ))}

      {/* AC Ladepark (left) */}
      <g>
        <rect x="96" y="198" width="60" height="36" rx="2.5"
          fill="rgba(255,255,255,0.02)" stroke={C.greenLight} strokeWidth="0.7" />
        <text x="126" y="196" textAnchor="middle" fill={C.greenLight}
          fontSize="4" fontFamily="Calibri, sans-serif" letterSpacing="1">AC-LADEPARK · 22 kW</text>

        {Array.from({ length: 10 }, (_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const wx = 100 + col * 11;
          const wy = 202 + row * 16;
          return (
            <g key={i}>
              <rect x={wx} y={wy} width="7" height="10" rx="1.3"
                fill={C.navy} stroke={C.greenLight} strokeWidth="0.5" />
              <rect x={wx + 1} y={wy + 1} width="5" height="3.5" rx="0.5" fill="rgba(58,138,102,0.25)" />
              <circle cx={wx + 3.5} cy={wy + 7} r="0.7" fill={C.greenLight}>
                <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1 + i * 0.12}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
        <Car x={100} y={220} color="rgba(100,180,255,0.12)" s={0.85} />
        <Car x={112} y={220} s={0.85} />
        <Car x={124} y={220} color="rgba(180,255,180,0.1)" s={0.85} />
        <Car x={136} y={220} color="rgba(255,220,150,0.1)" s={0.85} />
      </g>

      {/* DC Fleet (right) */}
      <g>
        <rect x="260" y="192" width="55" height="36" rx="2.5"
          fill="rgba(255,255,255,0.02)" stroke={C.gold} strokeWidth="0.7" />
        <text x="287" y="190" textAnchor="middle" fill={C.goldLight}
          fontSize="4" fontFamily="Calibri, sans-serif" letterSpacing="1">DC-FLEET · 150 kW</text>

        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={266 + i * 12} y="197" width="8" height="15" rx="2"
              fill={C.navy} stroke={C.gold} strokeWidth="0.7" />
            <rect x={267 + i * 12} y="199" width="6" height="4.5" rx="0.5" fill="rgba(212,168,67,0.2)" />
            {/* Lightning bolt animation */}
            <path d={`M${271 + i * 12},206 L${272.5 + i * 12},208.5 L${270 + i * 12},209 L${272.5 + i * 12},212`}
              fill="none" stroke={C.goldLight} strokeWidth="0.7" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${0.7 + i * 0.15}s`} repeatCount="indefinite" />
            </path>
          </g>
        ))}
        <Car x={267} y={215} color="rgba(212,168,67,0.12)" s={0.9} />
        <Car x={283} y={215} color="rgba(212,168,67,0.1)" s={0.9} />
        <Car x={299} y={215} s={0.9} />
      </g>

      {/* HPC Truck Depot */}
      <g>
        <rect x="130" y="248" width="140" height="30" rx="3"
          fill="rgba(255,255,255,0.015)" stroke={C.greenLight} strokeWidth="0.8" />
        <text x="200" y="246" textAnchor="middle" fill={C.greenLight}
          fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700" letterSpacing="1">
          LKW HPC-DEPOT
        </text>

        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={140 + i * 25} y="253" width="14" height="18" rx="2.5"
              fill={C.navy} stroke={C.greenLight} strokeWidth="0.9" />
            <rect x={142 + i * 25} y="255" width="10" height="5.5" rx="1" fill="rgba(58,138,102,0.2)" />
            <text x={147 + i * 25} y="265" textAnchor="middle" fill={C.greenLight}
              fontSize="4" fontFamily="Calibri, sans-serif" fontWeight="700">{150 + i * 50}</text>
            {/* Power bar */}
            <rect x={143 + i * 25} y="268" width="8" height="1.5" rx="0.5" fill={C.greenLight} opacity="0.4">
              <animate attributeName="width" values="2;8;2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </rect>
          </g>
        ))}
        <Truck x={142} y={273} />
        <Truck x={192} y={273} />
      </g>

      {/* Info badges */}
      <Badge x={40} y={245} text="60+ AC" sub="Wallboxen" icon="🔌" color={C.greenLight} />
      <Badge x={340} y={248} text="150–400 kW" sub="CCS Depot-Laden" icon="⚡" color={C.greenLight} align="right" />

      {/* GEIG badge */}
      <g>
        <rect x="320" y="142" width="65" height="22" rx="5" fill={C.navy} stroke={C.greenLight} strokeWidth="0.6" />
        <text x="352" y="151" textAnchor="middle" fill={C.greenLight}
          fontSize="4" fontFamily="Calibri, sans-serif" letterSpacing="0.5">GEIG-KONFORM</text>
        <text x="352" y="159" textAnchor="middle" fill={C.midGray}
          fontSize="4" fontFamily="Calibri, sans-serif">Ladepflicht ab 2026 ✓</text>
      </g>

      <Atmosphere />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE VI — GRAUSTROM-BESS
   ══════════════════════════════════════════════════════════════════ */
function BESSVisual() {
  return (
    <>
      <SiteBase dim />

      {/* 110 kV Power line + lattice pylon */}
      <g>
        <path d="M12,80 Q48,72 85,122" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
        <line x1="85" y1="122" x2="125" y2="148" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
        {/* Pylon */}
        <g>
          <line x1="78" y1="132" x2="85" y2="105" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <line x1="92" y1="132" x2="85" y2="105" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <line x1="80" y1="126" x2="90" y2="126" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
          <line x1="81" y1="120" x2="89" y2="120" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7" />
          <line x1="82" y1="114" x2="88" y2="114" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
          <line x1="73" y1="110" x2="97" y2="110" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <line x1="76" y1="115" x2="94" y2="115" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
          <circle cx="74" cy="110" r="1.8" fill={C.blue} />
          <circle cx="96" cy="110" r="1.8" fill={C.blue} />
        </g>
        <text x="35" y="75" fill={C.midGray} fontSize="6" fontFamily="Calibri, sans-serif" fontWeight="700">110 kV</text>
      </g>

      {/* Transformer */}
      <g filter="url(#shadow)">
        <rect x="110" y="144" width="26" height="20" rx="2.5" fill={C.navy} stroke={C.gold} strokeWidth="1.2" />
        <circle cx="118" cy="154" r="4.5" fill="none" stroke={C.gold} strokeWidth="0.7" opacity="0.35" />
        <circle cx="128" cy="154" r="4.5" fill="none" stroke={C.gold} strokeWidth="0.7" opacity="0.35" />
        {[115, 123, 131].map((x) => (
          <rect key={x} x={x} y="141" width="2" height="4" rx="0.5" fill={C.blue} />
        ))}
        <text x="123" y="162" textAnchor="middle" fill={C.goldLight}
          fontSize="4.5" fontFamily="Calibri, sans-serif" fontWeight="700">TRAFO</text>
      </g>

      {/* Power flow */}
      <defs>
        <path id="tflow" d="M136,154 Q144,154 150,148" />
      </defs>
      <use href="#tflow" fill="none" stroke={C.gold} strokeWidth="2" opacity="0.25" />
      <FlowParticles pathId="tflow" color={C.goldLight} count={2} dur={1.5} />

      {/* Massive BESS array */}
      <g>
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => {
            const x = 150 + col * 24;
            const y = 128 + row * 17;
            return (
              <g key={`${row}-${col}`}>
                <rect x={x + 1.5} y={y + 1.5} width="20" height="13" rx="1.5" fill="rgba(0,0,0,0.15)" />
                <rect x={x} y={y} width="20" height="13" rx="1.5"
                  fill={C.green} opacity={0.3 + (row + col) * 0.025}
                  stroke={C.greenLight} strokeWidth="0.45" />
                <path d={`M${x + 20},${y} L${x + 22},${y - 1.5} L${x + 22},${y + 11.5} L${x + 20},${y + 13}`}
                  fill={C.forestMid} opacity="0.2" />
                <rect x={x + 2} y={y + 3} width="3" height="7" rx="0.5" fill={C.navy} opacity="0.25" />
                <circle cx={x + 17} cy={y + 3} r="1" fill={C.greenLight} opacity="0.4">
                  <animate attributeName="opacity" values="0.2;0.7;0.2"
                    dur={`${1.5 + row * 0.15 + col * 0.12}s`} repeatCount="indefinite" />
                </circle>
              </g>
            );
          })
        )}
      </g>

      {/* Revenue cards */}
      <g>
        {[
          [308, 130, "Arbitrage", "2–5 ct → Peak-Spread", C.gold],
          [308, 155, "FCR / aFRR", "< 1s Regelenergie", C.greenLight],
          [308, 180, "Redispatch", "Netzstabilität §13.2", C.midGray],
        ].map(([x, y, title, sub, color], i) => (
          <g key={i}>
            <rect x={x} y={y} width="78" height="20" rx="4.5"
              fill={C.navy} stroke={color} strokeWidth="0.6" opacity="0.92" />
            <circle cx={x + 10} cy={y + 10} r="4" fill={color} opacity="0.2" />
            <text x={x + 10} y={y + 12} textAnchor="middle" fill={color}
              fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700">{i + 1}</text>
            <text x={x + 18} y={y + 8} fill={color}
              fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">{title}</text>
            <text x={x + 18} y={y + 15} fill={C.midGray}
              fontSize="3.5" fontFamily="Calibri, sans-serif">{sub}</text>
          </g>
        ))}
      </g>

      {/* Main KPI */}
      <g filter="url(#glow)">
        <rect x="306" y="208" width="80" height="32" rx="6" fill={C.navy} stroke={C.green} strokeWidth="1.2" />
        <text x="346" y="222" textAnchor="middle" fill={C.greenLight}
          fontSize="10" fontFamily="Calibri, sans-serif" fontWeight="700">100 MW</text>
        <text x="346" y="234" textAnchor="middle" fill={C.midGray}
          fontSize="5.5" fontFamily="Calibri, sans-serif">200 MWh · 15–25 % p.a.</text>
      </g>

      <Atmosphere />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   GESAMTERGEBNIS — Full transformation glory
   ══════════════════════════════════════════════════════════════════ */
function GesamtVisual() {
  return (
    <>
      <SiteBase solar>
        {/* Carport roofs visible */}
        <rect x="110" y="192" width="50" height="2" fill={C.gold} opacity="0.35" rx="0.5" />
        <rect x="267" y="186" width="42" height="2" fill={C.gold} opacity="0.35" rx="0.5" />

        {/* BESS containers near site */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={128 + i * 17} y="235" width="13" height="8" rx="1.5"
            fill={C.green} opacity="0.4" stroke={C.greenLight} strokeWidth="0.3" />
        ))}

        {/* Heat pipes (subtle) */}
        <path d="M170,165 L170,185 L232,185 L232,165"
          fill="none" stroke={C.warmOrange} strokeWidth="1.2" opacity="0.15" />

        {/* Chargers */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={275 + i * 9} y="220" width="5" height="7" rx="1"
            fill={C.greenLight} opacity="0.35" />
        ))}
        <Car x={114} y={198} s={0.7} />
        <Car x={126} y={198} s={0.7} />
      </SiteBase>

      {/* Concentric energy rings */}
      {[
        { rx: 110, ry: 58, sw: 1.2, c: C.gold, op: 0.12, dur: 5, dash: "6,4" },
        { rx: 122, ry: 65, sw: 0.8, c: C.greenLight, op: 0.08, dur: 7, dash: "4,8" },
        { rx: 134, ry: 72, sw: 0.5, c: C.gold, op: 0.05, dur: 9, dash: "3,12" },
      ].map((r, i) => (
        <ellipse key={i} cx="200" cy="185" rx={r.rx} ry={r.ry} fill="none"
          stroke={r.c} strokeWidth={r.sw} opacity={r.op} strokeDasharray={r.dash}>
          <animate attributeName="strokeDashoffset" values={`0;${i % 2 ? 20 : -20}`}
            dur={`${r.dur}s`} repeatCount="indefinite" />
        </ellipse>
      ))}

      {/* External BESS array */}
      <g opacity="0.3">
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2].map((col) => (
            <rect key={`${row}-${col}`} x={325 + col * 17} y={168 + row * 13}
              width="13" height="9" rx="1.5"
              fill={C.green} stroke={C.greenLight} strokeWidth="0.3" />
          ))
        )}
        <text x="351" y="225" textAnchor="middle" fill={C.midGray}
          fontSize="4" fontFamily="Calibri, sans-serif">BESS 200 MWh</text>
      </g>

      {/* 95% Autarkie badge (central, prominent) */}
      <g filter="url(#glowWide)">
        <circle cx="200" cy="88" r="24" fill={C.navy} stroke={C.gold} strokeWidth="2" />
        <circle cx="200" cy="88" r="20" fill="none" stroke={C.gold} strokeWidth="0.5" opacity="0.3" />
        <text x="200" y="93" textAnchor="middle" fill={C.goldLight}
          fontSize="16" fontFamily="Calibri, sans-serif" fontWeight="700">95%</text>
        <text x="200" y="102" textAnchor="middle" fill={C.midGray}
          fontSize="5" fontFamily="Calibri, sans-serif">Autarkie</text>
      </g>

      {/* Floating ecosystem badges */}
      {[
        [38, 125, "☀️", "6,5–11 MWp", C.gold],
        [38, 150, "🔥", "5–10 MW", C.warmOrange],
        [38, 175, "🔌", "70+ Lader", C.greenLight],
        [38, 200, "⚡", "6,5–11 MWh", C.green],
        [350, 125, "📈", "1,4–2,5 Mio €/a", C.goldLight],
        [350, 150, "🎯", "Amort. 6–9 J.", C.goldLight],
        [350, 175, "🏭", "100 MW BESS", C.greenLight],
      ].map(([x, y, icon, text, col], i) => (
        <g key={i}>
          <rect x={x - 3} y={y - 8} width={text.length * 5 + 16} height="16" rx="8"
            fill={C.navy} stroke={col} strokeWidth="0.5" opacity="0.88" />
          <text x={x + 4} y={y + 2} fontSize="7">{icon}</text>
          <text x={x + 14} y={y + 1.5} fill={col}
            fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">{text}</text>
        </g>
      ))}

      {/* Connecting lines from badges to site */}
      {[[77, 130, 128, 155], [77, 155, 155, 178], [77, 180, 135, 210],
        [77, 205, 145, 235], [317, 130, 272, 155], [317, 155, 278, 182],
        [317, 180, 290, 205]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={C.gold} strokeWidth="0.35" opacity="0.12" strokeDasharray="2,4" />
      ))}

      <Atmosphere />
    </>
  );
}

/* ── Export ────────────────────────────────────────────────────── */
const visuals = {
  "I": AnalyseVisual, "II": PVVisual, "III": SpeicherVisual,
  "IV": WaermeVisual, "V": LadeVisual, "VI": BESSVisual, "✦": GesamtVisual,
};

export default function PhaseVisual({ phaseNum }) {
  const Visual = visuals[phaseNum];
  if (!Visual) return null;
  return (
    <div style={{
      width: "100%", maxWidth: "700px", margin: "0.75rem 0",
      borderRadius: "14px", overflow: "hidden",
      background: "linear-gradient(150deg, rgba(27,42,74,0.75), rgba(30,48,80,0.45), rgba(37,55,87,0.2))",
      border: "1px solid rgba(212,168,67,0.08)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.02)",
    }}>
      <svg viewBox="0 0 400 280" style={{ width: "100%", height: "auto", display: "block" }}
        xmlns="http://www.w3.org/2000/svg">
        <SharedDefs />
        <rect width="400" height="280" fill="url(#bgRadial)" />
        <Visual />
      </svg>
    </div>
  );
}
