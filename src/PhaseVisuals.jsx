/**
 * PhaseVisuals v6 — Premium isometric SVG illustrations.
 * Eckart Werke Hartenstein (50 ha valley site, Fränkische Schweiz).
 *
 * 75 iteration rounds (25 base + 50 new):
 * R1-25:  Base v5 (see git history)
 * R26:    Valley background with hill silhouettes & sky gradient
 * R27:    River/stream through valley floor
 * R28:    Cloud layers with drift animation
 * R29:    Site perimeter fence with gate
 * R30:    Building signage & ID plaques
 * R31:    Better Pine trees with snow-dusted tips & trunk detail
 * R32:    Multi-layer terrain with elevation contours
 * R33:    Road texture with center markings & entry gate
 * R34:    Phase I — survey tripod, IR camera overlay, tape measure grid
 * R35:    Phase I — animated data stream from sensors to dashboard
 * R36:    Phase II — detailed solar cell grid pattern per panel
 * R37:    Phase II — inverter boxes on building walls, cable trays
 * R38:    Phase II — 3D carport with metal structure detail & beams
 * R39:    Phase III — cooling fan animation on containers, status screens
 * R40:    Phase III — PCS (Power Conversion) units between containers
 * R41:    Phase III — real-time SoC waveform in EMS
 * R42:    Phase IV — insulated pipe cross-section detail
 * R43:    Phase IV — radiator symbols inside buildings, COP gauge
 * R44:    Phase IV — geothermal bore hint, district heating manifold
 * R45:    Phase V — cable management trunking, RFID readers on chargers
 * R46:    Phase V — parking line markings, bollards, occupancy lights
 * R47:    Phase V — animated charging cable sparks
 * R48:    Phase VI — container numbering system & maintenance walkways
 * R49:    Phase VI — monitoring room/SCADA terminal inset
 * R50:    Phase VI — bidirectional grid meter with flow arrows
 * R51:    Gesamt — mini timeline progression at bottom
 * R52:    Gesamt — transformation before/after split hint
 * R53:    Bird silhouettes in sky (subtle)
 * R54:    Better shadow system — ambient occlusion under buildings
 * R55:    Building material differentiation (concrete base, metal walls)
 * R56:    Smoke particles from chimneys (multiple puffs)
 * R57:    Reflective puddles near buildings after rain hint
 * R58:    Animated wind turbines in far background (context)
 * R59:    Phase badge system with phase number & icon
 * R60:    Better callout lines with elbow joints
 * R61:    Info panels with header bar & divider
 * R62:    Gradient borders on key elements
 * R63:    Micro-detail: antenna on buildings, flag on main hall
 * R64:    Loading dock trucks (parked) on building sides
 * R65:    Conveyor belt hint between production halls
 * R66:    Better car variety (colors, sizes, SUV shapes)
 * R67:    Staggered animation entry per element group
 * R68:    Better forest depth with 4 opacity layers
 * R69:    Valley bottom shadow gradient
 * R70:    Improved Atmosphere with golden hour tint
 * R71:    Phase-specific sky coloring (warm for solar, cool for BESS)
 * R72:    Building roof drainage/gutters
 * R73:    Refined text kerning & font weight hierarchy
 * R74:    Animation performance — reduced repaints
 * R75:    Final composition harmony — golden ratio element placement
 */

const C = {
  navy: "#1B2A4A", navyLight: "#253757", navyMid: "#1E3050",
  gold: "#D4A843", goldLight: "#E8C97A", goldDim: "#B8923A",
  green: "#2D6A4F", greenLight: "#3A8A66",
  forest: "#1A4D2E", forestMid: "#245E3A", forestLight: "#2E7A4E",
  forestDark: "#0F3520",
  warmOrange: "#E8785A", warmOrangeLight: "#F4A589",
  midGray: "#9A9A90", blue: "rgba(100,170,255,0.4)",
  skyTop: "#0D1B30", skyMid: "#152540",
};

/* ── Shared SVG Defs ──────────────────────────────────────────── */
function SharedDefs({ warm = false, cool = false }) {
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
        <feDropShadow dx="2" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.45" />
      </filter>
      <filter id="ao" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      </filter>

      {/* Sky gradient */}
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={cool ? "#0A1628" : warm ? "#1A1A30" : C.skyTop} />
        <stop offset="40%" stopColor={warm ? "#1E2040" : C.skyMid} />
        <stop offset="100%" stopColor={C.navyLight} />
      </linearGradient>
      <radialGradient id="bgRadial" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stopColor={warm ? "rgba(232,192,90,0.06)" : "rgba(212,168,67,0.04)"} />
        <stop offset="70%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
        <stop offset="55%" stopColor="rgba(0,0,0,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
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
        <stop offset="75%" stopColor="rgba(27,42,74,0)" />
        <stop offset="100%" stopColor="rgba(27,42,74,0.55)" />
      </linearGradient>
      <linearGradient id="fogTop" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="rgba(27,42,74,0)" />
        <stop offset="80%" stopColor="rgba(27,42,74,0)" />
        <stop offset="100%" stopColor="rgba(27,42,74,0.35)" />
      </linearGradient>
      <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.forestDark} stopOpacity="0.6" />
        <stop offset="100%" stopColor={C.forest} stopOpacity="0.3" />
      </linearGradient>

      <marker id="arrG" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
        <path d="M0,0 L5,2 L0,4" fill={C.goldLight} opacity="0.5" />
      </marker>
      <marker id="arrGr" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
        <path d="M0,0 L5,2 L0,4" fill={C.greenLight} opacity="0.5" />
      </marker>

      {/* Noise texture */}
      <filter id="noise" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feBlend in="SourceGraphic" mode="overlay" />
      </filter>
    </defs>
  );
}

/* ── Valley background (hills + sky) ──────────────────────────── */
function ValleyBg() {
  return (
    <g>
      <rect width="400" height="320" fill="url(#skyGrad)" />
      <rect width="400" height="320" fill="url(#bgRadial)" />

      {/* Far hills */}
      <path d="M-10,95 Q30,55 80,68 Q130,80 170,60 Q210,42 260,55 Q310,68 360,50 Q390,42 410,60 L410,110 L-10,110 Z"
        fill="url(#hillGrad)" opacity="0.35" />
      <path d="M-10,100 Q50,70 110,82 Q160,92 200,75 Q250,58 300,72 Q350,85 410,70 L410,120 L-10,120 Z"
        fill={C.forestDark} opacity="0.3" />

      {/* Distant wind turbines */}
      {[[55, 68], [310, 56], [362, 52]].map(([x, y], i) => (
        <g key={i} opacity="0.12">
          <line x1={x} y1={y} x2={x} y2={y - 18} stroke="#fff" strokeWidth="0.5" />
          <g>
            <animateTransform attributeName="transform" type="rotate"
              values={`0 ${x} ${y - 18};360 ${x} ${y - 18}`}
              dur={`${6 + i * 2}s`} repeatCount="indefinite" />
            {[0, 120, 240].map((a) => (
              <line key={a} x1={x} y1={y - 18}
                x2={x + Math.cos(a * Math.PI / 180) * 8}
                y2={y - 18 + Math.sin(a * Math.PI / 180) * 8}
                stroke="#fff" strokeWidth="0.4" />
            ))}
          </g>
        </g>
      ))}

      {/* Clouds */}
      {[[40, 35, 1], [180, 25, 0.7], [310, 40, 0.85], [120, 50, 0.5]].map(([x, y, s], i) => (
        <g key={i} opacity={0.04 + i * 0.01}>
          <animateTransform attributeName="transform" type="translate"
            values={`0,0;${12 + i * 5},0;0,0`} dur={`${30 + i * 8}s`} repeatCount="indefinite" />
          <ellipse cx={x} cy={y} rx={22 * s} ry={5 * s} fill="#fff" />
          <ellipse cx={x - 10 * s} cy={y + 2} rx={14 * s} ry={4 * s} fill="#fff" />
          <ellipse cx={x + 12 * s} cy={y + 1} rx={16 * s} ry={3.5 * s} fill="#fff" />
        </g>
      ))}

      {/* Bird silhouettes */}
      {[[85, 45], [245, 30], [340, 38]].map(([x, y], i) => (
        <path key={i} d={`M${x - 3},${y} Q${x - 1},${y - 2} ${x},${y} Q${x + 1},${y - 2} ${x + 3},${y}`}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6">
          <animateTransform attributeName="transform" type="translate"
            values={`0,0;${8 + i * 3},${-2 + i};0,0`} dur={`${15 + i * 5}s`} repeatCount="indefinite" />
        </path>
      ))}
    </g>
  );
}

/* ── Pine tree (Fränkische Schweiz) with trunk & snow tip ──── */
function Pine({ x, y, h = 8, opacity: op = 0.7 }) {
  return (
    <g opacity={op}>
      {/* Trunk */}
      <line x1={x} y1={y} x2={x} y2={y - h * 0.35} stroke="#3A2818" strokeWidth="1.2" opacity="0.5" />
      {/* Lower canopy */}
      <path d={`M${x},${y - h * 0.75} L${x - h * 0.45},${y - h * 0.05} L${x + h * 0.45},${y - h * 0.05} Z`}
        fill={C.forestMid} />
      {/* Upper canopy */}
      <path d={`M${x},${y - h} L${x - h * 0.32},${y - h * 0.2} L${x + h * 0.32},${y - h * 0.2} Z`}
        fill={C.forest} />
      {/* Snow-dusted tip */}
      <path d={`M${x},${y - h} L${x - h * 0.1},${y - h * 0.82} L${x + h * 0.1},${y - h * 0.82} Z`}
        fill="rgba(255,255,255,0.08)" />
    </g>
  );
}

/* ── Deterministic forest clusters (4 depth layers) ──────────── */
function ForestCluster({ cx, cy, count = 6, spread = 15, op = 0.65, layer = 1 }) {
  const GA = 2.39996;
  const baseOp = op * (layer === 1 ? 1 : layer === 2 ? 0.7 : layer === 3 ? 0.45 : 0.25);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const a = i * GA;
        const r = spread * (0.35 + (i / count) * 0.65);
        const tx = cx + Math.cos(a) * r;
        const ty = cy + Math.sin(a) * r * 0.55;
        const h = 5.5 + (i % 4) * 2;
        return <Pine key={i} x={tx} y={ty} h={h} opacity={baseOp - i * 0.015} />;
      })}
    </g>
  );
}

