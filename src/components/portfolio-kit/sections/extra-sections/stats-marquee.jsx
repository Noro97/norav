export function StatsMarquee({ accent }) {
  const items = [
    "42 SHIPPED PROJECTS",
    "$420M IN FUNDING RAISED BY CLIENTS",
    "11 AWWWARDS",
    "3 WEBBY NOMINATIONS",
    "8 YEARS INDEPENDENT",
    "100% NDA-FRIENDLY",
    "AVERAGE NPS 9.6 / 10",
  ];
  const repeated = [...items, ...items, ...items];
  return (
    <div className="marquee" style={{ "--accent": accent }}>
      <div className="marquee-track">
        {repeated.map((it, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-glyph" style={{ color: accent }}>✦</span>
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
