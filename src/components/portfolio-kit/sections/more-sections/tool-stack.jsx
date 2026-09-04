export function ToolStack({ accent }) {
  const tools = [
    { name: "Figma", note: "Daily driver", glyph: "F" },
    { name: "Origami", note: "Motion prototypes", glyph: "Or" },
    { name: "After Effects", note: "Brand motion", glyph: "Ae" },
    { name: "Cursor", note: "Engineering handoffs", glyph: "C" },
    { name: "Notion", note: "Briefs & docs", glyph: "N" },
    { name: "Linear", note: "Project tracking", glyph: "L" },
    { name: "Loom", note: "Async reviews", glyph: "Lm" },
    { name: "Arc", note: "Browser of choice", glyph: "Ar" },
  ];
  return (
    <section className="tools" data-screen-label="Tools">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>◇</span><span className="bar"></span><span>Tool stack</span>
        </div>
        <h2 className="section-title">Eight tools, <em style={{ color: accent }}>used daily</em>.</h2>
      </div>
      <div className="tools-grid">
        {tools.map((t, i) => (
          <div key={i} className="tool-cell">
            <div className="tool-glyph" style={{ borderColor: accent, color: accent }}>{t.glyph}</div>
            <div>
              <div className="tool-name">{t.name}</div>
              <div className="tool-note">{t.note}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
