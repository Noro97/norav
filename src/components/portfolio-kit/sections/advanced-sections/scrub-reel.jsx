import { useState } from 'react';

export function ScrubReel({ accent }) {
  const [t, setT] = useState(50);
  const moments = [
    { year: 2018, label: "First client", scene: "🌱" },
    { year: 2020, label: "Atelier Six", scene: "▲" },
    { year: 2022, label: "Linear.Wave", scene: "◆" },
    { year: 2024, label: "Webby win", scene: "★" },
    { year: 2026, label: "Studio v04", scene: "◉" },
  ];
  const idx = Math.min(moments.length - 1, Math.floor((t / 100) * moments.length));
  const m = moments[idx];
  const yearDisplay = 2018 + Math.round((t / 100) * 8);

  return (
    <section className="scrub" data-screen-label="Scrub reel">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>↔</span><span className="bar"></span><span>Eight years, one slider</span>
        </div>
      </div>
      <div className="scrub-stage">
        <div className="scrub-year" style={{ color: accent }}>{yearDisplay}</div>
        <div className="scrub-scene" key={idx}>
          <span className="scrub-glyph">{m.scene}</span>
          <span className="scrub-label">{m.label}</span>
        </div>
        <div className="scrub-meter">
          <div className="scrub-track">
            <div className="scrub-fill" style={{ width: `${t}%`, background: accent }}></div>
            {moments.map((mm, i) => (
              <div
                key={i}
                className="scrub-tick"
                style={{ left: `${(i / (moments.length - 1)) * 100}%`, background: i <= idx ? accent : "var(--line)" }}
              ></div>
            ))}
            <input
              type="range"
              min="0"
              max="100"
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              className="scrub-input"
            />
            <div className="scrub-thumb" style={{ left: `${t}%`, borderColor: accent }}>
              <div className="scrub-thumb-dot" style={{ background: accent }}></div>
            </div>
          </div>
          <div className="scrub-labels">
            <span>2018</span>
            <span>2020</span>
            <span>2022</span>
            <span>2024</span>
            <span>2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
