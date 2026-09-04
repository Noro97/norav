import { withDefaults } from '../../content';
import { SectionHead } from '../../section-head';

export const DEFAULTS = {
  headGlyph: '◉',
  headLabel: 'Live from the studio',
  ctaLabel: 'Follow on Instagram →',
  ctaHref: '',
  tiles: [
    { color: '#ff7fbf', likes: '47', age: '1d' },
    { color: '#7fffc4', likes: '94', age: '2d' },
    { color: '#ffd47f', likes: '141', age: '3d' },
    { color: '#7fcfff', likes: '188', age: '4d' },
    { color: '#c4a8ff', likes: '235', age: '5d' },
    { color: '#f5efe6', likes: '282', age: '6d' },
  ],
};

export function VisualFeed({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  return (
    <section className="feed" data-screen-label="Feed">
      <SectionHead
        accent={accent}
        lead={c.headGlyph}
        label={c.headLabel}
      />
      <div className="feed-row">
        {c.tiles.map((tile, i) => (
          <div key={i} className="feed-cell">
            {/* Placeholder art rather than a photo: the shape is picked by
                position so a feed of any length stays visually varied. */}
            <div className="feed-thumb" style={{ background: tile.color }}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <rect width="100" height="100" fill={tile.color}/>
                {i % 3 === 0 && <circle cx="50" cy="50" r="28" fill="rgba(0,0,0,0.7)"/>}
                {i % 3 === 1 && <rect x="20" y="20" width="60" height="60" fill="rgba(0,0,0,0.7)" transform="rotate(45 50 50)"/>}
                {i % 3 === 2 && (
                  <g>
                    <rect x="10" y="40" width="80" height="20" fill="rgba(0,0,0,0.8)"/>
                    <text x="50" y="55" textAnchor="middle" fontSize="14" fill={tile.color} fontFamily="serif" fontStyle="italic">Aa</text>
                  </g>
                )}
              </svg>
            </div>
            <div className="feed-meta">
              <span>♡ {tile.likes}</span>
              <span className="dot-sep">·</span>
              <span>{tile.age}</span>
            </div>
          </div>
        ))}
      </div>
      {c.ctaLabel && (
        <div className="feed-cta">
          <a
            href={c.ctaHref || undefined}
            className="feed-follow"
            style={{ borderColor: accent, color: accent }}
            {...(c.ctaHref ? {} : { onClick: (e) => e.preventDefault() })}
          >
            {c.ctaLabel}
          </a>
        </div>
      )}
    </section>
  );
}
