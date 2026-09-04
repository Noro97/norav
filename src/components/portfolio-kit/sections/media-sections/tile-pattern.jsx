export function TilePattern({ kind, accent }) {
  if (kind === "phone") {
    return (
      <svg viewBox="0 0 220 280" preserveAspectRatio="xMidYMid slice">
        <rect width="220" height="280" fill="#1a1a1a"/>
        <rect x="70" y="24" width="80" height="232" rx="14" fill="#0a0a0a" stroke={accent} strokeWidth="1"/>
        <rect x="76" y="40" width="68" height="68" rx="4" fill={accent} opacity="0.3"/>
        <rect x="76" y="116" width="68" height="6" rx="2" fill="#fff" opacity="0.6"/>
        <rect x="76" y="128" width="48" height="4" rx="2" fill="#fff" opacity="0.3"/>
        <rect x="76" y="144" width="68" height="40" rx="4" fill="#fff" opacity="0.08"/>
        <rect x="76" y="192" width="68" height="40" rx="4" fill="#fff" opacity="0.08"/>
      </svg>
    );
  }
  if (kind === "dashboard") {
    return (
      <svg viewBox="0 0 220 280" preserveAspectRatio="xMidYMid slice">
        <rect width="220" height="280" fill="#1a1a1a"/>
        <rect x="16" y="20" width="188" height="240" rx="6" fill="#0a0a0a" stroke="#333" strokeWidth="1"/>
        <rect x="24" y="32" width="40" height="6" rx="2" fill="#fff" opacity="0.6"/>
        <rect x="24" y="50" width="172" height="60" rx="4" fill={accent} opacity="0.15"/>
        <polyline points="32,90 60,75 90,82 120,60 150,70 180,55" fill="none" stroke={accent} strokeWidth="1.5"/>
        <rect x="24" y="120" width="80" height="50" rx="4" fill="#fff" opacity="0.06"/>
        <rect x="116" y="120" width="80" height="50" rx="4" fill="#fff" opacity="0.06"/>
        <rect x="24" y="180" width="172" height="70" rx="4" fill="#fff" opacity="0.04"/>
        {[0,1,2,3,4,5,6].map(i => <rect key={i} x={32+i*22} y={245-i*5} width="14" height={5+i*5} fill={accent} opacity="0.7"/>)}
      </svg>
    );
  }
  if (kind === "desktop") {
    return (
      <svg viewBox="0 0 220 280" preserveAspectRatio="xMidYMid slice">
        <rect width="220" height="280" fill="#1a1a1a"/>
        <rect x="10" y="40" width="200" height="200" rx="6" fill="#0a0a0a" stroke="#333"/>
        <rect x="10" y="40" width="200" height="20" rx="6" fill="#222"/>
        <circle cx="22" cy="50" r="3" fill="#ff5f57"/>
        <circle cx="34" cy="50" r="3" fill="#ffbd2e"/>
        <circle cx="46" cy="50" r="3" fill="#28c940"/>
        <rect x="20" y="70" width="60" height="160" rx="3" fill="#fff" opacity="0.05"/>
        <rect x="26" y="80" width="48" height="6" rx="2" fill={accent} opacity="0.7"/>
        <rect x="26" y="94" width="38" height="4" rx="2" fill="#fff" opacity="0.3"/>
        <rect x="26" y="106" width="42" height="4" rx="2" fill="#fff" opacity="0.3"/>
        <rect x="90" y="70" width="110" height="80" rx="3" fill="#fff" opacity="0.08"/>
        <rect x="90" y="160" width="110" height="70" rx="3" fill={accent} opacity="0.15"/>
        <text x="100" y="195" fontFamily="serif" fontSize="20" fill={accent} fontStyle="italic">Aa</text>
      </svg>
    );
  }
  return null;
}
