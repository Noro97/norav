import { TiltCard } from './tilt-card';

export function TiltShowcase({ accent }) {
  const cards = [
    { title: "Linear.Wave", year: "2025", role: "Marketing site", tone: "#ff6b9d", glyph: "◆" },
    { title: "Spool iOS", year: "2024", role: "App refresh", tone: "#7fffc4", glyph: "▲" },
    { title: "Atlas DS", year: "2024", role: "Design system", tone: "#ffd47f", glyph: "●" },
  ];
  return (
    <section className="tilt-section" data-screen-label="Tilt cards">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>◰</span><span className="bar"></span><span>Featured · hover any card</span>
        </div>
        <h2 className="section-title">
          Three projects, <em style={{ color: accent }}>one feel</em>.
        </h2>
      </div>
      <div className="tilt-grid">
        {cards.map((c, i) => (
          <TiltCard key={i} card={c} accent={accent} />
        ))}
      </div>
    </section>
  );
}
