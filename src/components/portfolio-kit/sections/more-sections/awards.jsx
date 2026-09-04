export function Awards({ accent }) {
  const awards = [
    { org: "Awwwards", count: "11", label: "Site of the Day" },
    { org: "Webby", count: "1", label: "Winner · Financial" },
    { org: "FWA", count: "4", label: "Site of the Day" },
    { org: "Communication Arts", count: "2", label: "Featured" },
    { org: "Type Directors Club", count: "1", label: "Certificate of Excellence" },
  ];
  return (
    <section className="awards" data-screen-label="Awards">
      <div className="awards-inner">
        <div className="awards-side">
          <div className="section-eyebrow">
            <span>♢</span><span className="bar"></span><span>Recognition</span>
          </div>
          <h2 className="section-title">Trophies <em style={{ color: accent }}>collect dust</em>.</h2>
          <p className="awards-blurb">
            But they're a useful proxy. Here's what the work has picked up over the years — included for the recruiters and creative directors who skim.
          </p>
        </div>
        <div className="awards-list">
          {awards.map((a, i) => (
            <div key={i} className="award-row">
              <div className="award-count" style={{ color: accent }}>×{a.count}</div>
              <div className="award-meta">
                <div className="award-org">{a.org}</div>
                <div className="award-label">{a.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
