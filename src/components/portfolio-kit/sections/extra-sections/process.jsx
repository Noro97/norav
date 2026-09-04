export function Process({ accent }) {
  const steps = [
    { n: "01", title: "Listen", blurb: "A 45-minute call. No deck, no pitch. Just the problem, the team, and the constraints." },
    { n: "02", title: "Frame", blurb: "I write a short brief back to you within 48 hours. We agree on shape, scope, and price — fixed, not hourly." },
    { n: "03", title: "Make", blurb: "Daily Loom updates, a shared Figma, and weekly working sessions. You see everything as it's made." },
    { n: "04", title: "Hand off", blurb: "Pixel-perfect specs, motion prototypes, a Notion doc your engineers will actually open. I stay on Slack for two weeks after." },
  ];
  return (
    <section className="process" data-screen-label="04 Process">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>04</span><span className="bar"></span><span>How it works</span>
        </div>
        <h2 className="section-title">
          A four-step process. <br/>
          <span className="muted">Boring on paper, rigorous in practice.</span>
        </h2>
      </div>
      <div className="process-track">
        {steps.map((s, i) => (
          <div key={s.n} className="step">
            <div className="step-head">
              <span className="step-num" style={{ color: accent }}>{s.n}</span>
              {i < steps.length - 1 && <span className="step-line"></span>}
            </div>
            <h3>{s.title}</h3>
            <p>{s.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
