import { withDefaults } from '../../content';

export const DEFAULTS = {
  headGlyph: '⚖',
  headLabel: 'Studio vs. agency',
  title: 'Two ways to get design done.',
  subtitle: "Here's how they differ.",
  selfTag: 'THIS STUDIO',
  selfName: 'Working with me',
  otherTag: 'TYPICAL',
  otherName: '50-person agency',
  rows: [
    { feat: 'Senior IC + system thinking', a: true, b: true },
    { feat: 'Motion grammar built in', a: true, b: false },
    { feat: "Embeds in your team's tools", a: true, b: false },
    { feat: 'Fixed pricing — no hourly', a: true, b: false },
    { feat: 'Daily Loom updates', a: true, b: false },
    { feat: 'PM-style scope discipline', a: true, b: true },
    { feat: 'Hands you a 60-page deck', a: false, b: true },
  ],
};

export function CompareTable({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  return (
    <section className="compare" data-screen-label="Compare">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>{c.headGlyph}</span><span className="bar"></span><span>{c.headLabel}</span>
        </div>
        <h2 className="section-title">
          {c.title}
          {c.subtitle && <><br/><span className="muted">{c.subtitle}</span></>}
        </h2>
      </div>
      <div className="compare-table">
        <div className="cmp-head">
          <div className="cmp-cell"></div>
          <div className="cmp-cell cmp-self" style={{ borderColor: accent }}>
            <div className="cmp-tag" style={{ background: accent }}>{c.selfTag}</div>
            <h4>{c.selfName}</h4>
          </div>
          <div className="cmp-cell">
            <div className="cmp-tag cmp-tag-muted">{c.otherTag}</div>
            <h4>{c.otherName}</h4>
          </div>
        </div>
        {c.rows.map((r, i) => (
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