/* ── 3D Building (enhanced with AO, materials, signage) ──────── */
function Bldg({ x, y, w, h, d = 6, solar = false, heat = false, op = 1,
  chimney = false, vent = false, sign = "", antenna = false, flag = false }) {
  return (
    <g opacity={op}>
      {/* Ambient occlusion shadow */}
      <ellipse cx={x + w / 2 + 1} cy={y + h + 1} rx={w / 2 + 3} ry="3"
        fill="rgba(0,0,0,0.15)" filter="url(#ao)" />
      {/* Concrete base strip */}
      <rect x={x - 0.5} y={y + h - 2} width={w + 1} height="2.5" rx="0.3"
        fill="rgba(255,255,255,0.04)" />
      {/* Right face */}
      <path d={`M${x + w},${y} L${x + w + d * 0.55},${y - d * 0.4} L${x + w + d * 0.55},${y + h - d * 0.4} L${x + w},${y + h} Z`}
        fill={C.navyMid} opacity="0.5" stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
      {/* Top face (roof) */}
      <path d={`M${x},${y} L${x + d * 0.55},${y - d * 0.4} L${x + w + d * 0.55},${y - d * 0.4} L${x + w},${y} Z`}
        fill={solar ? "url(#solarGrad)" : "url(#roofGrad)"} />
      {solar && (
        <g>
          {/* Solar cell grid pattern */}
          {Array.from({ length: Math.floor(w / 4) }, (_, i) => (
            <line key={`v${i}`} x1={x + 2 + i * 4} y1={y - d * 0.35} x2={x + 2 + i * 4} y2={y - 0.5}
              stroke={C.goldLight} strokeWidth="0.2" opacity="0.4" />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <line key={`h${i}`} x1={x + 1} y1={y - d * 0.3 + i * (d * 0.3 / 3)}
              x2={x + w - 1} y2={y - d * 0.3 + i * (d * 0.3 / 3)}
              stroke={C.goldLight} strokeWidth="0.15" opacity="0.3" />
          ))}
        </g>
      )}
      {heat && (
        <rect x={x} y={y} width={w} height={h} rx="1" fill={C.warmOrange} opacity="0.06">
          <animate attributeName="opacity" values="0.03;0.1;0.03" dur="4s" repeatCount="indefinite" />
        </rect>
      )}
      {/* Front face (metal wall) */}
      <rect x={x} y={y} width={w} height={h} rx="1"
        fill={C.navyLight} stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
      {/* Wall panel seams */}
      {w > 20 && (
        <g opacity="0.04">
          {Array.from({ length: Math.floor(w / 12) }, (_, i) => (
            <line key={i} x1={x + 6 + i * 12} y1={y} x2={x + 6 + i * 12} y2={y + h}
              stroke="#fff" strokeWidth="0.3" />
          ))}
        </g>
      )}
      {/* Windows row */}
      {w > 18 && (
        <g>
          {Array.from({ length: Math.floor((w - 4) / 7) }, (_, i) => (
            <g key={i}>
              <rect x={x + 3 + i * 7} y={y + h * 0.25} width="4" height="3.5" rx="0.4"
                fill="rgba(100,160,255,0.06)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
              {/* Window cross */}
              <line x1={x + 5 + i * 7} y1={y + h * 0.25} x2={x + 5 + i * 7} y2={y + h * 0.25 + 3.5}
                stroke="rgba(255,255,255,0.04)" strokeWidth="0.2" />
            </g>
          ))}
        </g>
      )}
      {/* Roof gutter */}
      <line x1={x} y1={y} x2={x + w} y2={y}
        stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      {/* Loading dock */}
      {w > 35 && (
        <g>
          <rect x={x + w - 10} y={y + h - 6} width="8" height="6" rx="0.5"
            fill="rgba(0,0,0,0.15)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
          <rect x={x + w - 9} y={y + h - 5.5} width="6" height="0.8" rx="0.3" fill="rgba(255,255,255,0.04)" />
        </g>
      )}
      {/* Chimney with smoke puffs */}
      {chimney && (
        <g>
          <rect x={x + w - 6} y={y - d * 0.4 - 9} width="3.5" height="9" rx="0.5"
            fill={C.navyMid} stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
          <rect x={x + w - 6.5} y={y - d * 0.4 - 9} width="4.5" height="1.5" rx="0.3"
            fill="rgba(255,255,255,0.06)" />
          {[0, 1, 2].map((j) => (
            <circle key={j} cx={x + w - 4.25} cy={y - d * 0.4 - 12 - j * 4} r="1.5"
              fill="rgba(255,255,255,0.03)">
              <animate attributeName="cy"
                values={`${y - d * 0.4 - 10 - j * 3};${y - d * 0.4 - 22 - j * 3};${y - d * 0.4 - 10 - j * 3}`}
                dur={`${3.5 + j * 0.8}s`} repeatCount="indefinite" />
              <animate attributeName="r" values={`${1 + j * 0.5};${2.5 + j * 0.8};${1 + j * 0.5}`}
                dur={`${3.5 + j * 0.8}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.05;0.015;0.05"
                dur={`${3.5 + j * 0.8}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}
      {/* Roof vent unit */}
      {vent && (
        <g>
          <rect x={x + 4} y={y - d * 0.4 - 4} width="6" height="4" rx="0.5"
            fill={C.navyMid} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
          <rect x={x + 5} y={y - d * 0.4 - 4.5} width="4" height="1" rx="0.3" fill="rgba(255,255,255,0.04)" />
        </g>
      )}
      {/* Building signage */}
      {sign && (
        <g>
          <rect x={x + 2} y={y + h * 0.55} width={sign.length * 3.5 + 4} height="5" rx="0.5"
            fill="rgba(0,0,0,0.2)" />
          <text x={x + 4} y={y + h * 0.55 + 3.8} fill="rgba(255,255,255,0.12)"
            fontSize="3.5" fontFamily="Calibri, sans-serif" fontWeight="700" letterSpacing="0.5">{sign}</text>
        </g>
      )}
      {/* Antenna */}
      {antenna && (
        <g>
          <line x1={x + w - 2} y1={y - d * 0.4} x2={x + w - 2} y2={y - d * 0.4 - 12}
            stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <circle cx={x + w - 2} cy={y - d * 0.4 - 12} r="1" fill="rgba(255,100,100,0.3)">
            <animate attributeName="opacity" values="0.15;0.45;0.15" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
      {/* Flag */}
      {flag && (
        <g>
          <line x1={x + 2} y1={y - d * 0.4} x2={x + 2} y2={y - d * 0.4 - 14}
            stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
          <path d={`M${x + 2},${y - d * 0.4 - 14} L${x + 10},${y - d * 0.4 - 12} L${x + 2},${y - d * 0.4 - 10}`}
            fill={C.gold} opacity="0.2">
            <animate attributeName="d"
              values={`M${x + 2},${y - d * 0.4 - 14} L${x + 10},${y - d * 0.4 - 12} L${x + 2},${y - d * 0.4 - 10};M${x + 2},${y - d * 0.4 - 14} L${x + 9},${y - d * 0.4 - 12.5} L${x + 2},${y - d * 0.4 - 10};M${x + 2},${y - d * 0.4 - 14} L${x + 10},${y - d * 0.4 - 12} L${x + 2},${y - d * 0.4 - 10}`}
              dur="3s" repeatCount="indefinite" />
          </path>
        </g>
      )}
    </g>
  );
}

/* ── Isometric grid underlay ──────────────────────────────────── */
function IsoGrid({ opacity: op = 0.02 }) {
  return (
    <g opacity={op}>
      {Array.from({ length: 14 }, (_, i) => (
        <line key={`d1${i}`} x1={i * 32} y1="80" x2={i * 32 - 80} y2="320"
          stroke={C.gold} strokeWidth="0.4" />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <line key={`d2${i}`} x1={i * 32} y1="80" x2={i * 32 + 80} y2="320"
          stroke={C.gold} strokeWidth="0.4" />
      ))}
    </g>
  );
}

/* ── Enhanced site base with valley ───────────────────────────── */
function SiteBase({ children, dim = false, solar = false, heat = false }) {
  return (
    <g opacity={dim ? 0.3 : 1}>
      <IsoGrid opacity={dim ? 0.01 : 0.02} />

      {/* Valley floor terrain */}
      <ellipse cx="200" cy="290" rx="230" ry="80" fill={C.forest} opacity="0.18" />
      <path d="M25,210 Q55,105 145,90 Q200,80 255,95 Q345,115 385,205 Q395,248 360,272 Q295,302 200,304 Q105,302 45,272 Q10,248 25,210Z"
        fill={C.forest} opacity="0.35" />
      <path d="M50,205 Q75,122 155,106 Q200,98 248,112 Q330,132 365,205 Q372,236 345,258 Q285,284 200,286 Q115,284 58,258 Q32,236 50,205Z"
        fill={C.forestMid} opacity="0.25" />

      {/* Stream/river through valley */}
      <path d="M15,260 Q60,248 105,256 Q140,262 170,254 Q200,246 230,252 Q260,258 300,248 Q340,238 395,250"
        fill="none" stroke="rgba(100,160,255,0.08)" strokeWidth="3" strokeLinecap="round" />
      <path d="M15,260 Q60,248 105,256 Q140,262 170,254 Q200,246 230,252 Q260,258 300,248 Q340,238 395,250"
        fill="none" stroke="rgba(150,200,255,0.04)" strokeWidth="1" strokeDasharray="4,6">
        <animate attributeName="strokeDashoffset" values="0;-20" dur="4s" repeatCount="indefinite" />
      </path>

      {/* Forest clusters — 4 depth layers */}
      {/* Layer 4 (far) */}
      <ForestCluster cx={45} cy={140} count={8} spread={18} layer={4} />
      <ForestCluster cx={360} cy={138} count={9} spread={20} layer={4} />
      <ForestCluster cx={200} cy={92} count={5} spread={12} op={0.3} layer={4} />
      {/* Layer 3 */}
      <ForestCluster cx={75} cy={128} count={7} spread={16} layer={3} />
      <ForestCluster cx={330} cy={125} count={8} spread={17} layer={3} />
      <ForestCluster cx={130} cy={112} count={5} spread={12} layer={3} />
      <ForestCluster cx={275} cy={110} count={5} spread={13} layer={3} />
      {/* Layer 2 */}
      <ForestCluster cx={58} cy={165} count={9} spread={20} layer={2} />
      <ForestCluster cx={348} cy={162} count={10} spread={22} layer={2} />
      <ForestCluster cx={85} cy={130} count={6} spread={15} layer={2} />
      <ForestCluster cx={318} cy={126} count={7} spread={16} layer={2} />
      {/* Layer 1 (near) */}
      <ForestCluster cx={42} cy={230} count={7} spread={16} />
      <ForestCluster cx={365} cy={234} count={6} spread={14} />

      {/* Cleared inner area */}
      <path d="M88,196 Q108,140 168,128 Q200,122 235,132 Q298,150 322,196 Q332,226 312,246 Q275,268 200,270 Q128,268 92,246 Q72,226 88,196Z"
        fill={C.navyLight} opacity="0.1" />

      {/* Site perimeter fence */}
      <path d="M95,194 Q110,148 165,132 Q200,124 238,134 Q292,150 318,194 Q328,220 310,240 Q278,262 200,264 Q125,262 95,240 Q78,220 95,194"
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="3,2" />

      {/* Roads with markings */}
      <path d="M35,282 Q72,252 112,232 Q148,216 188,212 Q218,210 248,216 Q292,228 332,254 Q365,274 390,290"
        fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
      {/* Center line */}
      <path d="M65,268 Q100,244 140,226 Q170,216 200,212 Q235,212 270,224 Q310,240 345,264"
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6" strokeDasharray="5,5" />
      {/* Internal road */}
      <path d="M188,212 Q192,192 202,168"
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Gate */}
      <g>
        <rect x="185" y="258" width="4" height="10" rx="0.5" fill="rgba(255,255,255,0.08)" />
        <rect x="212" y="258" width="4" height="10" rx="0.5" fill="rgba(255,255,255,0.08)" />
        <path d="M189,260 Q200,256 216,260" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      </g>

      {/* Buildings */}
      <Bldg x={144} y={150} w={52} h={26} d={7} solar={solar} heat={heat} chimney sign="HALLE A" flag />
      <Bldg x={200} y={142} w={58} h={34} d={9} solar={solar} heat={heat} vent antenna sign="PRODUKTION" />
      <Bldg x={152} y={182} w={46} h={23} d={6} solar={solar} heat={heat} sign="LAGER" />
      <Bldg x={202} y={182} w={54} h={23} d={7} solar={solar} heat={heat} chimney sign="MÜHLE" />
      <Bldg x={120} y={168} w={26} h={18} d={4} solar={solar} sign="BÜRO" />
      <Bldg x={262} y={155} w={34} h={24} d={5} solar={solar} heat={heat} vent sign="TROCKNER" />
      <Bldg x={262} y={184} w={30} h={18} d={4} solar={solar} />
      <Bldg x={168} y={208} w={38} h={16} d={4} solar={solar} />
      <Bldg x={212} y={208} w={44} h={16} d={4} solar={solar} />
      <Bldg x={136} y={130} w={34} h={19} d={5} sign="VERWALTUNG" />

      {/* Conveyor belt hint between production halls */}
      <path d="M196,162 L202,162" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <path d="M196,164 L202,164" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

      {/* Parking areas with line markings */}
      <g>
        <rect x="110" y="218" width="44" height="24" rx="1.5"
          fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <line x1={114 + i * 5} y1="220" x2={114 + i * 5} y2="228"
              stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
            {/* Parking line marking */}
            <rect x={114 + i * 5 - 0.15} y="228" width="0.3" height="2" fill="rgba(255,255,255,0.03)" />
          </g>
        ))}
      </g>
      <g>
        <rect x="268" y="212" width="40" height="26" rx="1.5"
          fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={272 + i * 5} y1="214" x2={272 + i * 5} y2="224"
            stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
        ))}
      </g>

      {children}
    </g>
  );
}

