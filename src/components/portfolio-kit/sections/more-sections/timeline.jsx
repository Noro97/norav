import { withDefaults } from '../../content';
import { SectionHead } from '../../section-head';

export const DEFAULTS = {
  headGlyph: '★',
  headLabel: 'The road here',
  title: 'A short',
  titleAccent: 'timeline',
  titleTail: '.',
  items: [
    { year: '2026', title: 'Launched studio v04', note: 'Independent practice, year eight' },
    { year: '2025', title: 'Webby for Linear.Wave', note: 'Best Financial Services site' },
    { year: '2024', title: 'Joined IxDA board', note: 'NYC chapter co-chair' },
    { year: '2023', title: 'Spool hits 60k installs', note: 'Self-funded indie iOS app' },
    { year: '2021', title: 'Atelier Six co-lead', note: 'Brooklyn, NY — full-time' },
    { year: '2018', title: 'Started independent', note: 'First client: a one-person bakery' },
  ],
};

export function Timeline({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  return (
    <section className="timeline" data-screen-label="Timeline">
      <SectionHead
        accent={accent}
        lead={c.headGlyph}
        label={c.headLabel}
        title={c.title}
        titleAccent={c.titleAccent}
        titleTail={c.titleTail}
      />
      <div className="tl-list">
        {c.items.map((it, i) => (
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
