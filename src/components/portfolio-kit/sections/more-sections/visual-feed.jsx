export function VisualFeed({ accent }) {
  const colors = ["#ff7fbf","#7fffc4","#ffd47f","#7fcfff","#c4a8ff","#f5efe6"];
  return (
    <section className="feed" data-screen-label="Feed">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>◉</span><span className="bar"></span><span>Live from the studio · @maya.okafor</span>
        </div>
      </div>
      <div className="feed-row">
        {Array.from({length: 6}).map((_, i) => (
          <div key={i} className="feed-cell">
            <div className="feed-thumb" style={{ background: colors[i] }}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <rect width="100" height="100" fill={colors[i]}/>
                {i % 3 === 0 && <circle cx="50" cy="50" r="28" fill="rgba(0,0,0,0.7)"/>}
                {i % 3 === 1 && <rect x="20" y="20" width="60" height="60" fill="rgba(0,0,0,0.7)" transform="rotate(45 50 50)"/>}
                {i % 3 === 2 && (
                  <g>
                    <rect x="10" y="40" width="80" height="20" fill="rgba(0,0,0,0.8)"/>
                    <text x="50" y="55" textAnchor="middle" fontSize="14" fill={colors[i]} fontFamily="serif" fontStyle="italic">Aa</text>
                  </g>
                )}
              </svg>
            </div>
            <div className="feed-meta">
              <span>♡ {((i+1)*47) % 999}</span>
              <span className="dot-sep">·</span>
              <span>{i+1}d</span>
            </div>
          </div>
        ))}
      </div>
      <div className="feed-cta">
        <a href="#" className="feed-follow" style={{ borderColor: accent, color: accent }}>
          Follow on Instagram →
        </a>
      </div>
    </section>
  );
}
