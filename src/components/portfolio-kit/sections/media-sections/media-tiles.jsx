import { TilePattern } from './tile-pattern';

export function MediaTiles({ accent }) {
  const tiles = [
    {
      tag: "MOBILE",
      title: "Spool — iOS app",
      logo: "S",
      pattern: "phone",
      logoColor: "#ff7fbf",
    },
    {
      tag: "WEB APP",
      title: "Linear.Wave dashboard",
      logo: "LW",
      pattern: "dashboard",
      logoColor: "#c4a8ff",
    },
    {
      tag: "TOOLING",
      title: "Fieldnote OS desktop",
      logo: "FN",
      pattern: "desktop",
      logoColor: "#ffd47f",
    },
  ];
  return (
    <section className="media-tiles" data-screen-label="Media tiles">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>★</span><span className="bar"></span><span>Surfaces I've shipped</span>
        </div>
        <h2 className="section-title">
          Pick a screen, <em style={{ color: accent }}>any screen</em>.
          <br/><span className="muted">I've probably designed one like it.</span>
        </h2>
      </div>
      <div className="tiles-grid">
        {tiles.map((t, i) => (
          <div key={i} className="tile">
            <div className="tile-tag">{t.tag}</div>
            <div className="tile-frame">
              <TilePattern kind={t.pattern} accent={accent}/>
              <button className="tile-play" aria-label="View case">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 3l7 4-7 4V3z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div className="tile-foot">
              <div className="tile-logo" style={{ background: t.logoColor }}>{t.logo}</div>
              <div className="tile-title">{t.title}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="tiles-cta">
        <button className="btn btn-secondary">See more →</button>
      </div>
    </section>
  );
}
