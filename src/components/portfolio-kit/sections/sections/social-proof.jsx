const clients = [
  { name: 'LINEAR.WAVE', note: 'Series B fintech' },
  { name: '▲ NORTHBOUND', note: 'Climate startup' },
  { name: 'SPOOL', note: 'Y Combinator W24' },
  { name: 'ATLAS DS', note: 'Design system' },
  { name: 'METHOD BANK', note: 'Fintech rebrand' },
  { name: 'COSMIC FM', note: 'Podcast network' },
];

/* duplicate for seamless loop */
const track = [...clients, ...clients, ...clients];

export function SocialProof() {
  return (
    <section className="proof" data-screen-label="02 Social Proof">
      <div className="proof-label">
        <span className="tick">◇</span>
        <span>Trusted by teams at</span>
      </div>
      <div className="proof-marquee-wrap">
        <div className="proof-marquee-track">
          {track.map((c, i) => (
            <div key={i} className="proof-marquee-item">
              <span className="proof-name">{c.name}</span>
              <span className="proof-note">{c.note}</span>
              <span className="proof-sep">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
