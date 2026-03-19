/**
 * Premium line-art SVG icon system for PitchPilot.
 * Clean stroke-based design · viewBox 0 0 24 24 · strokeWidth 1.5
 * Colors: inherit from parent via currentColor
 */

/* ── Icon path definitions (viewBox 0 0 24 24) ── */
const defs = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </>
  ),
  battery: (
    <>
      <rect x="2" y="7" width="18" height="10" rx="2" />
      <path d="M22 11v2" strokeWidth="2" strokeLinecap="round" />
      <rect x="5" y="10" width="6" height="4" rx="0.5" fill="currentColor" stroke="none" />
    </>
  ),
  fire: (
    <path d="M12 2c.5 3.5-1.5 6-1.5 6 1.5.5 3-1 3.5-2.5C15.5 9 16 12 14 14c3-1 4.5-3.5 4.5-6.5 0-2-1-4.5-3-5.5 0 2-1.5 3-3 3C12 3.5 12 2 12 2ZM10 16c-.5 1.5.5 3 2 3s2.5-1.5 2-3c-.5-1-1-1.5-2-2-1 .5-1.5 1-2 2Z" />
  ),
  plug: (
    <>
      <path d="M12 22v-4M7 12V8M17 12V8" />
      <rect x="5" y="12" width="14" height="4" rx="2" />
      <path d="M7 8V5M17 8V5" strokeLinecap="round" />
    </>
  ),
  bolt: (
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  ),
  factory: (
    <>
      <path d="M2 20V8l5 4V8l5 4V8l5 4V4h5v16H2Z" />
      <rect x="19" y="7" width="2" height="4" rx="0.5" fill="currentColor" stroke="none" opacity="0.4" />
    </>
  ),
  satellite: (
    <>
      <path d="M4 15 1 18M7 12 4 15" />
      <circle cx="5.5" cy="16.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M4 15c0 0 1-6 7-6s6 7 6 7" />
      <path d="M1 18c0 0 1.5-10 11-10s10 10 10 10" />
    </>
  ),
  chart: (
    <>
      <rect x="3" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="6" width="4" height="14" rx="1" />
      <rect x="17" y="2" width="4" height="18" rx="1" />
    </>
  ),
  microscope: (
    <>
      <path d="M6 18h12M14 4l-4 8M10 12a5 5 0 0 0 5 5" />
      <circle cx="14" cy="4" r="2" />
      <path d="M3 18h18" strokeWidth="2" />
    </>
  ),
  chartDown: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 10 4 4 3-3 6 6" />
      <path d="M17 17h3v-3" />
    </>
  ),
  money: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9.5c-.5-1.5-2-2-3.5-2H10c-1.5 0-2.5 1-2.5 2.25S8.5 12 10 12h3c1.5 0 2.5 1 2.5 2.25S14 16.5 12.5 16.5H10c-1.5 0-3-.5-3.5-2" />
      <path d="M12 6v1.5M12 16.5V18" />
    </>
  ),
  leaf: (
    <>
      <path d="M12 22c-4-3-8-7.5-8-13C4 5.5 7.5 2 12 2s8 3.5 8 7c0 5.5-4 10-8 13Z" />
      <path d="M12 22V10M8 14c2-2 4-2 4-2s2 0 4 2" />
    </>
  ),
  bank: (
    <>
      <path d="M3 21h18M12 3 2 9h20L12 3Z" />
      <path d="M5 9v9M9 9v9M15 9v9M19 9v9" strokeLinecap="round" />
      <rect x="2" y="20" width="20" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.3" />
    </>
  ),
  document: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </>
  ),
  cloudSun: (
    <>
      <path d="M17.5 19H9a5 5 0 0 1-.5-10 6 6 0 0 1 11.5 2h1a3.5 3.5 0 0 1 0 7h-3.5" />
      <circle cx="6" cy="8" r="3" />
      <path d="M6 2v1M6 13v1M2 8h1M10 5.5l-.7.7M2.2 5.5l.7.7" />
    </>
  ),
  car: (
    <>
      <path d="M5 17h14V12l-2-5H7L5 12v5Z" />
      <path d="M3 17h2v2H3v-2ZM19 17h2v2h-2v-2Z" />
      <circle cx="7.5" cy="17" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="17" r="1.5" fill="currentColor" stroke="none" />
      <path d="M5 12h14" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      <circle cx="12" cy="12" r="7" strokeDasharray="3 3" opacity="0.3" />
    </>
  ),
  check: (
    <path d="M20 6 9 17l-5-5" strokeWidth="2" />
  ),
  close: (
    <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" />
  ),
  trophy: (
    <>
      <path d="M6 9h12" />
      <path d="M12 15v4M8 19h8" />
      <path d="M6 3h12v6a6 6 0 0 1-12 0V3Z" />
      <path d="M6 5H4a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h1M18 5h2a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-1" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10A15 15 0 0 1 12 2Z" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M9 22V18h6v4" />
      <rect x="7" y="5" width="3" height="2.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.4" />
      <rect x="14" y="5" width="3" height="2.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.4" />
      <rect x="7" y="10" width="3" height="2.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.4" />
      <rect x="14" y="10" width="3" height="2.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.4" />
    </>
  ),
  parking: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M10 16V8h3a3 3 0 0 1 0 6h-3" strokeWidth="2" />
    </>
  ),
  chartUp: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 3 3 6-6" />
      <path d="M17 7h3v3" />
    </>
  ),
  arrowRight: (
    <path d="M5 12h14m-7-7 7 7-7 7" />
  ),
  arrowLeft: (
    <path d="M19 12H5m7 7-7-7 7-7" />
  ),
  circle: (
    <circle cx="12" cy="12" r="8" />
  ),
  reset: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
};

/**
 * Icon component for HTML/React contexts.
 * Usage: <Icon name="sun" size={16} color="#D4A843" />
 */
export function Icon({ name, size = 16, color = "currentColor", style = {}, className = "" }) {
  const d = defs[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      className={className}
    >
      {d}
    </svg>
  );
}

/**
 * SvgIcon for use inside SVG contexts (e.g., PhaseVisuals).
 * Renders icon paths scaled and positioned within a parent <svg>.
 * Usage: <SvgIcon name="sun" x={10} y={10} size={8} color="#D4A843" />
 */
export function SvgIcon({ name, x, y, size = 8, color = "currentColor" }) {
  const d = defs[name];
  if (!d) return null;
  const scale = size / 24;
  return (
    <g
      transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${scale})`}
      fill="none"
      stroke={color}
      strokeWidth={1.5 / scale > 3 ? 3 : 1.5 / scale}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d}
    </g>
  );
}

/**
 * Emoji-to-icon name mapping for easy migration.
 */
export const emojiMap = {
  "🔍": "search",
  "☀️": "sun",
  "🔋": "battery",
  "🔥": "fire",
  "🔌": "plug",
  "⚡": "bolt",
  "🏭": "factory",
  "📡": "satellite",
  "📊": "chart",
  "🔬": "microscope",
  "📉": "chartDown",
  "💰": "money",
  "🌿": "leaf",
  "🏦": "bank",
  "📄": "document",
  "🌤": "cloudSun",
  "🚗": "car",
  "⚙": "gear",
  "✓": "check",
  "✕": "close",
  "🏆": "trophy",
  "🌍": "globe",
  "🏢": "building",
  "🅿️": "parking",
  "📈": "chartUp",
  "→": "arrowRight",
  "←": "arrowLeft",
  "○": "circle",
  "↺": "reset",
};

export default Icon;
