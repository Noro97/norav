export function CompareTable({ accent }) {
  const rows = [
    { feat: "Senior IC + system thinking", a: true, b: true },
    { feat: "Motion grammar built in", a: true, b: false },
    { feat: "Embeds in your team's tools", a: true, b: false },
    { feat: "Fixed pricing — no hourly", a: true, b: false },
    { feat: "Daily Loom updates", a: true, b: false },
    { feat: "PM-style scope discipline", a: true, b: true },
    { feat: "Hands you a 60-page deck", a: false, b: true },
  ];
  return (
    <section className="compare" data-screen-label="Compare">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>⚖</span><span className="bar"></span><span>Studio vs. agency</span>
        </div>
        <h2 className="section-title">
          Two ways to get design done. <br/>
          <span className="muted">Here's how they differ.</span>
        </h2>
      </div>
      <div className="compare-table">
        <div className="cmp-head">
          <div className="cmp-cell"></div>
          <div className="cmp-cell cmp-self" style={{ borderColor: accent }}>
            <div className="cmp-tag" style={{ background: accent }}>THIS STUDIO</div>
            <h4>Maya, independent</h4>
          </div>
          <div className="cmp-cell">
            <div className="cmp-tag cmp-tag-muted">TYPICAL</div>
            <h4>50-person agency</h4>
          </div>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="cmp-row">
            <div className="cmp-cell cmp-feat">{r.feat}</div>
            <div className="cmp-cell cmp-self" style={{ borderColor: accent }}>
              <span className={r.a ? "yes" : "no"} style={r.a ? { color: accent } : {}}>{r.a ? "✓" : "—"}</span>
            </div>
            <div className="cmp-cell">
              <span className={r.b ? "yes" : "no"}>{r.b ? "✓" : "—"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
