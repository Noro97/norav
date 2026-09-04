import { withDefaults } from '../../content';

export const DEFAULTS = {
  headGlyph: '♢',
  headLabel: 'Recognition',
  title: 'Trophies',
  titleAccent: 'collect dust',
  titleTail: '.',
  blurb: "But they're a useful proxy. Here's what the work has picked up over the years — included for the recruiters and creative directors who skim.",
  awards: [
    { org: 'Awwwards', count: '11', label: 'Site of the Day' },
    { org: 'Webby', count: '1', label: 'Winner · Financial' },
    { org: 'FWA', count: '4', label: 'Site of the Day' },
    { org: 'Communication Arts', count: '2', label: 'Featured' },
    { org: 'Type Directors Club', count: '1', label: 'Certificate of Excellence' },
  ],
};

export function Awards({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  return (
    <section className="awards" data-screen-label="Awards">
      <div className="awards-inner">
        <div className="awards-side">
          <div className="section-eyebrow">
            <span>{c.headGlyph}</span><span className="bar"></span><span>{c.headLabel}</span>
          </div>
          <h2 className="section-title">
            {c.title}{" "}<em style={{ color: accent }}>{c.titleAccent}</em>{c.titleTail}
          </h2>
          <p className="awards-blurb">{c.blurb}</p>
        </div>
        <div className="awards-list">
          {c.awards.map((a, i) => (
            <div key={i} className="award-row">
              <div className="award-count" style={{ color: accent }}>×{a.count}</div>
              <div className="award-meta">
                <div className="award-org">{a.org}</div>
                <div className="award-label">{a.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