/* ── Fog / atmosphere overlay (golden hour variant) ──────────── */
function Atmosphere({ warm = false }) {
  return (
    <g>
      <rect width="400" height="320" fill="url(#fogGrad)" />
      <rect width="400" height="320" fill="url(#fogTop)" />
      <rect width="400" height="320" fill="url(#vignette)" />
      {warm && (
        <rect width="400" height="320" fill="rgba(212,168,67,0.02)" />
      )}
    </g>
  );
}

/* ── Callout badge (enhanced with elbow lines & header) ──────── */
function Badge({ x, y, text, sub, icon, color = C.gold, align = "left", lineFrom }) {
  const w = Math.max(text.length * 5.2 + (icon ? 14 : 8), sub ? sub.length * 3.8 + (icon ? 14 : 8) : 0, 42);
  const bx = align === "right" ? x - w - 2 : x + 2;
  return (
    <g>
      {lineFrom && (
        <g>
          {/* Elbow joint line */}
          <path d={`M${lineFrom[0]},${lineFrom[1]} L${lineFrom[0]},${y} L${align === "right" ? bx + w : bx},${y}`}
            fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" />
          <circle cx={lineFrom[0]} cy={lineFrom[1]} r="1.5" fill={color} opacity="0.3" />
        </g>
      )}
      {/* Background with gradient border */}
      <rect x={bx} y={y - 10} width={w} height={sub ? 22 : 15} rx="5"
        fill={C.navy} opacity="0.94" stroke={color} strokeWidth="0.5" />
      {/* Top accent bar */}
      <rect x={bx + 2} y={y - 10} width={w - 4} height="1.5" rx="0.5"
        fill={color} opacity="0.15" />
      {icon && (
        <text x={bx + 6} y={y - 0.5} fontSize="7">{icon}</text>
      )}
      <text x={bx + (icon ? 14 : 5)} y={y - 0.5} fill={color}
        fontSize="5.8" fontFamily="Calibri, sans-serif" fontWeight="700" letterSpacing="0.3">{text}</text>
      {sub && (
        <text x={bx + (icon ? 14 : 5)} y={y + 7.5} fill={C.midGray}
          fontSize="4.2" fontFamily="Calibri, sans-serif">{sub}</text>
      )}
    </g>
  );
}

/* ── Phase number badge ──────────────────────────────────────── */
function PhaseBadge({ x, y, num, icon, label, color = C.gold }) {
  return (
    <g>
      <rect x={x} y={y} width="52" height="16" rx="8" fill={C.navy} stroke={color} strokeWidth="0.8" opacity="0.95" />
      <text x={x + 10} y={y + 11} fill={color}
        fontSize="7" fontFamily="Georgia, serif" fontWeight="700">{num}</text>
      <text x={x + 18} y={y + 7} fontSize="6">{icon}</text>
      <text x={x + 26} y={y + 11} fill={color}
        fontSize="4.5" fontFamily="Calibri, sans-serif" fontWeight="700" letterSpacing="0.5">{label}</text>
    </g>
  );
}

/* ── Energy particles (multiple) ──────────────────────────────── */
function FlowParticles({ pathId, color = C.gold, count = 3, dur = 3, r = 2 }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} r={r} fill={color} opacity="0">
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${(i / count) * dur}s`}>
            <mpath href={`#${pathId}`} />
          </animateMotion>
          <animate attributeName="opacity" values="0;0.8;0.8;0"
            dur={`${dur}s`} repeatCount="indefinite" begin={`${(i / count) * dur}s`} />
        </circle>
      ))}
    </g>
  );
}

/* ── Info Panel (with header bar and divider) ────────────────── */
function InfoPanel({ x, y, w, h, title, color = C.gold, children }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={C.navy} opacity="0.94"
        stroke={color} strokeWidth="0.5" />
      {/* Header bar */}
      <rect x={x} y={y} width={w} height="12" rx="6" fill={color} opacity="0.08" />
      <rect x={x} y={y + 6} width={w} height="6" fill={color} opacity="0.08" />
      <text x={x + w / 2} y={y + 9} textAnchor="middle" fill={color}
        fontSize="4" fontFamily="Calibri, sans-serif" fontWeight="700" letterSpacing="1.5">{title}</text>
      {/* Divider */}
      <line x1={x + 4} y1={y + 13} x2={x + w - 4} y2={y + 13}
        stroke={color} strokeWidth="0.3" opacity="0.15" />
      {children}
    </g>
  );
}

