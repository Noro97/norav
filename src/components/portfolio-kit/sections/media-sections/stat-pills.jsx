export function StatPills({ accent }) {
  const stats = [
    { glyph: "◆", num: "205+", label: "Talks given" },
    { glyph: "▲", num: "1,062", label: "Screens shipped" },
    { glyph: "✦", num: "145+", label: "Mentees" },
    { glyph: "●", num: "387+", label: "Cups of coffee" },
  ];
  return (
    <section className="stat-pills" data-screen-label="Stat pills">
      <div className="stat-pills-row">
        {stats.map((s, i) => (
          <div key={i} className="stat-pill">
            <div className="stat-pill-icon" style={{ background: accent }}>
              <span>{s.glyph}</span>
            </div>
            <div className="stat-pill-num">{s.num}</div>
            <div className="stat-pill-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
