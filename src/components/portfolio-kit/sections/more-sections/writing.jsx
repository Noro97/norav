export function Writing({ accent }) {
  const posts = [
    { date: "Apr 2026", reads: "8 min", title: "Why I stopped charging hourly", excerpt: "After eight years of design contracts, the hourly model finally broke. Here's what replaced it." },
    { date: "Feb 2026", reads: "12 min", title: "Motion grammar for product teams", excerpt: "A short manual for designers and engineers who want their interfaces to feel intentional in motion." },
    { date: "Dec 2025", reads: "5 min", title: "The brief that wrote itself", excerpt: "Anatomy of a Slack message that turned into a six-month engagement and a Webby." },
  ];
  return (
    <section className="writing" data-screen-label="Writing">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>✎</span><span className="bar"></span><span>Field notes — recent writing</span>
        </div>
        <h2 className="section-title">
          Three pieces <em style={{ color: accent }}>worth your time</em>.
        </h2>
      </div>
      <div className="writing-grid">
        {posts.map((p, i) => (
          <a key={i} href="#" className="post" onClick={(e) => e.preventDefault()}>
            <div className="post-meta">
              <span>{p.date}</span><span className="dot-sep">·</span><span>{p.reads}</span>
            </div>
            <h3>{p.title}</h3>
            <p>{p.excerpt}</p>
            <div className="post-link" style={{ color: accent }}>
              Read essay <span>→</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
