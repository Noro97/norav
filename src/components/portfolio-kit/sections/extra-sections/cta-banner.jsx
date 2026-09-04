import { withDefaults } from '../../content';

export const DEFAULTS = {
  backdropText: "LET'S MAKE",
  eyebrow: '2 Q3 SLOTS LEFT · 2026',
  headline: 'Got something',
  headlineAccent: 'worth shipping',
  headlineTail: '?',
  sub: 'The first call is 45 minutes, costs nothing, and either ends with a brief in your inbox or an honest "I\'m not the right fit."',
  primaryLabel: 'Book the intro call',
  primaryHref: '#contact',
  secondaryLabel: 'hello@example.com',
  secondaryHref: 'mailto:hello@example.com',
};

export function CTABanner({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  return (
    <section className="cta-banner" data-screen-label="08 CTA">
      <div className="cta-bg-text" style={{ color: accent }}>{c.backdropText}</div>
      <div className="cta-inner">
        <div className="cta-eyebrow">
          <span className="dot" style={{ background: accent }}></span>
          <span>{c.eyebrow}</span>
        </div>
        <h2 className="cta-headline">
          {c.headline}{" "}<em style={{ color: accent }}>{c.headlineAccent}</em>{c.headlineTail}
        </h2>
        <p className="cta-sub">{c.sub}</p>
        <div className="cta-row">
          <a href={c.primaryHref} className="btn btn-primary btn-lg" style={{ background: accent }}>
            <span>{c.primaryLabel}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </a>
          {c.secondaryLabel && (
            <a href={c.secondaryHref} className="btn btn-secondary btn-lg">{c.secondaryLabel}</a>
          )}
        </div>
      </div>
    </section>
  );
}
