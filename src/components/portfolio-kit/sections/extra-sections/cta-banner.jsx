export function CTABanner({ accent }) {
  return (
    <section className="cta-banner" data-screen-label="08 CTA">
      <div className="cta-bg-text" style={{ color: accent }}>LET'S MAKE</div>
      <div className="cta-inner">
        <div className="cta-eyebrow">
          <span className="dot" style={{ background: accent }}></span>
          <span>2 Q3 SLOTS LEFT · 2026</span>
        </div>
        <h2 className="cta-headline">
          Got something <em style={{ color: accent }}>worth shipping</em>?
        </h2>
        <p className="cta-sub">
          The first call is 45 minutes, costs nothing, and either ends with a brief in your inbox or an honest "I'm not the right fit."
        </p>
        <div className="cta-row">
          <a href="#contact" className="btn btn-primary btn-lg" style={{ background: accent }}>
            <span>Book the intro call</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </a>
          <a href="mailto:hello@mayaokafor.studio" className="btn btn-secondary btn-lg">hello@mayaokafor.studio</a>
        </div>
      </div>
    </section>
  );
}
