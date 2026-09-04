import { useState } from 'react';
import { withDefaults } from '../../content';

export const DEFAULTS = {
  headNumber: '07',
  headLabel: 'Common questions',
  title: "Everything you'd ask",
  titleAccent: 'on the call',
  titleTail: '.',
  items: [
    { q: 'Do you work with early-stage startups?', a: 'Yes — about half my engagements are pre-Series A. I take a small number of these per year at reduced rates if the work is interesting and the team is real.' },
    { q: 'Can you embed with our existing design team?', a: "That's most of what I do. I plug in as a senior IC or fractional lead, run crit, and unblock specific surfaces. I work in your Figma, your Slack, your rituals." },
    { q: 'What if we need engineering too?', a: 'I work alongside two trusted dev shops and a handful of independent engineers. Happy to introduce or co-quote when it makes sense.' },
    { q: 'How do you handle NDAs?', a: 'Standard mutual NDA, signed before the first call. Around half the work in my portfolio is unshowable publicly — happy to walk you through it privately.' },
    { q: 'What does ownership look like?', a: 'You own everything I make for you, full stop. I keep the right to show approved work in my portfolio after launch.' },
    { q: 'Can you start next week?', a: 'Sometimes. My booking horizon is usually 6–10 weeks out — get on a call early so we can hold a slot.' },
  ],
};

export function FAQ({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="faq" data-screen-label="07 FAQ">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>{c.headNumber}</span><span className="bar"></span><span>{c.headLabel}</span>
        </div>
        <h2 className="section-title">
          {c.title}{" "}<em style={{ color: accent }}>{c.titleAccent}</em>{c.titleTail}
        </h2>
      </div>
      <div className="faq-list">
        {c.items.map((it, i) => (
          <div key={i} className={`faq-item ${open === i ? "faq-open" : ""}`}>
            <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
              <span className="faq-num" style={{ color: accent }}>{String(i+1).padStart(2,"0")}</span>
              <span className="faq-text">{it.q}</span>
              <span className="faq-toggle" style={{ color: accent }}>{open === i ? "—" : "+"}</span>
            </button>
            <div className="faq-a"><p>{it.a}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
