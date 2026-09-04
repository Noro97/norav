import { withDefaults } from '../../content';
import { SectionHead } from '../../section-head';

export const DEFAULTS = {
  headGlyph: '✎',
  headLabel: 'Field notes — recent writing',
  title: 'Three pieces',
  titleAccent: 'worth your time',
  titleTail: '.',
  readLabel: 'Read essay',
  posts: [
    { date: 'Apr 2026', reads: '8 min', title: 'Why I stopped charging hourly', excerpt: "After eight years of design contracts, the hourly model finally broke. Here's what replaced it.", href: '' },
    { date: 'Feb 2026', reads: '12 min', title: 'Motion grammar for product teams', excerpt: 'A short manual for designers and engineers who want their interfaces to feel intentional in motion.', href: '' },
    { date: 'Dec 2025', reads: '5 min', title: 'The brief that wrote itself', excerpt: 'Anatomy of a Slack message that turned into a six-month engagement and a Webby.', href: '' },
  ],
};

export function Writing({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  return (
    <section className="writing" data-screen-label="Writing">
      <SectionHead
        accent={accent}
        lead={c.headGlyph}
        label={c.headLabel}
        title={c.title}
        titleAccent={c.titleAccent}
        titleTail={c.titleTail}
      />
      <div className="writing-grid">
        {c.posts.map((p, i) => (
          // No link yet is a card that does not pretend to be one: without an
          // address, clicking it would scroll to the top of the page.
          <a
            key={i}
            href={p.href || undefined}
            className="post"
            {...(p.href ? {} : { onClick: (e) => e.preventDefault() })}
          >
            <div className="post-meta">
              <span>{p.date}</span><span className="dot-sep">·</span><span>{p.reads}</span>
            </div>
            <h3>{p.title}</h3>
            <p>{p.excerpt}</p>
            <div className="post-link" style={{ color: accent }}>
              {c.readLabel} <span>→</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
