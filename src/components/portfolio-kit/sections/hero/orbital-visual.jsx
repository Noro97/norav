export function OrbitalVisual({ accent }) {
  // big circular generative "shard" composition inspired by ref 1
  const bars = [];
  for (let i = 0; i < 70; i++) {
    const angle = (i / 70) * Math.PI * 2;
    const len = 60 + ((i * 17) % 100);
    const thick = 1 + ((i * 3) % 4);
    bars.push({ angle, len, thick, delay: (i % 14) * 80 });
  }
  return (
    <div className="orbital">
      <div className="orbital-glow" style={{ background: `radial-gradient(circle, ${accent}33 0%, transparent 60%)` }}/>
      <svg viewBox="-200 -200 400 400" className="orbital-svg">
        <defs>
          <linearGradient id="shardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5"/>
          </linearGradient>
        </defs>
        <circle cx="0" cy="0" r="155" fill="none" stroke={accent} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.4"/>
        <circle cx="0" cy="0" r="180" fill="none" stroke="#ffffff" strokeWidth="0.3" strokeDasharray="1 6" opacity="0.3"/>
        {bars.map((b, i) => {
          const x1 = Math.cos(b.angle) * 30;
          const y1 = Math.sin(b.angle) * 30;
          const x2 = Math.cos(b.angle) * (30 + b.len);
          const y2 = Math.sin(b.angle) * (30 + b.len);
          return (
            <line key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="url(#shardGrad)"
              strokeWidth={b.thick}
              strokeLinecap="round"
              opacity="0.7"
              style={{ animation: `pfk-shardPulse 4s ease-in-out ${b.delay}ms infinite` }}
            />
          );
        })}
        <circle cx="0" cy="0" r="12" fill={accent} opacity="0.9"/>
        <circle cx="0" cy="0" r="6" fill="#fff"/>
      </svg>
      <div className="orbital-ring orbital-ring-1"></div>
      <div className="orbital-ring orbital-ring-2" style={{ borderColor: `${accent}66` }}></div>
    </div>
  );
}
