interface RailwayBackgroundProps {
  isNightMode: boolean;
}

/**
 * RailwayBackground — full SVG scene of a railway station.
 * Day/night elements transition smoothly via CSS (500ms).
 * isNightMode=false → daytime (bright sky, no lights)
 * isNightMode=true  → nighttime (dark sky, platform lights, moon, stars)
 */
export default function RailwayBackground({ isNightMode }: RailwayBackgroundProps) {
  // Inline style helpers for smooth CSS transitions
  const t = "transition-all duration-500 ease-in-out";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 500"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* ── SKY ─────────────────────────────────────────────────────── */}
      {/* Day sky */}
      <defs>
        <linearGradient id="sky-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7EC8E3" />
          <stop offset="100%" stopColor="#C9E8F5" />
        </linearGradient>
        <linearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A0E2A" />
          <stop offset="100%" stopColor="#1A2050" />
        </linearGradient>
        <linearGradient id="ground-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B9E6A" />
          <stop offset="100%" stopColor="#6B7A4A" />
        </linearGradient>
        <linearGradient id="ground-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E2A1A" />
          <stop offset="100%" stopColor="#141C10" />
        </linearGradient>
        <linearGradient id="platform-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4C5A9" />
          <stop offset="100%" stopColor="#B8A88A" />
        </linearGradient>
        <linearGradient id="platform-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3228" />
          <stop offset="100%" stopColor="#2A2418" />
        </linearGradient>
        <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF176" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFF176" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8E8FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#E8E8FF" stopOpacity="0" />
        </radialGradient>
        <filter id="blur-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Sky background — crossfade via opacity */}
      <rect width="800" height="500" fill="url(#sky-day)"
        style={{ opacity: isNightMode ? 0 : 1, transition: "opacity 500ms ease-in-out" }} />
      <rect width="800" height="500" fill="url(#sky-night)"
        style={{ opacity: isNightMode ? 1 : 0, transition: "opacity 500ms ease-in-out" }} />

      {/* ── STARS (night only) ───────────────────────────────────────── */}
      {[
        [60,30],[120,55],[200,20],[310,40],[420,15],[530,35],[640,22],[720,50],
        [80,80],[170,70],[260,90],[380,65],[480,80],[590,60],[700,75],[760,30],
        [150,110],[340,100],[500,115],[670,95],[50,120],[750,105],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 1.5 : 1}
          fill="#E8F0FF"
          style={{ opacity: isNightMode ? (0.5 + (i % 5) * 0.1) : 0, transition: "opacity 500ms ease-in-out" }}
        />
      ))}

      {/* ── MOON (night only) ───────────────────────────────────────── */}
      <circle cx="680" cy="70" r="40" fill="#E8E8FF"
        style={{ opacity: isNightMode ? 0.15 : 0, transition: "opacity 500ms ease-in-out" }} />
      <circle cx="680" cy="70" r="28" fill="#F0F0FF"
        style={{ opacity: isNightMode ? 1 : 0, transition: "opacity 500ms ease-in-out" }} />
      {/* Moon craters */}
      <circle cx="672" cy="64" r="4" fill="#D8D8EE"
        style={{ opacity: isNightMode ? 1 : 0, transition: "opacity 500ms ease-in-out" }} />
      <circle cx="685" cy="78" r="3" fill="#D8D8EE"
        style={{ opacity: isNightMode ? 1 : 0, transition: "opacity 500ms ease-in-out" }} />

      {/* ── SUN (day only) ──────────────────────────────────────────── */}
      <circle cx="680" cy="70" r="50" fill="#FFF9C4"
        style={{ opacity: isNightMode ? 0 : 0.3, transition: "opacity 500ms ease-in-out" }} />
      <circle cx="680" cy="70" r="32" fill="#FFE066"
        style={{ opacity: isNightMode ? 0 : 1, transition: "opacity 500ms ease-in-out" }} />

      {/* ── CLOUDS (day only) ───────────────────────────────────────── */}
      {[
        { x: 80, y: 60, s: 1 },
        { x: 260, y: 45, s: 0.8 },
        { x: 450, y: 70, s: 1.1 },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x},${c.y}) scale(${c.s})`}
          style={{ opacity: isNightMode ? 0 : 0.9, transition: "opacity 500ms ease-in-out" }}>
          <ellipse cx="0" cy="0" rx="40" ry="18" fill="white" />
          <ellipse cx="-22" cy="5" rx="22" ry="14" fill="white" />
          <ellipse cx="22" cy="5" rx="26" ry="15" fill="white" />
        </g>
      ))}

      {/* ── DISTANT MOUNTAINS / HILLS ───────────────────────────────── */}
      {/* Day hills */}
      <path d="M0 260 Q100 180 200 240 Q300 160 420 230 Q520 170 620 220 Q700 180 800 210 L800 300 L0 300 Z"
        style={{
          fill: isNightMode ? "#1A2A18" : "#6B8F5A",
          transition: "fill 500ms ease-in-out",
        }} />
      <path d="M0 280 Q80 230 160 265 Q260 210 360 255 Q460 215 560 250 Q660 220 760 245 L800 260 L800 300 L0 300 Z"
        style={{
          fill: isNightMode ? "#141E12" : "#7A9E68",
          transition: "fill 500ms ease-in-out",
        }} />

      {/* ── GROUND ──────────────────────────────────────────────────── */}
      <rect x="0" y="300" width="800" height="200"
        fill="url(#ground-day)"
        style={{ opacity: isNightMode ? 0 : 1, transition: "opacity 500ms ease-in-out" }} />
      <rect x="0" y="300" width="800" height="200"
        fill="url(#ground-night)"
        style={{ opacity: isNightMode ? 1 : 0, transition: "opacity 500ms ease-in-out" }} />

      {/* ── RAILWAY TRACKS ──────────────────────────────────────────── */}
      {/* Left rail */}
      <path d="M280 500 L340 300" stroke={isNightMode ? "#4A4A5A" : "#8A7A6A"} strokeWidth="4"
        style={{ transition: "stroke 500ms ease-in-out" }} />
      {/* Right rail */}
      <path d="M520 500 L460 300" stroke={isNightMode ? "#4A4A5A" : "#8A7A6A"} strokeWidth="4"
        style={{ transition: "stroke 500ms ease-in-out" }} />
      {/* Sleepers (ties) */}
      {[310, 330, 350, 370, 390, 410, 430, 450, 470].map((y, i) => {
        const progress = (y - 300) / 200;
        const x1 = 340 + progress * (280 - 340);
        const x2 = 460 - progress * (460 - 520);
        return (
          <line key={i} x1={x1} y1={y} x2={x2} y2={y}
            stroke={isNightMode ? "#3A3A4A" : "#7A6A5A"} strokeWidth="3"
            style={{ transition: "stroke 500ms ease-in-out" }} />
        );
      })}

      {/* ── PLATFORM ────────────────────────────────────────────────── */}
      <rect x="0" y="340" width="260" height="80" rx="4"
        fill="url(#platform-day)"
        style={{ opacity: isNightMode ? 0 : 1, transition: "opacity 500ms ease-in-out" }} />
      <rect x="0" y="340" width="260" height="80" rx="4"
        fill="url(#platform-night)"
        style={{ opacity: isNightMode ? 1 : 0, transition: "opacity 500ms ease-in-out" }} />
      {/* Platform edge stripe */}
      <rect x="0" y="340" width="260" height="6" rx="2"
        style={{ fill: isNightMode ? "#FFE066" : "#F5E6C8", transition: "fill 500ms ease-in-out" }} />

      {/* ── PLATFORM ROOF / CANOPY ──────────────────────────────────── */}
      <rect x="-10" y="290" width="280" height="12" rx="4"
        style={{ fill: isNightMode ? "#2A2A3A" : "#C0A882", transition: "fill 500ms ease-in-out" }} />
      {/* Canopy supports */}
      {[30, 100, 170, 240].map((x, i) => (
        <rect key={i} x={x} y="302" width="8" height="38"
          style={{ fill: isNightMode ? "#222232" : "#A89070", transition: "fill 500ms ease-in-out" }} />
      ))}

      {/* ── PLATFORM LAMPS ──────────────────────────────────────────── */}
      {[40, 130, 220].map((x, i) => (
        <g key={i}>
          {/* Lamp post */}
          <rect x={x + 2} y="260" width="4" height="32"
            style={{ fill: isNightMode ? "#3A3A4A" : "#8A8070", transition: "fill 500ms ease-in-out" }} />
          {/* Lamp arm */}
          <rect x={x - 8} y="260" width="18" height="3" rx="1"
            style={{ fill: isNightMode ? "#3A3A4A" : "#8A8070", transition: "fill 500ms ease-in-out" }} />
          {/* Lamp head */}
          <ellipse cx={x - 2} cy="260" rx="10" ry="5"
            style={{ fill: isNightMode ? "#2A2A2A" : "#6A6050", transition: "fill 500ms ease-in-out" }} />
          {/* Glow halo — night only */}
          <ellipse cx={x - 2} cy="265" rx="28" ry="22"
            fill="#FFF176"
            style={{ opacity: isNightMode ? 0.18 : 0, transition: "opacity 500ms ease-in-out" }} />
          {/* Lamp bulb — night only */}
          <ellipse cx={x - 2} cy="261" rx="7" ry="4"
            fill="#FFF9C4"
            style={{ opacity: isNightMode ? 1 : 0, transition: "opacity 500ms ease-in-out" }} />
          {/* Lamp cone light — night only */}
          <path d={`M${x - 12} 265 L${x - 22} 310 L${x + 18} 310 L${x + 8} 265 Z`}
            fill="#FFF176"
            style={{ opacity: isNightMode ? 0.08 : 0, transition: "opacity 500ms ease-in-out" }} />
        </g>
      ))}

      {/* ── TRAIN ───────────────────────────────────────────────────── */}
      {/* Train body */}
      <rect x="50" y="310" width="200" height="60" rx="8"
        style={{ fill: isNightMode ? "#1E2A3A" : "#2E5FA3", transition: "fill 500ms ease-in-out" }} />
      {/* Train roof */}
      <rect x="55" y="305" width="190" height="12" rx="6"
        style={{ fill: isNightMode ? "#162030" : "#1E4A8A", transition: "fill 500ms ease-in-out" }} />
      {/* Train stripe */}
      <rect x="50" y="340" width="200" height="6"
        style={{ fill: isNightMode ? "#2A4A6A" : "#4A8AC8", transition: "fill 500ms ease-in-out" }} />

      {/* Train windows — day */}
      {[70, 120, 170, 210].map((x, i) => (
        <rect key={i} x={x} y="318" width={i === 3 ? 28 : 32} height="20" rx="3"
          style={{ fill: isNightMode ? "#0A1020" : "#B8D4F0", transition: "fill 500ms ease-in-out" }} />
      ))}
      {/* Window glow — night only */}
      {[70, 120, 170, 210].map((x, i) => (
        <rect key={i} x={x} y="318" width={i === 3 ? 28 : 32} height="20" rx="3"
          fill="#FFF9C4"
          style={{ opacity: isNightMode ? 0.7 : 0, transition: "opacity 500ms ease-in-out" }} />
      ))}

      {/* Train headlight — night only */}
      <ellipse cx="250" cy="340" rx="8" ry="6" fill="#FFFDE7"
        style={{ opacity: isNightMode ? 1 : 0, transition: "opacity 500ms ease-in-out" }} />
      <ellipse cx="250" cy="340" rx="40" ry="20" fill="#FFFDE7"
        style={{ opacity: isNightMode ? 0.12 : 0, transition: "opacity 500ms ease-in-out" }} />

      {/* Train wheels */}
      {[90, 150, 210].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy="372" r="12"
            style={{ fill: isNightMode ? "#1A1A2A" : "#1A1A2A", stroke: isNightMode ? "#3A3A5A" : "#4A4A6A", strokeWidth: 2, transition: "all 500ms ease-in-out" }} />
          <circle cx={x} cy="372" r="5"
            style={{ fill: isNightMode ? "#2A2A3A" : "#3A3A5A", transition: "fill 500ms ease-in-out" }} />
        </g>
      ))}

      {/* ── STATION BUILDING (right side) ───────────────────────────── */}
      <rect x="560" y="240" width="240" height="160" rx="4"
        style={{ fill: isNightMode ? "#1A1E2A" : "#E8D5B0", transition: "fill 500ms ease-in-out" }} />
      {/* Roof */}
      <path d="M555 240 L680 190 L805 240 Z"
        style={{ fill: isNightMode ? "#141820" : "#C8A870", transition: "fill 500ms ease-in-out" }} />
      {/* Building windows */}
      {[[580,260],[640,260],[700,260],[760,260],[580,300],[640,300],[700,300],[760,300]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="30" height="24" rx="2"
          style={{ fill: isNightMode ? "#FFF9C4" : "#B8D4F0", transition: "fill 500ms ease-in-out" }} />
      ))}
      {/* Building window glow — night */}
      {[[580,260],[640,260],[700,260],[760,260],[580,300],[640,300],[700,300],[760,300]].map(([x,y],i) => (
        <rect key={i} x={x - 4} y={y - 4} width="38" height="32" rx="4"
          fill="#FFF176"
          style={{ opacity: isNightMode ? 0.1 : 0, transition: "opacity 500ms ease-in-out" }} />
      ))}
      {/* Station door */}
      <rect x="655" y="340" width="50" height="60" rx="3"
        style={{ fill: isNightMode ? "#0A0E18" : "#8A6A40", transition: "fill 500ms ease-in-out" }} />
      {/* Station sign */}
      <rect x="610" y="248" width="140" height="22" rx="3"
        style={{ fill: isNightMode ? "#2A3050" : "#4A6A9A", transition: "fill 500ms ease-in-out" }} />

      {/* ── FOREGROUND GROUND DETAIL ─────────────────────────────────── */}
      {/* Ballast / gravel between tracks */}
      <path d="M290 500 L350 310 L450 310 L510 500 Z"
        style={{ fill: isNightMode ? "#2A2A3A" : "#9A8A7A", transition: "fill 500ms ease-in-out" }} />

      {/* ── AMBIENT NIGHT GLOW on ground ────────────────────────────── */}
      <ellipse cx="130" cy="380" rx="120" ry="30" fill="#FFF176"
        style={{ opacity: isNightMode ? 0.04 : 0, transition: "opacity 500ms ease-in-out" }} />

      {/* ── OVERALL NIGHT OVERLAY (darkens everything slightly) ──────── */}
      <rect width="800" height="500" fill="#000820"
        style={{ opacity: isNightMode ? 0.35 : 0, transition: "opacity 500ms ease-in-out", pointerEvents: "none" }} />
    </svg>
  );
}
