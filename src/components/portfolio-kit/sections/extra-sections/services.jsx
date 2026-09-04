export function Services({ accent }) {
  const services = [
    {
      n: "01",
      title: "Product design sprints",
      blurb: "Two- to six-week engagements where I plug into your team and ship a defined surface end-to-end.",
      tags: ["Research", "IA", "IxD", "Visual"],
    },
    {
      n: "02",
      title: "Fractional design lead",
      blurb: "I run your design org one or two days a week. Hiring, rituals, system, taste calibration.",
      tags: ["Strategy", "Hiring", "Systems", "Reviews"],
    },
    {
      n: "03",
      title: "Brand &amp; motion identity",
      blurb: "Wordmark, motion grammar, and the system that lets your team apply it without me.",
      tags: ["Identity", "Motion", "Print", "Guidelines"],
    },
    {
      n: "04",
      title: "Design audits",
      blurb: "Five working days. I tear the surface apart and hand back a prioritized list with mockups.",
      tags: ["Audit", "Heuristics", "Roadmap"],
    },
  ];
  return (
    <section id="services" className="services" data-screen-label="03 Services">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>02</span><span className="bar"></span><span>What I do</span>
        </div>
        <h2 className="section-title">
          Four ways we can <em style={{ color: accent }}>work together</em>.
        </h2>
      </div>
      <div className="services-grid">
        {services.map((s) => (
          <div key={s.n} className="svc">
            <div className="svc-num" style={{ color: accent }}>{s.n}</div>
            <h3 className="svc-title" dangerouslySetInnerHTML={{ __html: s.title }}></h3>
            <p className="svc-blurb">{s.blurb}</p>
            <div className="svc-tags">
              {s.tags.map((t) => <span key={t}>{t}</span>)}
            </div>
            <div className="svc-arrow">→</div>
          </div>
        ))}
      </div>
    </section>
  );
}
