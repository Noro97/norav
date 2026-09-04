import { withDefaults } from '../../content';

export const DEFAULTS = {
  headNumber: '02',
  headLabel: 'What I do',
  title: 'Four ways we can',
  titleAccent: 'work together',
  titleTail: '.',
  services: [
    {
      n: '01',
      title: 'Product design sprints',
      blurb: 'Two- to six-week engagements where I plug into your team and ship a defined surface end-to-end.',
      tags: [{ label: 'Research' }, { label: 'IA' }, { label: 'IxD' }, { label: 'Visual' }],
    },
    {
      n: '02',
      title: 'Fractional design lead',
      blurb: 'I run your design org one or two days a week. Hiring, rituals, system, taste calibration.',
      tags: [{ label: 'Strategy' }, { label: 'Hiring' }, { label: 'Systems' }, { label: 'Reviews' }],
    },
    {
      n: '03',
      title: 'Brand & motion identity',
      blurb: 'Wordmark, motion grammar, and the system that lets your team apply it without me.',
      tags: [{ label: 'Identity' }, { label: 'Motion' }, { label: 'Print' }, { label: 'Guidelines' }],
    },
    {
      n: '04',
      title: 'Design audits',
      blurb: 'Five working days. I tear the surface apart and hand back a prioritized list with mockups.',
      tags: [{ label: 'Audit' }, { label: 'Heuristics' }, { label: 'Roadmap' }],
    },
  ],
};

export function Services({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  return (
    <section id="services" className="services" data-screen-label="03 Services">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>{c.headNumber}</span><span className="bar"></span><span>{c.headLabel}</span>
        </div>
        <h2 className="section-title">
          {c.title}{" "}<em style={{ color: accent }}>{c.titleAccent}</em>{c.titleTail}
        </h2>
      </div>
      <div className="services-grid">
        {c.services.map((s, i) => (
          <div key={i} className="svc">
            <div className="svc-num" style={{ color: accent }}>{s.n}</div>
            <h3 className="svc-title">{s.title}</h3>
            <p className="svc-blurb">{s.blurb}</p>
            <div className="svc-tags">
              {(s.tags ?? []).map((t, j) => <span key={j}>{t.label}</span>)}
            </div>
            <div className="svc-arrow">→</div>
          </div>
        ))}
      </div>
    </section>
  );
}