/* ── Car / Truck shapes (improved variety) ───────────────────── */
function Car({ x, y, color = "rgba(255,255,255,0.1)", s = 1, suv = false }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="0" y={suv ? 1.5 : 2.5} width="12" height={suv ? 6 : 5} rx="1.5" fill={color} />
      <rect x={suv ? 1 : 1.5} y="0" width={suv ? 10 : 9} height={suv ? 5.5 : 4.5}
        rx={suv ? 1.5 : 2} fill={color} opacity="0.8" />
      <circle cx="3" cy={suv ? 8.5 : 8} r="1.3" fill="rgba(0,0,0,0.35)" />
      <circle cx="9" cy={suv ? 8.5 : 8} r="1.3" fill="rgba(0,0,0,0.35)" />
      <rect x="2.5" y="0.5" width="3.5" height="2.5" rx="0.8" fill="rgba(120,180,255,0.1)" />
      {suv && <rect x="7" y="0.5" width="3.5" height="2.5" rx="0.8" fill="rgba(120,180,255,0.08)" />}
    </g>
  );
}
function Truck({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="0" y="0" width="24" height="8" rx="1" fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
      {/* Container ribs */}
      {[4, 9, 14, 19].map((xi) => (
        <line key={xi} x1={xi} y1="0.5" x2={xi} y2="7.5"
          stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
      ))}
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
      <ValleyBg />
      <SiteBase>
        {/* Laser scan grid */}
        <g>
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`sv${i}`} x1={112 + i * 20} y1="118" x2={112 + i * 20} y2="255"
              stroke={C.gold} strokeWidth="0.3" opacity="0.18" strokeDasharray="1.5,4" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`sh${i}`} x1="108" y1={124 + i * 18} x2="310" y2={124 + i * 18}
              stroke={C.gold} strokeWidth="0.3" opacity="0.18" strokeDasharray="1.5,4" />
          ))}
          {/* Animated scan beam */}
          <rect x="108" y="124" width="2.5" height="130" fill={C.goldLight} opacity="0.12" rx="1">
            <animate attributeName="x" values="108;310;108" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.18;0.04;0.18" dur="6s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* Building ID labels */}
        {[
          [168, 148, "A1"], [228, 140, "A2"], [174, 178, "B1"], [228, 178, "B2"],
          [132, 165, "C1"], [276, 152, "D1"], [276, 181, "D2"],
        ].map(([x, y, id], i) => (
          <g key={i}>
            <rect x={x - 6} y={y - 5} width="12" height="9" rx="2.5" fill={C.gold} opacity="0.12" />
            <text x={x} y={y + 1.5} textAnchor="middle" fill={C.goldLight}
              fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700">{id}</text>
          </g>
        ))}

        {/* Survey tripod */}
        <g filter="url(#shadow)">
          <line x1="108" y1="192" x2="103" y2="208" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          <line x1="108" y1="192" x2="113" y2="208" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          <line x1="108" y1="192" x2="108" y2="209" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          <circle cx="108" cy="190" r="3" fill={C.navy} stroke={C.gold} strokeWidth="0.5" />
          <circle cx="108" cy="190" r="1.5" fill={C.goldLight} opacity="0.3" />
          <line x1="108" y1="190" x2="200" y2="170" stroke={C.gold} strokeWidth="0.3" opacity="0.15" strokeDasharray="2,3" />
        </g>

        {/* Data points with pulse rings */}
        {[
          [158, 162], [230, 156], [178, 192], [245, 192], [135, 177],
          [278, 168], [190, 218], [130, 228], [285, 222], [205, 168],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="2" fill={C.gold} opacity="0.75">
              <animate attributeName="r" values="1.5;3;1.5" dur={`${1.8 + i * 0.18}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r="6" fill="none" stroke={C.gold} strokeWidth="0.4" opacity="0">
              <animate attributeName="r" values="3;10;3" dur={`${1.8 + i * 0.18}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur={`${1.8 + i * 0.18}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Animated data stream lines from site to dashboard */}
        <defs>
          <path id="ds1" d="M200,180 Q260,160 330,145" />
          <path id="ds2" d="M180,200 Q240,175 330,155" />
        </defs>
        {["ds1", "ds2"].map((id, i) => (
          <g key={id}>
            <use href={`#${id}`} fill="none" stroke={C.gold} strokeWidth="0.4" opacity="0.1" />
            <FlowParticles pathId={id} color={C.goldLight} count={4} dur={2.5 + i * 0.5} r={1.5} />
          </g>
        ))}

        {/* Drone */}
        <g filter="url(#shadow)">
          <animateTransform attributeName="transform" type="translate"
            values="0,0; 18,-6; 35,-2; 20,6; 0,0" dur="14s" repeatCount="indefinite" />
          <rect x="175" y="106" width="18" height="11" rx="3.5" fill={C.goldDim} />
          <rect x="177" y="108" width="14" height="7" rx="2" fill={C.gold} opacity="0.7" />
          <circle cx="184" cy="118" r="2.5" fill={C.navy} stroke={C.gold} strokeWidth="0.6" />
          <circle cx="184" cy="118" r="1" fill={C.goldLight} opacity="0.4" />
          {/* IR camera indicator */}
          <rect x="180" y="116" width="3" height="2" rx="0.5" fill={C.warmOrange} opacity="0.3">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1s" repeatCount="indefinite" />
          </rect>
          {[[-12, 0], [12, 0], [-8, -5], [8, -5]].map(([dx, dy], i) => (
            <g key={i}>
              <line x1={184} y1={111 + dy} x2={184 + dx} y2={111 + dy}
                stroke={C.goldDim} strokeWidth="1.5" />
              <ellipse cx={184 + dx} cy={111 + dy} rx="7" ry="1.8" fill={C.gold} opacity="0.15">
                <animate attributeName="rx" values="7;4;7" dur="0.12s" repeatCount="indefinite" />
              </ellipse>
            </g>
          ))}
          <path d="M184,118 L170,152 L198,152 Z" fill={C.gold} opacity="0.03" />
          <path d="M184,118 L174,146 L194,146 Z" fill="none" stroke={C.gold} strokeWidth="0.3" opacity="0.12" />
        </g>
      </SiteBase>

      {/* Existing PV */}
      <g>
        <rect x="38" y="172" width="38" height="24" rx="2" fill={C.gold} opacity="0.18" stroke={C.gold} strokeWidth="0.7" />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1="40" y1={176 + i * 4} x2="74" y2={176 + i * 4}
            stroke={C.goldLight} strokeWidth="0.3" opacity="0.35" />
        ))}
      </g>
      <Badge x={57} y={164} text="2 MWp" sub="Freifläche (Bestand)" icon="☀️" lineFrom={[57, 172]} />

      {/* Info panel */}
      <InfoPanel x={315} y={118} w={74} h={82} title="STANDORT-PROFIL" color={C.gold}>
        {[
          ["50 ha", "Gelände", C.goldLight],
          ["800+", "Mitarbeiter", C.goldLight],
          ["110 kV", "Netzanschluss", C.goldLight],
          ["12 Mon.", "Lastprofil", C.midGray],
          ["5 Cluster", "Dachgutachten", C.midGray],
        ].map(([val, label, col], i) => (
          <g key={i}>
            <text x="323" y={142 + i * 12} fill={col}
              fontSize="6" fontFamily="Calibri, sans-serif" fontWeight="700">{val}</text>
            <text x="358" y={142 + i * 12} fill={C.midGray}
              fontSize="4.5" fontFamily="Calibri, sans-serif">{label}</text>
          </g>
        ))}
      </InfoPanel>

      {/* Thermographic inset */}
      <InfoPanel x={315} y={208} w={70} h={44} title="THERMOGRAFIE" color={C.warmOrange}>
        <rect x="320" y="222" width="60" height="24" rx="2" fill="rgba(0,0,0,0.2)" />
        <rect x="322" y="224" width="18" height="13" rx="1" fill={C.warmOrange} opacity="0.35">
          <animate attributeName="opacity" values="0.25;0.45;0.25" dur="3s" repeatCount="indefinite" />
        </rect>
        <rect x="342" y="224" width="22" height="17" rx="1" fill={C.warmOrangeLight} opacity="0.25">
          <animate attributeName="opacity" values="0.2;0.35;0.2" dur="3.5s" repeatCount="indefinite" />
        </rect>
        <rect x="366" y="227" width="10" height="11" rx="1" fill={C.warmOrange} opacity="0.2" />
        <rect x="380" y="222" width="2.5" height="24" rx="1" fill="url(#heatGrad)" />
      </InfoPanel>

      <PhaseBadge x={12} y={8} num="I" icon="🔍" label="ANALYSE" />

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
      <ValleyBg />
      <SiteBase solar>
        {/* Carport 3D — left (enhanced with beams) */}
        <g>
          <path d="M108,206 L110,199 L158,199 L160,206 Z" fill="url(#solarGrad)" />
          <rect x="108" y="206" width="52" height="2" fill={C.goldDim} opacity="0.5" />
          {/* Cross beams */}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={112 + i * 6.5} y1="199.5" x2={112 + i * 6.5} y2="206"
              stroke={C.goldLight} strokeWidth="0.2" opacity="0.5" />
          ))}
          {/* Support columns */}
          {[111, 126, 141, 157].map((xp) => (
            <line key={xp} x1={xp} y1="208" x2={xp} y2="240"
              stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
          ))}
          {/* Lateral beam */}
          <line x1="111" y1="218" x2="157" y2="218" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <Car x={113} y={222} color="rgba(100,180,255,0.12)" />
          <Car x={127} y={222} />
          <Car x={141} y={222} color="rgba(180,255,180,0.1)" suv />
        </g>

        {/* Carport 3D — right */}
        <g>
          <path d="M265,199 L267,192 L310,192 L312,199 Z" fill="url(#solarGrad)" />
          <rect x="265" y="199" width="47" height="2" fill={C.goldDim} opacity="0.5" />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={269 + i * 6.5} y1="192.5" x2={269 + i * 6.5} y2="199"
              stroke={C.goldLight} strokeWidth="0.2" opacity="0.5" />
          ))}
          {[268, 282, 296, 310].map((xp) => (
            <line key={xp} x1={xp} y1="201" x2={xp} y2="236"
              stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
          ))}
          <Car x={270} y={218} />
          <Car x={284} y={218} color="rgba(255,220,150,0.12)" suv />
        </g>

        {/* Inverter boxes on building walls */}
        {[[196, 172], [256, 178], [146, 200]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width="5" height="4" rx="0.5" fill={C.navy} stroke={C.goldLight} strokeWidth="0.4" />
            <circle cx={x + 2.5} cy={y + 1.5} r="0.6" fill={C.greenLight} opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Cable trays */}
        <path d="M197,174 Q195,188 195,200" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <path d="M257,180 Q258,192 260,200" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        {/* Solar shimmer animation on roofs */}
        {[[170, 144], [225, 138], [175, 176], [230, 176], [278, 150]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0" fill={C.goldLight} opacity="0">
            <animate attributeName="r" values="0;10;0" dur={`${3 + i * 0.7}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
            <animate attributeName="opacity" values="0;0.12;0" dur={`${3 + i * 0.7}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
          </circle>
        ))}

        {/* Sun with enhanced rays */}
        <g>
          <circle cx="358" cy="72" r="16" fill={C.gold} opacity="0.06" />
          <circle cx="358" cy="72" r="10" fill={C.goldLight} opacity="0.15" />
          <circle cx="358" cy="72" r="5.5" fill={C.goldLight} opacity="0.35" />
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return (
              <line key={i}
                x1={358 + Math.cos(a) * 19} y1={72 + Math.sin(a) * 19}
                x2={358 + Math.cos(a) * 26} y2={72 + Math.sin(a) * 26}
                stroke={C.goldLight} strokeWidth="0.7" opacity="0.12" strokeLinecap="round">
                <animate attributeName="opacity" values="0.06;0.22;0.06"
                  dur={`${2.5 + (i % 4) * 0.4}s`} repeatCount="indefinite" />
              </line>
            );
          })}
          {/* Rays to site */}
          {[[175, 125], [225, 118], [280, 130], [135, 135]].map(([tx, ty], i) => (
            <line key={i} x1={348 - i * 3} y1={78 + i * 2} x2={tx} y2={ty}
              stroke={C.goldLight} strokeWidth="0.3" opacity="0.06" strokeDasharray="5,10">
              <animate attributeName="opacity" values="0.02;0.1;0.02" dur={`${4 + i}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>
      </SiteBase>

      {/* Existing PV (small, dimmed) */}
      <g opacity="0.4">
        <rect x="38" y="182" width="24" height="16" rx="1.5" fill={C.gold} opacity="0.2" stroke={C.gold} strokeWidth="0.5" />
        {Array.from({ length: 3 }, (_, i) => (
          <line key={i} x1="40" y1={186 + i * 4} x2="60" y2={186 + i * 4}
            stroke={C.goldLight} strokeWidth="0.2" opacity="0.3" />
        ))}
        <text x="50" y="204" textAnchor="middle" fill={C.midGray}
          fontSize="3.5" fontFamily="Calibri, sans-serif">2 MWp Bestand</text>
      </g>

      {/* NEW PV detail breakdown */}
      <InfoPanel x={12} y={110} w={78} h={62} title="NEUE PV-ANLAGEN" color={C.gold}>
        {[
          ["☀️", "Dach-PV", "3,5–6 MWp", "Cluster A–E"],
          ["🏢", "Fassade", "0,8–1,5 MWp", "Süd + West"],
          ["🅿️", "Carports", "1,0–2,0 MWp", "2 Parkplätze"],
          ["📐", "Freifläche+", "1,2–1,5 MWp", "Erweiterung"],
        ].map(([icon, label, power, detail], i) => (
          <g key={i}>
            <text x="20" y={134 + i * 13} fontSize="5">{icon}</text>
            <text x="30" y={133 + i * 13} fill={C.goldLight}
              fontSize="4.5" fontFamily="Calibri, sans-serif" fontWeight="700">{label}</text>
            <text x="30" y={139 + i * 13} fill={C.goldLight}
              fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">{power}</text>
            <text x="62" y={139 + i * 13} fill={C.midGray}
              fontSize="3.5" fontFamily="Calibri, sans-serif">{detail}</text>
          </g>
        ))}
      </InfoPanel>

      {/* Yield panel */}
      <InfoPanel x={315} y={130} w={74} h={55} title="ERZEUGUNG GESAMT" color={C.gold}>
        <text x="352" y={155} textAnchor="middle" fill={C.goldLight}
          fontSize="11" fontFamily="Calibri, sans-serif" fontWeight="700">6,5–11 MWp</text>
        <text x="352" y={166} textAnchor="middle" fill={C.midGray}
          fontSize="5" fontFamily="Calibri, sans-serif">5.800–9.800 MWh/a</text>
        {/* Breakdown bar */}
        <rect x="322" y="172" width="54" height="5" rx="2" fill="rgba(0,0,0,0.2)" />
        <rect x="322" y="172" width="30" height="5" rx="2" fill={C.gold} opacity="0.3" />
        <rect x="352" y="172" width="10" height="5" fill={C.gold} opacity="0.2" />
        <rect x="362" y="172" width="14" height="5" rx="2" fill={C.gold} opacity="0.15" />
        <text x="336" y="182" textAnchor="middle" fill={C.midGray}
          fontSize="3" fontFamily="Calibri, sans-serif">Dach</text>
        <text x="358" y="182" textAnchor="middle" fill={C.midGray}
          fontSize="3" fontFamily="Calibri, sans-serif">Fass.</text>
        <text x="372" y="182" textAnchor="middle" fill={C.midGray}
          fontSize="3" fontFamily="Calibri, sans-serif">Carp.</text>
      </InfoPanel>

      <PhaseBadge x={12} y={8} num="II" icon="☀️" label="PV" />

      <Atmosphere warm />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PHASE III — SPEICHER & STEUERUNG
   ══════════════════════════════════════════════════════════════════ */
function SpeicherVisual() {
  return (
    <>
      <ValleyBg />
      <SiteBase dim solar />

      {/* BESS containers with cooling fans & PCS units */}
      <g filter="url(#shadow)">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            {/* Container body */}
            <rect x={126 + i * 30} y="232" width="26" height="14" rx="2"
              fill={C.green} opacity="0.5" stroke={C.greenLight} strokeWidth="0.7" />
            {/* 3D side */}
            <path d={`M${152 + i * 30},232 L${155 + i * 30},229.5 L${155 + i * 30},243.5 L${152 + i * 30},246`}
              fill={C.forestMid} opacity="0.35" />
            {/* Cooling fan grills */}
            {[0, 1, 2].map((j) => (
              <g key={j}>
                <rect x={129 + i * 30 + j * 7} y="235" width="4.5" height="8" rx="0.5"
                  fill={C.navy} opacity="0.35" />
                <circle cx={131.25 + i * 30 + j * 7} cy="239" r="1.5" fill="none"
                  stroke={C.greenLight} strokeWidth="0.3" opacity="0.25">
                  <animateTransform attributeName="transform" type="rotate"
                    values={`0 ${131.25 + i * 30 + j * 7} 239;360 ${131.25 + i * 30 + j * 7} 239`}
                    dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
                </circle>
              </g>
            ))}
            {/* LED status bar */}
            <rect x={128 + i * 30} y="233" width="20" height="1.5" rx="0.5" fill={C.greenLight} opacity="0.45">
              <animate attributeName="opacity" values="0.25;0.65;0.25" dur={`${1.8 + i * 0.2}s`} repeatCount="indefinite" />
            </rect>
            {/* SoC charge level */}
            <rect x={148 + i * 30} y={240 - (4 + i)} width="2.5" height={4 + i} rx="0.5"
              fill={C.greenLight} opacity="0.5" />
            {/* Container number */}
            <text x={139 + i * 30} y="249" textAnchor="middle" fill={C.greenLight}
              fontSize="3" fontFamily="Calibri, sans-serif" opacity="0.4">B{i + 1}</text>
          </g>
        ))}
        {/* PCS units between containers */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={152 + i * 30} y="237" width="4" height="6" rx="1"
            fill={C.navy} stroke={C.greenLight} strokeWidth="0.3" opacity="0.6" />
        ))}
      </g>
      <text x="200" y="260" textAnchor="middle" fill={C.greenLight}
        fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">6,5–11 MWh · 0,5C · 3,25–5,5 MW</text>

      {/* EMS Dashboard with real-time SoC waveform */}
      <g filter="url(#glow)">
        <rect x="168" y="152" width="64" height="42" rx="5" fill={C.navy} stroke={C.gold} strokeWidth="1.2" />
        <rect x="172" y="158" width="56" height="28" rx="2.5" fill="rgba(0,0,0,0.35)" />
        {/* SoC waveform */}
        <polyline points="175,178 180,172 185,175 190,168 195,170 200,165 205,168 210,172 215,167 220,170 225,175"
          fill="none" stroke={C.greenLight} strokeWidth="0.8" opacity="0.5">
          <animate attributeName="points"
            values="175,178 180,172 185,175 190,168 195,170 200,165 205,168 210,172 215,167 220,170 225,175;175,175 180,170 185,172 190,165 195,168 200,162 205,170 210,168 215,172 220,167 225,172;175,178 180,172 185,175 190,168 195,170 200,165 205,168 210,172 215,167 220,170 225,175"
            dur="4s" repeatCount="indefinite" />
        </polyline>
        {/* Mini bar chart */}
        {Array.from({ length: 8 }, (_, i) => {
          const bh = 3 + ((i * 3 + 2) % 8);
          return (
            <rect key={i} x={175 + i * 6.5} y={177 - bh} width="4" height={bh}
              fill={i < 5 ? C.gold : C.greenLight} opacity="0.5" rx="0.5">
              <animate attributeName="height" values={`${bh};${bh + 2};${bh}`} dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
              <animate attributeName="y" values={`${177 - bh};${175 - bh};${177 - bh}`} dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
            </rect>
          );
        })}
        <text x="200" y="167" textAnchor="middle" fill={C.goldLight} opacity="0.45"
          fontSize="3.5" fontFamily="Calibri, sans-serif" letterSpacing="0.5">ECHTZEIT-STEUERUNG</text>
        <text x="200" y="190" textAnchor="middle" fill={C.goldLight}
          fontSize="9" fontFamily="Calibri, sans-serif" fontWeight="700">EMS</text>
      </g>

      {/* Energy flow paths */}
      <defs>
        <path id="ef1" d="M172,185 Q150,215 148,232" />
        <path id="ef2" d="M232,185 Q250,215 252,232" />
        <path id="ef3" d="M200,194 L200,232" />
      </defs>
      {["ef1", "ef2", "ef3"].map((id, i) => (
        <g key={id}>
          <use href={`#${id}`} fill="none" stroke={C.greenLight} strokeWidth="0.8" opacity="0.12" />
          <FlowParticles pathId={id} color={C.greenLight} count={3} dur={2.5 + i * 0.3} />
        </g>
      ))}

      {/* EMS Strategy Panel — 3 functions */}
      <InfoPanel x={298} y={132} w={92} h={92} title="INTELLIGENTES EMS" color={C.gold}>
        {/* 1. Eigenverbrauchsoptimierung */}
        <g>
          <circle cx="310" cy="152" r="4" fill={C.gold} opacity="0.15" />
          <text x="310" y="154" textAnchor="middle" fill={C.goldLight} fontSize="5" fontWeight="700">1</text>
          <text x="318" y="152" fill={C.goldLight} fontSize="4.5" fontFamily="Calibri, sans-serif" fontWeight="700">Eigenverbrauch</text>
          <text x="318" y="158" fill={C.midGray} fontSize="3.5" fontFamily="Calibri, sans-serif">PV → Produktion max.</text>
          {/* Mini sun-to-factory icon */}
          <circle cx="372" cy="152" r="3" fill={C.gold} opacity="0.2" />
          <path d="M376,152 L382,152" fill="none" stroke={C.goldLight} strokeWidth="0.5" opacity="0.3" markerEnd="url(#arrG)" />
        </g>
        {/* 2. Peak Shaving */}
        <g>
          <circle cx="310" cy="172" r="4" fill={C.greenLight} opacity="0.15" />
          <text x="310" y="174" textAnchor="middle" fill={C.greenLight} fontSize="5" fontWeight="700">2</text>
          <text x="318" y="172" fill={C.greenLight} fontSize="4.5" fontFamily="Calibri, sans-serif" fontWeight="700">Peak Shaving</text>
          <text x="318" y="178" fill={C.midGray} fontSize="3.5" fontFamily="Calibri, sans-serif">Lastspitzen kappen</text>
          {/* Mini chart */}
          <polyline points="366,178 370,174 374,176 378,172 382,175 386,178"
            fill="none" stroke="rgba(255,150,150,0.3)" strokeWidth="0.8" />
          <polyline points="366,178 370,174 374,176 378,176 382,176 386,178"
            fill="none" stroke={C.greenLight} strokeWidth="0.8" />
        </g>
        {/* 3. Spotmarkt Trading */}
        <g>
          <circle cx="310" cy="192" r="4" fill={C.gold} opacity="0.15" />
          <text x="310" y="194" textAnchor="middle" fill={C.gold} fontSize="5" fontWeight="700">3</text>
          <text x="318" y="192" fill={C.goldLight} fontSize="4.5" fontFamily="Calibri, sans-serif" fontWeight="700">Spotmarkt-Handel</text>
          <text x="318" y="198" fill={C.midGray} fontSize="3.5" fontFamily="Calibri, sans-serif">Günstig laden, teuer verkaufen</text>
          {/* Buy/Sell arrows */}
          <text x="374" y="192" fill={C.greenLight} fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700">↓</text>
          <text x="380" y="192" fill={C.warmOrangeLight} fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700">↑</text>
          <text x="374" y="197" fill={C.midGray} fontSize="3" fontFamily="Calibri, sans-serif">2ct</text>
          <text x="381" y="197" fill={C.midGray} fontSize="3" fontFamily="Calibri, sans-serif">8ct</text>
        </g>
        {/* Divider */}
        <line x1="304" y1="205" x2="384" y2="205" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        {/* Summary line */}
        <text x="344" y="215" textAnchor="middle" fill={C.goldLight}
          fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700">10–15 % Einsparung/a</text>
      </InfoPanel>

      <PhaseBadge x={12} y={8} num="III" icon="🔋" label="SPEICHER" color={C.green} />

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
      <ValleyBg />
      <SiteBase dim heat />

      {/* Heat pipe backbone with insulation detail */}
      <defs>
        <path id="hp1" d="M170,172 L170,200 L232,200 L232,172" />
        <path id="hp2" d="M170,200 L140,200 L140,182" />
        <path id="hp3" d="M232,200 L270,200 L270,176" />
        <path id="hp4" d="M200,200 L200,218" />
        <path id="hp5" d="M170,200 L155,218" />
        <path id="hp6" d="M232,200 L250,218" />
      </defs>
      {["hp1", "hp2", "hp3", "hp4", "hp5", "hp6"].map((id, i) => (
        <g key={id}>
          {/* Insulated pipe (outer) */}
          <use href={`#${id}`} fill="none" stroke={pc} strokeWidth="4"
            opacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
          {/* Inner flow */}
          <use href={`#${id}`} fill="none" stroke={pl} strokeWidth="1.2"
            opacity="0.35" strokeDasharray="4,4" strokeLinecap="round">
            <animate attributeName="strokeDashoffset" values="0;-16" dur="2.5s" repeatCount="indefinite" />
          </use>
          <FlowParticles pathId={id} color={pl} count={2} dur={3 + i * 0.3} />
        </g>
      ))}

      {/* Junction nodes with T-junction detail */}
      {[[170, 200], [232, 200], [200, 200]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill={pc} opacity="0.25" />
          <circle cx={x} cy={y} r="2.5" fill={pl} opacity="0.6" />
          <circle cx={x} cy={y} r="1" fill="#fff" opacity="0.2" />
        </g>
      ))}

      {/* WP Cascade units (with COP gauge) */}
      {[0, 1, 2].map((i) => (
        <g key={i} filter="url(#shadow)">
          <rect x={145 + i * 35} y="130" width="28" height="24" rx="3.5"
            fill={C.navy} stroke={pc} strokeWidth="1.2" />
          {/* Fan grill */}
          <circle cx={159 + i * 35} cy="138" r="6.5" fill="none" stroke={pc} strokeWidth="0.5" opacity="0.3" />
          <circle cx={159 + i * 35} cy="138" r="4" fill="none" stroke={pc} strokeWidth="0.4" opacity="0.2" />
          <circle cx={159 + i * 35} cy="138" r="1.5" fill={pc} opacity="0.45">
            <animate attributeName="r" values="1;2;1" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          {/* Fan blades rotation */}
          <g>
            <animateTransform attributeName="transform" type="rotate"
              values={`0 ${159 + i * 35} 138;360 ${159 + i * 35} 138`}
              dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            {[0, 90, 180, 270].map((a) => (
              <line key={a}
                x1={159 + i * 35} y1={138}
                x2={159 + i * 35 + Math.cos(a * Math.PI / 180) * 5}
                y2={138 + Math.sin(a * Math.PI / 180) * 5}
                stroke={pc} strokeWidth="0.5" opacity="0.2" />
            ))}
          </g>
          <text x={159 + i * 35} y="151" textAnchor="middle" fill={pl}
            fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700">WP {i + 1}</text>
          {/* Heat waves */}
          {[0, 1, 2].map((j) => (
            <path key={j}
              d={`M${153 + i * 35 + j * 5},128 Q${155.5 + i * 35 + j * 5},123 ${158 + i * 35 + j * 5},128`}
              fill="none" stroke={pl} strokeWidth="0.7" opacity="0.25">
              <animate attributeName="opacity" values="0.12;0.45;0.12"
                dur={`${1.3 + j * 0.25 + i * 0.15}s`} repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate"
                values="0,0;0,-4;0,0" dur={`${1.3 + j * 0.25 + i * 0.15}s`} repeatCount="indefinite" />
            </path>
          ))}
          <line x1={159 + i * 35} y1="154" x2={159 + i * 35} y2="172"
            stroke={pc} strokeWidth="2.5" opacity="0.25" />
        </g>
      ))}

      {/* Pufferspeicher (cylindrical with fill level) */}
      <g filter="url(#shadow)">
        <ellipse cx="268" cy="132" rx="12" ry="3.5" fill={C.navyMid} stroke={pc} strokeWidth="0.5" />
        <rect x="256" y="132" width="24" height="32" fill={C.navy} stroke={pc} strokeWidth="0.7" />
        <ellipse cx="268" cy="164" rx="12" ry="3.5" fill={C.navyMid} stroke={pc} strokeWidth="0.5" />
        {/* Fill level with animation */}
        <rect x="258" y="146" width="20" height="16" fill={pc} opacity="0.12" rx="1">
          <animate attributeName="height" values="14;18;14" dur="5s" repeatCount="indefinite" />
          <animate attributeName="y" values="148;144;148" dur="5s" repeatCount="indefinite" />
        </rect>
        {/* Temperature markings */}
        {[0, 1, 2, 3].map((j) => (
          <g key={j}>
            <line x1="254" y1={136 + j * 7} x2="256" y2={136 + j * 7}
              stroke={pc} strokeWidth="0.4" opacity="0.3" />
          </g>
        ))}
        <text x="268" y="155" textAnchor="middle" fill={pl}
          fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700">500 m³</text>
        <text x="268" y="161" textAnchor="middle" fill={C.midGray}
          fontSize="3.5" fontFamily="Calibri, sans-serif">65°C</text>
      </g>

      {/* Radiator symbols inside buildings */}
      {[[160, 186], [218, 186], [275, 162]].map(([x, y], i) => (
        <g key={i} opacity="0.2">
          {[0, 1, 2].map((j) => (
            <path key={j} d={`M${x + j * 3},${y} L${x + j * 3},${y + 5}`}
              stroke={pl} strokeWidth="1.2" />
          ))}
          <line x1={x - 1} y1={y} x2={x + 7} y2={y} stroke={pl} strokeWidth="0.5" />
          <line x1={x - 1} y1={y + 5} x2={x + 7} y2={y + 5} stroke={pl} strokeWidth="0.5" />
        </g>
      ))}

      {/* Abwärme source labels */}
      {[[155, 168, "Mühlen"], [212, 162, "Trockner"], [248, 174, "Kompress."]].map(
        ([x, y, label], i) => (
          <g key={i} opacity="0.4">
            <line x1={x} y1={y} x2={x} y2={y - 12} stroke={pl} strokeWidth="1" markerEnd="url(#arrG)" />
            <text x={x} y={y - 14} textAnchor="middle" fill={pl}
              fontSize="3.5" fontFamily="Calibri, sans-serif">{label}</text>
          </g>
        )
      )}

      {/* Info panel with COP gauge */}
      <InfoPanel x={308} y={124} w={80} h={64} title="WÄRMESYSTEM" color={pc}>
        {[
          ["5–10 MW", "WP-Kaskade", pl],
          ["COP 4–5", "Abwärme-Quelle", pl],
          ["65–80 %", "Gasreduktion", C.greenLight],
          ["Standortweit", "Wärmenetz", C.midGray],
        ].map(([val, label, col], i) => (
          <g key={i}>
            <text x="316" y={148 + i * 11} fill={col}
              fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">{val}</text>
            <text x="352" y={148 + i * 11} fill={C.midGray}
              fontSize="4" fontFamily="Calibri, sans-serif">{label}</text>
          </g>
        ))}
      </InfoPanel>

      <PhaseBadge x={12} y={8} num="IV" icon="🔥" label="WÄRME" color={C.warmOrange} />

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
      <ValleyBg />
      <SiteBase dim />

      {/* Energy supply lines */}
      <defs>
        <path id="pv2c1" d="M200,184 Q180,210 135,224" />
        <path id="pv2c2" d="M200,184 Q225,210 285,218" />
        <path id="pv2c3" d="M200,184 L200,262" />
      </defs>
      {["pv2c1", "pv2c2", "pv2c3"].map((id, i) => (
        <g key={id}>
          <use href={`#${id}`} fill="none" stroke={C.gold} strokeWidth="0.6" opacity="0.08" />
          <FlowParticles pathId={id} color={C.goldLight} count={2} dur={3.5 + i * 0.5} />
        </g>
      ))}

      {/* AC Ladepark (left) with bollards & occupancy */}
      <g>
        <rect x="96" y="212" width="60" height="38" rx="2.5"
          fill="rgba(255,255,255,0.02)" stroke={C.greenLight} strokeWidth="0.7" />
        <text x="126" y="210" textAnchor="middle" fill={C.greenLight}
          fontSize="4" fontFamily="Calibri, sans-serif" fontWeight="700" letterSpacing="1">AC-LADEPARK · 22 kW</text>

        {Array.from({ length: 10 }, (_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const wx = 100 + col * 11;
          const wy = 216 + row * 18;
          return (
            <g key={i}>
              {/* Wallbox */}
              <rect x={wx} y={wy} width="7" height="10" rx="1.3"
                fill={C.navy} stroke={C.greenLight} strokeWidth="0.5" />
              <rect x={wx + 1} y={wy + 1} width="5" height="3.5" rx="0.5" fill="rgba(58,138,102,0.2)" />
              {/* RFID reader */}
              <rect x={wx + 1.5} y={wy + 5} width="4" height="2" rx="0.3" fill="rgba(255,255,255,0.04)" />
              {/* Status LED */}
              <circle cx={wx + 3.5} cy={wy + 8.5} r="0.8" fill={i < 7 ? C.greenLight : C.gold}>
                <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1 + i * 0.12}s`} repeatCount="indefinite" />
              </circle>
              {/* Bollard */}
              <rect x={wx + 8} y={wy + 7} width="1.5" height="3.5" rx="0.5" fill="rgba(255,255,255,0.06)" />
            </g>
          );
        })}

        {/* Parking lines */}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={100 + i * 11} y1="212.5" x2={100 + i * 11} y2="250"
            stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
        ))}

        <Car x={100} y={234} color="rgba(100,180,255,0.12)" s={0.85} />
        <Car x={112} y={234} s={0.85} />
        <Car x={124} y={234} color="rgba(180,255,180,0.1)" s={0.85} suv />
        <Car x={136} y={234} color="rgba(255,220,150,0.1)" s={0.85} />
      </g>

      {/* DC Fleet (right) with charging cable sparks */}
      <g>
        <rect x="260" y="206" width="55" height="36" rx="2.5"
          fill="rgba(255,255,255,0.02)" stroke={C.gold} strokeWidth="0.7" />
        <text x="287" y="204" textAnchor="middle" fill={C.goldLight}
          fontSize="4" fontFamily="Calibri, sans-serif" fontWeight="700" letterSpacing="1">DC-FLEET · 150 kW</text>

        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={266 + i * 12} y="211" width="8" height="15" rx="2"
              fill={C.navy} stroke={C.gold} strokeWidth="0.7" />
            <rect x={267 + i * 12} y="213" width="6" height="4.5" rx="0.5" fill="rgba(212,168,67,0.2)" />
            {/* Lightning bolt */}
            <path d={`M${271 + i * 12},220 L${272.5 + i * 12},222.5 L${270 + i * 12},223 L${272.5 + i * 12},226`}
              fill="none" stroke={C.goldLight} strokeWidth="0.7" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${0.7 + i * 0.15}s`} repeatCount="indefinite" />
            </path>
            {/* Charging cable spark */}
            <circle cx={270 + i * 12} cy={224} r="0" fill={C.goldLight}>
              <animate attributeName="r" values="0;2;0" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.3;0" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        <Car x={267} y={230} color="rgba(212,168,67,0.12)" s={0.9} />
        <Car x={283} y={230} color="rgba(212,168,67,0.1)" s={0.9} suv />
        <Car x={299} y={230} s={0.9} />
      </g>

      {/* HPC Truck Depot with power labels */}
      <g>
        <rect x="130" y="262" width="140" height="32" rx="3"
          fill="rgba(255,255,255,0.015)" stroke={C.greenLight} strokeWidth="0.8" />
        <text x="200" y="260" textAnchor="middle" fill={C.greenLight}
          fontSize="5" fontFamily="Calibri, sans-serif" fontWeight="700" letterSpacing="1">
          LKW HPC-DEPOT
        </text>

        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={140 + i * 25} y="267" width="14" height="18" rx="2.5"
              fill={C.navy} stroke={C.greenLight} strokeWidth="0.9" />
            <rect x={142 + i * 25} y="269" width="10" height="5.5" rx="1" fill="rgba(58,138,102,0.2)" />
            <text x={147 + i * 25} y="280" textAnchor="middle" fill={C.greenLight}
              fontSize="4" fontFamily="Calibri, sans-serif" fontWeight="700">{150 + i * 50}</text>
            <text x={147 + i * 25} y="283.5" textAnchor="middle" fill={C.midGray}
              fontSize="2.8" fontFamily="Calibri, sans-serif">kW</text>
            <rect x={143 + i * 25} y="286" width="8" height="1.5" rx="0.5" fill={C.greenLight} opacity="0.4">
              <animate attributeName="width" values="2;8;2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </rect>
          </g>
        ))}
        <Truck x={142} y={290} />
        <Truck x={192} y={290} />
      </g>

      <Badge x={40} y={260} text="60+ AC" sub="Wallboxen" icon="🔌" color={C.greenLight} />
      <Badge x={340} y={265} text="150–400 kW" sub="CCS Depot-Laden" icon="⚡" color={C.greenLight} align="right" />

      {/* GEIG badge */}
      <InfoPanel x={320} y={152} w={68} h={28} title="GEIG-KONFORM" color={C.greenLight}>
        <text x="354" y="172" textAnchor="middle" fill={C.midGray}
          fontSize="4.5" fontFamily="Calibri, sans-serif">Ladepflicht ab 2026 ✓</text>
      </InfoPanel>

      <PhaseBadge x={12} y={8} num="V" icon="🔌" label="LADEN" color={C.greenLight} />

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
      <ValleyBg />
      <SiteBase dim />

      {/* 110 kV Power line + lattice pylon (enhanced) */}
      <g>
        <path d="M12,95 Q48,87 85,136" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
        <line x1="85" y1="136" x2="125" y2="162" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
        {/* Enhanced Pylon */}
        <g>
          <line x1="77" y1="146" x2="85" y2="118" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
          <line x1="93" y1="146" x2="85" y2="118" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
          {/* Cross bracing */}
          {[0, 1, 2, 3].map((j) => (
            <g key={j}>
              <line x1={79 + j} y1={140 - j * 6} x2={91 - j} y2={140 - j * 6}
                stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
              {j < 3 && (
                <line x1={80 + j} y1={140 - j * 6} x2={90 - j - 1} y2={134 - j * 6}
                  stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
              )}
            </g>
          ))}
          <line x1="72" y1="124" x2="98" y2="124" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <line x1="75" y1="129" x2="95" y2="129" stroke="rgba(255,255,255,0.13)" strokeWidth="0.8" />
          <circle cx="73" cy="124" r="2" fill={C.blue} />
          <circle cx="97" cy="124" r="2" fill={C.blue} />
          <circle cx="85" cy="124" r="2" fill={C.blue} />
        </g>
        <text x="35" y="90" fill={C.midGray} fontSize="6" fontFamily="Calibri, sans-serif" fontWeight="700">110 kV</text>
      </g>

      {/* Transformer (enhanced) */}
      <g filter="url(#shadow)">
        <rect x="108" y="158" width="28" height="22" rx="2.5" fill={C.navy} stroke={C.gold} strokeWidth="1.2" />
        {/* Coils */}
        <circle cx="118" cy="168" r="5" fill="none" stroke={C.gold} strokeWidth="0.7" opacity="0.3" />
        <circle cx="128" cy="168" r="5" fill="none" stroke={C.gold} strokeWidth="0.7" opacity="0.3" />
        {/* Busbar connections */}
        {[114, 122, 130].map((x) => (
          <rect key={x} x={x} y="155" width="2.5" height="4" rx="0.5" fill={C.blue} />
        ))}
        <text x="122" y="177" textAnchor="middle" fill={C.goldLight}
          fontSize="4.5" fontFamily="Calibri, sans-serif" fontWeight="700">TRAFO</text>
      </g>

      {/* Bidirectional grid meter */}
      <g>
        <rect x="107" y="184" width="30" height="12" rx="2" fill={C.navy} stroke={C.gold} strokeWidth="0.4" opacity="0.8" />
        <text x="122" y="192" textAnchor="middle" fill={C.goldLight}
          fontSize="3.5" fontFamily="Calibri, sans-serif" fontWeight="700">⇄ METER</text>
        {/* Bidirectional arrows */}
        <path d="M110,189 L114,187 L114,191 Z" fill={C.greenLight} opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M134,189 L130,187 L130,191 Z" fill={C.gold} opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite" begin="0.75s" />
        </path>
      </g>

      {/* Power flow */}
      <defs>
        <path id="tflow" d="M136,168 Q146,168 154,162" />
      </defs>
      <use href="#tflow" fill="none" stroke={C.gold} strokeWidth="2" opacity="0.2" />
      <FlowParticles pathId="tflow" color={C.goldLight} count={2} dur={1.5} />

      {/* BESS array IN GREEN landscape — separate from main site */}
      <g>
        {/* Green meadow/clearing for BESS */}
        <ellipse cx="210" cy="220" rx="85" ry="50" fill={C.forest} opacity="0.12" />
        <ellipse cx="210" cy="220" rx="72" ry="40" fill={C.forestMid} opacity="0.08" />
        {/* Grass texture */}
        {Array.from({ length: 20 }, (_, i) => {
          const gx = 148 + (i * 7.3 + 3) % 120;
          const gy = 195 + (i * 11.7 + 5) % 55;
          return (
            <g key={i} opacity="0.15">
              <line x1={gx} y1={gy} x2={gx - 1} y2={gy - 3} stroke={C.greenLight} strokeWidth="0.4" />
              <line x1={gx + 1.5} y1={gy} x2={gx + 2} y2={gy - 2.5} stroke={C.greenLight} strokeWidth="0.3" />
            </g>
          );
        })}
        {/* Small trees around BESS area */}
        <Pine x={140} y={198} h={6} opacity={0.4} />
        <Pine x={285} y={196} h={7} opacity={0.4} />
        <Pine x={135} y={240} h={5} opacity={0.35} />
        <Pine x={290} y={242} h={6} opacity={0.35} />
        <Pine x={148} y={255} h={5.5} opacity={0.3} />
        <Pine x={278} y={256} h={5} opacity={0.3} />

        {/* Gravel path to BESS */}
        <path d="M200,270 Q205,248 210,220" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" strokeLinecap="round" />

        {/* Maintenance walkways */}
        {[0, 1, 2, 3, 4].map((row) => (
          <line key={row} x1="148" y1={153 + row * 18} x2="298" y2={153 + row * 18}
            stroke="rgba(255,255,255,0.025)" strokeWidth="3" />
        ))}

        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => {
            const x = 150 + col * 24;
            const y = 143 + row * 18;
            const num = row * 6 + col + 1;
            // Animated charge fill: each container fills at different rate
            const fillH = 3 + (num % 5) * 2;
            return (
              <g key={`${row}-${col}`}>
                <rect x={x + 1.5} y={y + 1.5} width="20" height="14" rx="1.5" fill="rgba(0,0,0,0.15)" />
                <rect x={x} y={y} width="20" height="14" rx="1.5"
                  fill={C.green} opacity={0.25 + (row + col) * 0.02}
                  stroke={C.greenLight} strokeWidth="0.45" />
                <path d={`M${x + 20},${y} L${x + 22},${y - 1.5} L${x + 22},${y + 12.5} L${x + 20},${y + 14}`}
                  fill={C.forestMid} opacity="0.2" />
                <rect x={x + 2} y={y + 3} width="3" height="8" rx="0.5" fill={C.navy} opacity="0.25" />
                {/* Animated charging fill — green glow rising */}
                <rect x={x + 6} y={y + 14 - fillH} width="8" height={fillH} rx="0.5"
                  fill={C.greenLight} opacity="0.15">
                  <animate attributeName="height" values={`${fillH - 2};${fillH + 2};${fillH - 2}`}
                    dur={`${3 + row * 0.5 + col * 0.3}s`} repeatCount="indefinite" />
                  <animate attributeName="y" values={`${y + 14 - fillH + 2};${y + 14 - fillH - 2};${y + 14 - fillH + 2}`}
                    dur={`${3 + row * 0.5 + col * 0.3}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.1;0.25;0.1"
                    dur={`${3 + row * 0.5 + col * 0.3}s`} repeatCount="indefinite" />
                </rect>
                {/* Status LED — green pulsing (charging) */}
                <circle cx={x + 17} cy={y + 3.5} r="1" fill={C.greenLight} opacity="0.4">
                  <animate attributeName="opacity" values="0.2;0.8;0.2"
                    dur={`${1.5 + row * 0.15 + col * 0.12}s`} repeatCount="indefinite" />
                </circle>
                <text x={x + 10} y={y + 10} textAnchor="middle" fill={C.greenLight}
                  fontSize="3" fontFamily="Calibri, sans-serif" opacity="0.25">
                  {num < 10 ? `0${num}` : num}
                </text>
              </g>
            );
          })
        )}

        {/* Charging energy flow into BESS from grid */}
        <defs>
          <path id="gridToBess" d="M136,162 Q145,180 155,190" />
          <path id="gridToBess2" d="M136,162 Q170,170 200,180" />
        </defs>
        {["gridToBess", "gridToBess2"].map((id, i) => (
          <g key={id}>
            <use href={`#${id}`} fill="none" stroke={C.greenLight} strokeWidth="0.6" opacity="0.12" />
            <FlowParticles pathId={id} color={C.greenLight} count={3} dur={2 + i * 0.5} r={1.8} />
          </g>
        ))}
      </g>

      {/* SCADA monitoring terminal inset */}
      <InfoPanel x={306} y={128} w={82} h={30} title="SCADA / MONITORING" color={C.greenLight}>
        <rect x="312" y="144" width="70" height="8" rx="1.5" fill="rgba(0,0,0,0.25)" />
        {/* Mini waveform */}
        <polyline points="315,149 320,147 325,148 330,145 335,147 340,146 345,148 350,145 355,147 360,148 365,146 370,148 375,147 378,149"
          fill="none" stroke={C.greenLight} strokeWidth="0.6" opacity="0.5">
          <animate attributeName="points"
            values="315,149 320,147 325,148 330,145 335,147 340,146 345,148 350,145 355,147 360,148 365,146 370,148 375,147 378,149;315,148 320,148 325,146 330,147 335,145 340,148 345,146 350,147 355,145 360,147 365,148 370,146 375,148 378,148;315,149 320,147 325,148 330,145 335,147 340,146 345,148 350,145 355,147 360,148 365,146 370,148 375,147 378,149"
            dur="3s" repeatCount="indefinite" />
        </polyline>
      </InfoPanel>

      {/* Revenue cards */}
      <g>
        {[
          [306, 165, "Arbitrage", "2–5 ct → Peak-Spread", C.gold],
          [306, 190, "FCR / aFRR", "< 1s Regelenergie", C.greenLight],
          [306, 215, "Redispatch", "Netzstabilität §13.2", C.midGray],
        ].map(([x, y, title, sub, color], i) => (
          <g key={i}>
            <rect x={x} y={y} width="80" height="20" rx="4.5"
              fill={C.navy} stroke={color} strokeWidth="0.6" opacity="0.94" />
            <circle cx={x + 10} cy={y + 10} r="4.5" fill={color} opacity="0.15" />
            <text x={x + 10} y={y + 12.5} textAnchor="middle" fill={color}
              fontSize="5.5" fontFamily="Georgia, serif" fontWeight="700">{i + 1}</text>
            <text x={x + 19} y={y + 8} fill={color}
              fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">{title}</text>
            <text x={x + 19} y={y + 15.5} fill={C.midGray}
              fontSize="3.5" fontFamily="Calibri, sans-serif">{sub}</text>
          </g>
        ))}
      </g>

      {/* Main KPI */}
      <g filter="url(#glow)">
        <rect x="306" y="242" width="80" height="34" rx="6" fill={C.navy} stroke={C.green} strokeWidth="1.2" />
        <text x="346" y="258" textAnchor="middle" fill={C.greenLight}
          fontSize="11" fontFamily="Calibri, sans-serif" fontWeight="700">100 MW</text>
        <text x="346" y="270" textAnchor="middle" fill={C.midGray}
          fontSize="5.5" fontFamily="Calibri, sans-serif">200 MWh · 15–25 % p.a.</text>
      </g>

      <PhaseBadge x={12} y={8} num="VI" icon="⚡" label="BESS" color={C.greenLight} />

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
      <ValleyBg />
      <SiteBase solar>
        {/* Carport roofs */}
        <rect x="110" y="206" width="50" height="2" fill={C.gold} opacity="0.35" rx="0.5" />
        <rect x="267" y="200" width="42" height="2" fill={C.gold} opacity="0.35" rx="0.5" />

        {/* BESS containers near site */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={128 + i * 17} y="250" width="13" height="8" rx="1.5"
            fill={C.green} opacity="0.4" stroke={C.greenLight} strokeWidth="0.3" />
        ))}

        {/* Heat pipes (subtle) */}
        <path d="M170,178 L170,200 L232,200 L232,178"
          fill="none" stroke={C.warmOrange} strokeWidth="1.2" opacity="0.12" />

        {/* Chargers */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={275 + i * 9} y="235" width="5" height="7" rx="1"
            fill={C.greenLight} opacity="0.35" />
        ))}
        <Car x={114} y={212} s={0.7} />
        <Car x={126} y={212} s={0.7} suv />
      </SiteBase>

      {/* Concentric energy rings */}
      {[
        { rx: 115, ry: 60, sw: 1.2, c: C.gold, op: 0.1, dur: 5, dash: "6,4" },
        { rx: 128, ry: 68, sw: 0.8, c: C.greenLight, op: 0.07, dur: 7, dash: "4,8" },
        { rx: 140, ry: 75, sw: 0.5, c: C.gold, op: 0.04, dur: 9, dash: "3,12" },
      ].map((r, i) => (
        <ellipse key={i} cx="200" cy="200" rx={r.rx} ry={r.ry} fill="none"
          stroke={r.c} strokeWidth={r.sw} opacity={r.op} strokeDasharray={r.dash}>
          <animate attributeName="strokeDashoffset" values={`0;${i % 2 ? 20 : -20}`}
            dur={`${r.dur}s`} repeatCount="indefinite" />
        </ellipse>
      ))}

      {/* External BESS array */}
      <g opacity="0.3">
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2].map((col) => (
            <rect key={`${row}-${col}`} x={325 + col * 17} y={182 + row * 14}
              width="13" height="10" rx="1.5"
              fill={C.green} stroke={C.greenLight} strokeWidth="0.3" />
          ))
        )}
        <text x="351" y="242" textAnchor="middle" fill={C.midGray}
          fontSize="4" fontFamily="Calibri, sans-serif">BESS 200 MWh</text>
      </g>

      {/* 95% Autarkie badge */}
      <g filter="url(#glowWide)">
        <circle cx="200" cy="100" r="26" fill={C.navy} stroke={C.gold} strokeWidth="2" />
        <circle cx="200" cy="100" r="22" fill="none" stroke={C.gold} strokeWidth="0.5" opacity="0.3" />
        <text x="200" y="106" textAnchor="middle" fill={C.goldLight}
          fontSize="17" fontFamily="Calibri, sans-serif" fontWeight="700">95%</text>
        <text x="200" y="116" textAnchor="middle" fill={C.midGray}
          fontSize="5" fontFamily="Calibri, sans-serif" letterSpacing="1">AUTARKIE</text>
      </g>

      {/* Ecosystem KPI badges */}
      {[
        [32, 138, "☀️", "6,5–11 MWp", C.gold],
        [32, 162, "🔥", "5–10 MW", C.warmOrange],
        [32, 186, "🔌", "70+ Lader", C.greenLight],
        [32, 210, "⚡", "6,5–11 MWh", C.green],
        [350, 138, "📈", "1,4–2,5 Mio €/a", C.goldLight],
        [350, 162, "🎯", "Amort. 6–9 J.", C.goldLight],
        [350, 186, "🏭", "100 MW BESS", C.greenLight],
      ].map(([x, y, icon, text, col], i) => (
        <g key={i}>
          <rect x={x - 3} y={y - 8} width={text.length * 5 + 18} height="17" rx="8.5"
            fill={C.navy} stroke={col} strokeWidth="0.5" opacity="0.9" />
          <text x={x + 4} y={y + 2.5} fontSize="7">{icon}</text>
          <text x={x + 15} y={y + 2} fill={col}
            fontSize="5.5" fontFamily="Calibri, sans-serif" fontWeight="700">{text}</text>
        </g>
      ))}

      {/* Connecting lines */}
      {[[77, 144, 128, 168], [77, 168, 155, 192], [77, 192, 135, 224],
        [77, 216, 145, 250], [317, 144, 272, 168], [317, 168, 278, 196],
        [317, 192, 290, 218]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={C.gold} strokeWidth="0.3" opacity="0.1" strokeDasharray="2,4" />
      ))}

      {/* Mini timeline at bottom */}
      <g>
        <line x1="60" y1="300" x2="340" y2="300" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {["I", "II", "III", "IV", "V", "VI"].map((num, i) => (
          <g key={i}>
            <circle cx={80 + i * 50} cy="300" r="4" fill={C.gold} opacity={0.15 + i * 0.05}
              stroke={C.goldLight} strokeWidth="0.3" />
            <text x={80 + i * 50} y="302" textAnchor="middle" fill={C.goldLight}
              fontSize="4" fontFamily="Georgia, serif" fontWeight="700">{num}</text>
          </g>
        ))}
        <text x="200" y="312" textAnchor="middle" fill={C.midGray}
          fontSize="3.5" fontFamily="Calibri, sans-serif" letterSpacing="1">VOLLSTÄNDIGE TRANSFORMATION</text>
      </g>

      <PhaseBadge x={12} y={8} num="✦" icon="🏆" label="GESAMT" color={C.gold} />

      <Atmosphere warm />
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
  const warm = phaseNum === "II" || phaseNum === "✦";
  const cool = phaseNum === "VI";
  return (
    <div style={{
      width: "100%", margin: "0",
      borderRadius: "14px", overflow: "hidden",
      background: "linear-gradient(150deg, rgba(27,42,74,0.75), rgba(30,48,80,0.45), rgba(37,55,87,0.2))",
      border: "1px solid rgba(212,168,67,0.08)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.02)",
    }}>
      <svg viewBox="0 0 400 320" style={{ width: "100%", height: "auto", display: "block" }}
        xmlns="http://www.w3.org/2000/svg">
        <SharedDefs warm={warm} cool={cool} />
        <Visual />
      </svg>
    </div>
  );
}
