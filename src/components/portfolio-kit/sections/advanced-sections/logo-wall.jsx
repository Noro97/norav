export function LogoWall({ accent }) {
  const rows = [
    ["LINEAR", "FRAMER", "ARC", "VERCEL", "STRIPE", "RAYCAST", "LOOPS", "RESEND"],
    ["NOTION", "RAMP", "RETOOL", "PERPLEXITY", "OPENAI", "ANTHROPIC", "FIGMA", "POSTHOG"],
    ["MIDJOURNEY", "RUNWAY", "CURSOR", "WARP", "CRAFT", "SUPERHUMAN", "PITCH", "READYMAG"],
  ];
  return (
    <section className="logowall" data-screen-label="Logo wall">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>◎</span><span className="bar"></span><span>Sample of clients · 2018 — present</span>
        </div>
      </div>
      <div className="logowall-stack">
        {rows.map((row, ri) => {
          const all = [...row, ...row, ...row];
          return (
            <div key={ri} className={`logowall-row ${ri % 2 === 1 ? "reverse" : ""}`}>
              <div className="logowall-track">
                {all.map((logo, i) => (
                  <span key={i} className="logowall-logo">
                    {logo}
                    <span className="logowall-dot" style={{ background: accent }}></span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
