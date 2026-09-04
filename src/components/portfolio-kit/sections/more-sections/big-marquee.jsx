import { withDefaults } from '../../content';

export const DEFAULTS = {
  star: '✦',
  words: [
    { label: 'available' },
    { label: 'for hire' },
    { label: 'May 2026' },
    { label: 'Yerevan' },
    { label: 'remote OK' },
    { label: 'EU friendly' },
  ],
};

export function BigMarquee({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  const all = [...c.words, ...c.words, ...c.words];
  return (
    <section className="big-marq" data-screen-label="Big marquee">
      <div className="big-marq-track">
        {all.map((w, i) => (
          <span key={i} className="big-marq-word">
            {w.label}
            <span className="big-marq-star" style={{ color: accent }}>{c.star}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
