export function Timeline({ accent }) {
  const items = [
    { year: "2026", title: "Launched studio v04", note: "Independent practice, year eight" },
    { year: "2025", title: "Webby for Linear.Wave", note: "Best Financial Services site" },
    { year: "2024", title: "Joined IxDA board", note: "NYC chapter co-chair" },
    { year: "2023", title: "Spool hits 60k installs", note: "Self-funded indie iOS app" },
    { year: "2021", title: "Atelier Six co-lead", note: "Brooklyn, NY — full-time" },
    { year: "2018", title: "Started independent", note: "First client: a one-person bakery" },
  ];
  return (
    <section className="timeline" data-screen-label="Timeline">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>★</span><span className="bar"></span><span>The road here</span>
        </div>
        <h2 className="section-title">A short <em style={{ color: accent }}>timeline</em>.</h2>
      </div>
      <div className="tl-list">
        {items.map((it, i) => (
          <div key={i} className="tl-row">
            <div className="tl-year" style={{ color: accent }}>{it.year}</div>
            <div className="tl-bullet"><span style={{ background: accent }}></span></div>
            <div className="tl-body">
              <h3>{it.title}</h3>
              <p>{it.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
