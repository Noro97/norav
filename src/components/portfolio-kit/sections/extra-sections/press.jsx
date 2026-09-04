export function Press({ accent }) {
  const features = [
    { name: "Bloomberg Green", note: "Atlas of carbon flows — Aug 2024" },
    { name: "Fast Company", note: "Innovation by Design finalist — 2024" },
    { name: "It's Nice That", note: "Interview + studio visit — 2025" },
    { name: "The Webby Awards", note: "Winner, Financial Services — 2025" },
    { name: "Sidebar.io", note: "Featured five times" },
  ];
  return (
    <section className="press" data-screen-label="06 Press">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>06</span><span className="bar"></span><span>Recent press</span>
        </div>
      </div>
      <div className="press-list">
        {features.map((f, i) => (
          <div key={i} className="press-row">
            <span className="press-idx">{String(i+1).padStart(2,"0")}</span>
            <span className="press-name">{f.name}</span>
            <span className="press-note">{f.note}</span>
            <span className="press-arrow" style={{ color: accent }}>↗</span>
          </div>
        ))}
      </div>
    </section>
  );
}
