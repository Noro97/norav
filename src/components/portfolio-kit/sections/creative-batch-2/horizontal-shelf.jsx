import { useEffect, useRef } from 'react';

export function HorizontalShelf({ accent }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e) => {
      // Only hijack when section is genuinely in the viewport
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const max = el.scrollWidth - el.clientWidth;
      if ((e.deltaY > 0 && el.scrollLeft < max) || (e.deltaY < 0 && el.scrollLeft > 0)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const items = [
    { tag: "01", title: "Linear.Wave", note: "Marketing site · 2025", color: "#ff6b9d" },
    { tag: "02", title: "Spool iOS", note: "App refresh · 2024", color: "#7fffc4" },
    { tag: "03", title: "Atlas DS", note: "Design system · 2024", color: "#ffd47f" },
    { tag: "04", title: "Method Bank", note: "Fintech rebrand · 2023", color: "#7fcfff" },
    { tag: "05", title: "Cosmic FM", note: "Podcast network · 2023", color: "#c4a8ff" },
    { tag: "06", title: "Loom Garden", note: "Brand system · 2022", color: "#f5efe6" },
  ];

  return (
    <section className="hshelf" data-screen-label="Horizontal shelf">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>↔</span><span className="bar"></span><span>Scroll · uses your wheel horizontally</span>
        </div>
        <h2 className="section-title">
          Six more, <em style={{ color: accent }}>side by side</em>.
        </h2>
      </div>
      <div ref={ref} className="hshelf-track">
        {items.map((it, i) => (
          <div key={i} className="hshelf-card">
            <div className="hshelf-img" style={{ background: it.color }}>
              <span className="hshelf-num">{it.tag}</span>
            </div>
            <div className="hshelf-meta">
              <h3>{it.title}</h3>
              <p>{it.note}</p>
            </div>
          </div>
        ))}
        <div className="hshelf-end">
          <div className="hshelf-end-arrow">→</div>
          <p>That's all for now.<br/><a href="#">See archive</a></p>
        </div>
      </div>
      <p className="hshelf-hint">Scroll inside the row · or drag</p>
    </section>
  );
}
