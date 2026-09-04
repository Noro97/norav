export function ProjectPattern({ kind, color, accentColor }) {
  if (kind === "grid") {
    const cells = [];
    for (let i = 0; i < 80; i++) cells.push(i);
    return (
      <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="140" fill={color} />
        {cells.map((i) => {
          const x = i % 10 * 20;
          const y = Math.floor(i / 10) * 20;
          const on = i * 7 % 11 < 4;
          return <rect key={i} x={x + 2} y={y + 2} width="16" height="16" fill={on ? accentColor : "transparent"} opacity={on ? 0.6 : 0} />;
        })}
      </svg>);

  }
  if (kind === "rings") {
    return (
      <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="140" fill={color} />
        {[10, 30, 50, 70, 90, 110].map((r) =>
        <circle key={r} cx="100" cy="70" r={r} fill="none" stroke={accentColor} strokeWidth="0.8" opacity="0.6" />
        )}
      </svg>);

  }
  if (kind === "lines") {
    return (
      <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="140" fill={color} />
        {Array.from({ length: 28 }).map((_, i) =>
        <line key={i} x1="0" y1={i * 5} x2="200" y2={i * 5 + (i % 3 === 0 ? 8 : 2)} stroke={accentColor} strokeWidth="0.6" opacity={0.3 + i % 4 * 0.15} />
        )}
      </svg>);

  }
  if (kind === "topo") {
    return (
      <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="140" fill={color} />
        {Array.from({ length: 8 }).map((_, i) =>
        <path key={i} d={`M0 ${30 + i * 12} Q 50 ${20 + i * 12 + Math.sin(i) * 8}, 100 ${35 + i * 12} T 200 ${28 + i * 12}`} fill="none" stroke={accentColor} strokeWidth="0.7" opacity="0.5" />
        )}
      </svg>);

  }
  if (kind === "dots") {
    return (
      <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="140" fill={color} />
        {Array.from({ length: 200 }).map((_, i) => {
          const x = i % 20 * 10 + 5;
          const y = Math.floor(i / 20) * 14 + 7;
          const r = 0.5 + i * 3 % 7 * 0.4;
          return <circle key={i} cx={x} cy={y} r={r} fill={accentColor} opacity="0.7" />;
        })}
      </svg>);

  }
  if (kind === "type") {
    return (
      <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="140" fill={color} />
        <text x="100" y="92" textAnchor="middle" fontFamily="Instrument Serif, serif" fontSize="76" fill={accentColor} fontStyle="italic">A6</text>
      </svg>);

  }
  return null;
}
