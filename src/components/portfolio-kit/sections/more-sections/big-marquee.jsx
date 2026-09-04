export function BigMarquee({ accent }) {
  const words = ["available", "for hire", "May 2026", "Brooklyn", "remote OK", "EU friendly"];
  const all = [...words, ...words, ...words];
  return (
    <section className="big-marq" data-screen-label="Big marquee">
      <div className="big-marq-track">
        {all.map((w, i) => (
          <span key={i} className="big-marq-word">
            {w}
            <span className="big-marq-star" style={{ color: accent }}>✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}
