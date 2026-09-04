import { useRef, useState } from 'react';

const PROJECTS = [
  { title: "Linear.Wave", year: "2025", role: "Marketing", color: "#ff6b9d" },
  { title: "Spool iOS", year: "2024", role: "App", color: "#7fffc4" },
  { title: "Atlas Design System", year: "2024", role: "System", color: "#ffd47f" },
  { title: "Method Bank", year: "2023", role: "Fintech", color: "#7fcfff" },
  { title: "Cosmic FM", year: "2023", role: "Brand", color: "#c4a8ff" },
  { title: "Loom Garden", year: "2022", role: "Identity", color: "#a4f5b8" },
];

export function HoverPreviewRows({ accent }) {
  const [idx, setIdx] = useState(-1);
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section
      ref={ref}
      className="hover-rows"
      data-screen-label="Hover rows"
      onMouseMove={onMove}
      style={{ '--mx': '0px', '--my': '0px' }}
    >
      <div className="section-head">
        <div className="section-eyebrow">
          <span>◐</span><span className="bar"></span><span>Hover any row</span>
        </div>
        <h2 className="section-title">
          The <em style={{ color: accent }}>full archive</em>.
        </h2>
      </div>
      <div className="hover-rows-list">
        {PROJECTS.map((p, i) => (
          <div
            key={i}
            className="hr-row"
            onMouseEnter={() => setIdx(i)}
            onMouseLeave={() => setIdx(-1)}
          >
            <div className="hr-num">{String(i + 1).padStart(2, "0")}</div>
            <h3 className="hr-title" style={idx === i ? { color: accent } : undefined}>
              {p.title}
            </h3>
            <div className="hr-role">{p.role}</div>
            <div className="hr-year">{p.year}</div>
            <div className="hr-arrow" style={idx === i ? { color: accent, transform: "translateX(8px)" } : undefined}>→</div>
          </div>
        ))}
      </div>
      {idx >= 0 && (
        <div
          className="hr-preview"
          style={{
            left: 'var(--mx)',
            top: 'var(--my)',
            background: PROJECTS[idx].color,
          }}
        >
          <span>{PROJECTS[idx].title}</span>
        </div>
      )}
    </section>
  );
}
