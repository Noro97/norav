import { withDefaults } from '../../content';

export const DEFAULTS = {
  glyph: '✦',
  items: [
    { label: '42 SHIPPED PROJECTS' },
    { label: '$420M IN FUNDING RAISED BY CLIENTS' },
    { label: '11 AWWWARDS' },
    { label: '3 WEBBY NOMINATIONS' },
    { label: '8 YEARS INDEPENDENT' },
    { label: '100% NDA-FRIENDLY' },
    { label: 'AVERAGE NPS 9.6 / 10' },
  ],
};

export function StatsMarquee({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  // Three passes: the track scrolls a third of its width, so the copy that
  // scrolls off has an identical one arriving behind it.
  const repeated = [...c.items, ...c.items, ...c.items];
  return (
    <div className="marquee" style={{ "--accent": accent }}>
      <div className="marquee-track">
        {repeated.map((it, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-glyph" style={{ color: accent }}>{c.glyph}</span>
            {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}
