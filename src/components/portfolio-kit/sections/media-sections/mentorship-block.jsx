export function MentorshipBlock({ accent }) {
  const classes = [
    { name: "Beginner", blurb: "For those who are just learning design.", featured: false },
    { name: "Expert", blurb: "For those who want to upgrade their skill.", featured: true },
    { name: "Senior IC", blurb: "For those who lead but want to make again.", featured: false },
  ];
  return (
    <section className="mentor" data-screen-label="Mentorship">
      <div className="mentor-card">
        <div className="mentor-headline">
          <div className="hash" style={{ color: accent }}>#</div>
          <h2>
            LEVEL UP YOUR<br/>
            DESIGN WITH OUR<br/>
            <span className="outline">MENTOR PROGRAM</span>
          </h2>
          <div className="doodle doodle-arrow" style={{ color: accent }}>
            <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
              <path d="M5 30 Q 30 5, 60 25 T 75 50" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M70 45 L 75 50 L 70 55" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="doodle doodle-squiggle" style={{ color: accent }}>
            <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
              <path d="M5 20 Q 15 5, 25 20 T 45 20 T 55 20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div className="mentor-meta">
          <div>
            <div className="mentor-stat">With more than</div>
            <div className="mentor-num">2K+ Members</div>
            <div className="mentor-num">500+ Tutorials</div>
          </div>
          <a href="#contact" className="mentor-join">
            Join us
            <span className="join-arrow" style={{ background: accent }}>→</span>
          </a>
        </div>
        <div className="mentor-illos">
          {[1,2,3].map(i => (
            <div key={i} className="illo">
              <svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMid slice">
                <rect width="200" height="260" fill={i===2 ? accent + '22' : 'oklch(0.95 0.005 80)'} stroke="#222" strokeWidth="1"/>
                <circle cx="100" cy="80" r="28" fill="oklch(0.85 0.04 60)" stroke="#222" strokeWidth="1.5"/>
                <rect x="80" y="105" width="40" height="60" fill={i===1 ? accent : i===2 ? "#ffd47f" : "oklch(0.75 0.1 200)"} stroke="#222" strokeWidth="1.5"/>
                <rect x="40" y="180" width="120" height="6" fill="#222"/>
                <rect x="40" y="186" width="120" height="40" fill="oklch(0.8 0.04 60)" stroke="#222" strokeWidth="1"/>
                <rect x="60" y="200" width="40" height="20" fill="#fff" stroke="#222" strokeWidth="1"/>
                <text x="100" y="50" textAnchor="middle" fontSize="14" fill="#222" fontFamily="sans-serif" fontWeight="700">{["WORK","MAKE","LEARN"][i-1]}</text>
              </svg>
            </div>
          ))}
        </div>
        <div className="mentor-classes">
          <div className="mentor-classes-head">
            <h3>Our Classes</h3>
            <p>Three tiers — pick the one that meets you where you are.</p>
          </div>
          <div className="classes-row">
            {classes.map((c) => (
              <div key={c.name} className={`class-card ${c.featured ? "class-featured" : ""}`} style={c.featured ? { background: accent } : {}}>
                <div className="class-arrow" style={c.featured ? { color: '#1a1a1a' } : {}}>↗</div>
                <h4>{c.name}<br/>Class</h4>
                <p>{c.blurb}</p>
                <div className="class-illo">
                  <svg viewBox="0 0 100 60" fill="none">
                    <rect x="10" y="20" width="80" height="35" fill={c.featured ? '#1a1a1a' : '#222'} opacity="0.9"/>
                    <rect x="40" y="55" width="20" height="3" fill={c.featured ? '#1a1a1a' : '#222'}/>
                    <circle cx="30" cy="36" r="6" fill={c.featured ? accent : '#ffd47f'}/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
          <div className="mentor-quote">
            KEEP <em style={{ color: accent }}>CREATING</em> UNTIL YOU
            <br/>FIND YOUR OWN <em style={{ color: accent }}>AUDIENCE</em>
          </div>
          <div className="mentor-attrib">— Maya Okafor, Studio founder</div>
        </div>
      </div>
    </section>
  );
}
