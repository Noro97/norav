import { HeroCanvas } from './hero-canvas';
import { OrbitalVisual } from './orbital-visual';

export function Hero({ accent, density, headlineMode }) {
  const headlines = {
    bold: [["Design"], ["that moves"], ["the", "needle."]],
    poetic: [["Interfaces"], ["with a pulse"], ["and a", "point."]],
    direct: [["Senior product"], ["designer for"], ["ambitious", "teams."]],
  };
  const lines = headlines[headlineMode] || headlines.bold;

  return (
    <section className="hero" data-screen-label="01 Hero">
      <HeroCanvas accent={accent} density={density} />
      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="dot" style={{ background: accent }}></span>
            <span>Available — May 2026</span>
            <span className="sep">/</span>
            <span>Brooklyn, NY</span>
          </div>
          <h1 className="hero-headline">
            {lines.map((words, i) => (
              <span key={i} className="hero-line" style={{ animationDelay: `${i * 120}ms` }}>
                {words.length === 1 ? words[0] : (
                  <>
                    {words[0]}{" "}<em style={{ color: accent }}>{words[1]}</em>
                  </>
                )}
              </span>
            ))}
          </h1>
          <p className="hero-sub">
            I'm Maya — an independent product &amp; motion designer.
            I help founders and creative directors ship interfaces that feel
            inevitable. Eight years, three IPOs, one Webby.
          </p>
          <div className="hero-ctas">
            <a href="#work" className="btn btn-primary" style={{ background: accent }}>
              <span>See selected work</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
              </svg>
            </a>
            <a href="#contact" className="btn btn-secondary">
              <span>Start a project</span>
            </a>
          </div>
          <div className="hero-meta">
            <div><span className="num">42</span><span className="lbl">shipped</span></div>
            <div><span className="num">8yr</span><span className="lbl">experience</span></div>
            <div><span className="num">11</span><span className="lbl">awards</span></div>
            <div><span className="num">∞</span><span className="lbl">curiosity</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <OrbitalVisual accent={accent} />
        </div>
      </div>
      <div className="hero-corner tl">N 40°41′ · W 73°59′</div>
      <div className="hero-corner bl">PORTFOLIO / 2026</div>
      <div className="hero-corner br">VOL. 04 — SCROLL ↓</div>
    </section>
  );
}
