import { useState } from 'react';

export function ExpandingCards({ accent }) {
  const [open, setOpen] = useState(0);
  const cards = [
    {
      title: "I work alone, mostly.",
      excerpt: "But I have a network of trusted collaborators.",
      body: "When a project needs an engineer, an illustrator, or a copywriter, I bring in someone I've worked with before. You meet them on day one, and they bill through me. No procurement, no vendor onboarding — just one contract, one Slack channel.",
    },
    {
      title: "Fixed price, always.",
      excerpt: "No hourly billing. No surprise invoices.",
      body: "After the scoping call, you get a fixed quote tied to a milestone schedule. If scope expands, we agree on a written change order before any new work starts. The point is predictability — for you and for me.",
    },
    {
      title: "Async by default.",
      excerpt: "But I'll take calls when it matters.",
      body: "Most communication runs through Slack and Loom. Daily updates, weekly walkthroughs. Real-time meetings are reserved for kickoff, mid-point review, and handoff. This isn't laziness — it's how senior IC work gets done without context-switching damage.",
    },
    {
      title: "I stay through ship.",
      excerpt: "Implementation review is part of the engagement.",
      body: "After the final deliverable, I stay on-call for two weeks of implementation review. I'll pair with engineers, fix CSS, tweak motion, and ship the v1.1. This is where a lot of agency engagements fall apart — I won't.",
    },
  ];
  return (
    <section className="expand" data-screen-label="Expanding cards">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>⊞</span><span className="bar"></span><span>How I work — click to read</span>
        </div>
        <h2 className="section-title">
          Four things <em style={{ color: accent }}>worth knowing</em>.
        </h2>
      </div>
      <div className="expand-list">
        {cards.map((c, i) => (
          <div
            key={i}
            className={`expand-card ${i === open ? "open" : ""}`}
            onClick={() => setOpen(i === open ? -1 : i)}
            style={i === open ? { borderColor: accent } : {}}
          >
            <div className="expand-head">
              <div className="expand-num" style={i === open ? { color: accent, borderColor: accent } : {}}>{String(i + 1).padStart(2, "0")}</div>
              <div className="expand-titles">
                <h3>{c.title}</h3>
                <p className="expand-excerpt">{c.excerpt}</p>
              </div>
              <div className="expand-icon" style={i === open ? { background: accent, color: "#1a1a1a" } : {}}>
                {i === open ? "−" : "+"}
              </div>
            </div>
            <div className="expand-body">
              <p>{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
