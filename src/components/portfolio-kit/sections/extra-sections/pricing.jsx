export function Pricing({ accent }) {
  const tiers = [
    {
      n: "PKG/01",
      name: "Audit",
      price: "$4,800",
      cycle: "fixed · 5 days",
      blurb: "A full review of one product surface with prioritized fixes.",
      features: ["Up to 30 screens reviewed", "Heuristic write-up + Loom walkthrough", "10 prioritized mockups", "60-min handoff call"],
      cta: "Book audit",
    },
    {
      n: "PKG/02",
      name: "Sprint",
      price: "$22,000",
      cycle: "fixed · 4 weeks",
      blurb: "Ship one significant feature or surface, end-to-end.",
      features: ["Discovery + research", "Full IxD + visual design", "Motion prototype", "Engineering handoff doc", "Two weeks Slack support"],
      cta: "Reserve sprint",
      featured: true,
    },
    {
      n: "PKG/03",
      name: "Fractional",
      price: "$12k/mo",
      cycle: "monthly · 3-month min",
      blurb: "Embedded design lead, two days a week.",
      features: ["Hiring + interviewing", "Weekly design crit", "Roadmap + system work", "Anything else you need"],
      cta: "Start retainer",
    },
  ];
  return (
    <section id="pricing" className="pricing" data-screen-label="05 Pricing">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>05</span><span className="bar"></span><span>Engagement &amp; pricing</span>
        </div>
        <h2 className="section-title">
          Honest pricing. <em style={{ color: accent }}>No hourly games.</em>
        </h2>
      </div>
      <div className="pricing-grid">
        {tiers.map((t) => (
          <div key={t.n} className={`tier ${t.featured ? "tier-featured" : ""}`}>
            {t.featured && <div className="tier-tag" style={{ background: accent }}>MOST CHOSEN</div>}
            <div className="tier-meta">
              <span className="tier-n">{t.n}</span>
              <span className="tier-cycle">{t.cycle}</span>
            </div>
            <h3 className="tier-name">{t.name}</h3>
            <div className="tier-price" style={t.featured ? { color: accent } : {}}>{t.price}</div>
            <p className="tier-blurb">{t.blurb}</p>
            <ul className="tier-features">
              {t.features.map((f) => (
                <li key={f}><span className="tick" style={{ color: accent }}>✓</span>{f}</li>
              ))}
            </ul>
            <a href="#contact" className={`btn ${t.featured ? "btn-primary" : "btn-secondary"}`} style={t.featured ? { background: accent } : {}}>
              {t.cta} →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
