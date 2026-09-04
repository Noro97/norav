import { withDefaults } from '../../content';
import { SectionHead } from '../../section-head';

export const DEFAULTS = {
  headNumber: '05',
  headLabel: 'Engagement & pricing',
  title: 'Honest pricing.',
  titleAccent: 'No hourly games.',
  titleTail: '',
  featuredTag: 'MOST CHOSEN',
  tiers: [
    {
      n: 'PKG/01',
      name: 'Audit',
      price: '$4,800',
      cycle: 'fixed · 5 days',
      blurb: 'A full review of one product surface with prioritized fixes.',
      features: [
        { label: 'Up to 30 screens reviewed' },
        { label: 'Heuristic write-up + Loom walkthrough' },
        { label: '10 prioritized mockups' },
        { label: '60-min handoff call' },
      ],
      cta: 'Book audit',
      href: '#contact',
      featured: false,
    },
    {
      n: 'PKG/02',
      name: 'Sprint',
      price: '$22,000',
      cycle: 'fixed · 4 weeks',
      blurb: 'Ship one significant feature or surface, end-to-end.',
      features: [
        { label: 'Discovery + research' },
        { label: 'Full IxD + visual design' },
        { label: 'Motion prototype' },
        { label: 'Engineering handoff doc' },
        { label: 'Two weeks Slack support' },
      ],
      cta: 'Reserve sprint',
      href: '#contact',
      featured: true,
    },
    {
      n: 'PKG/03',
      name: 'Fractional',
      price: '$12k/mo',
      cycle: 'monthly · 3-month min',
      blurb: 'Embedded design lead, two days a week.',
      features: [
        { label: 'Hiring + interviewing' },
        { label: 'Weekly design crit' },
        { label: 'Roadmap + system work' },
        { label: 'Anything else you need' },
      ],
      cta: 'Start retainer',
      href: '#contact',
      featured: false,
    },
  ],
};

export function Pricing({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  return (
    <section id="pricing" className="pricing" data-screen-label="05 Pricing">
      <SectionHead
        accent={accent}
        lead={c.headNumber}
        label={c.headLabel}
        title={c.title}
        titleAccent={c.titleAccent}
        titleTail={c.titleTail}
      />
      <div className="pricing-grid">
        {c.tiers.map((t, i) => (
          <div key={i} className={`tier ${t.featured ? "tier-featured" : ""}`}>
            {t.featured && c.featuredTag && <div className="tier-tag" style={{ background: accent }}>{c.featuredTag}</div>}
            <div className="tier-meta">
              <span className="tier-n">{t.n}</span>
              <span className="tier-cycle">{t.cycle}</span>
            </div>
            <h3 className="tier-name">{t.name}</h3>
            <div className="tier-price" style={t.featured ? { color: accent } : {}}>{t.price}</div>
            <p className="tier-blurb">{t.blurb}</p>
            <ul className="tier-features">
              {(t.features ?? []).map((f, j) => (
                <li key={j}><span className="tick" style={{ color: accent }}>✓</span>{f.label}</li>
              ))}
            </ul>
            <a href={t.href || '#contact'} className={`btn ${t.featured ? "btn-primary" : "btn-secondary"}`} style={t.featured ? { background: accent } : {}}>
              {t.cta} →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
