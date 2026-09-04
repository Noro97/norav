import { withDefaults } from '../../content';
import { SectionHead } from '../../section-head';

export const DEFAULTS = {
  headNumber: '06',
  headLabel: 'Recent press',
  features: [
    { name: 'Bloomberg Green', note: 'Atlas of carbon flows — Aug 2024' },
    { name: 'Fast Company', note: 'Innovation by Design finalist — 2024' },
    { name: "It's Nice That", note: 'Interview + studio visit — 2025' },
    { name: 'The Webby Awards', note: 'Winner, Financial Services — 2025' },
    { name: 'Sidebar.io', note: 'Featured five times' },
  ],
};

export function Press({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  return (
    <section className="press" data-screen-label="06 Press">
      <SectionHead
        accent={accent}
        lead={c.headNumber}
        label={c.headLabel}
      />
      <div className="press-list">
        {c.features.map((f, i) => (
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
