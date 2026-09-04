import { useState } from 'react';

export function GlitchSection({ accent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <section className="glitch" data-screen-label="Glitch">
      <div className="glitch-inner">
        <div className="section-eyebrow">
          <span>▰</span><span className="bar"></span><span>Don't get attached</span>
        </div>
        <h2
          className={`glitch-text ${hovered ? "active" : ""}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          data-text="REWRITE THE BRIEF"
          style={{ "--accent": accent }}
        >
          REWRITE<br/>THE BRIEF
        </h2>
        <p className="glitch-sub">
          Most kickoffs surface a question the original brief didn't answer. <br/>
          That's where the work starts. Hover the headline.
        </p>
      </div>
    </section>
  );
}
