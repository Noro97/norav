import { useRef, useState } from 'react';
import { ProjectPattern } from './project-pattern';

export function ProjectCard({ p, accent, onHover }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);

  function writeParallax(x, y) {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tx', `${x * -6}px`);
    el.style.setProperty('--ty', `${y * -6}px`);
  }

  function onMove(e) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    writeParallax(x, y);
  }

  function handleEnter() {
    setHover(true);
    onHover?.(p);
  }

  function handleLeave() {
    setHover(false);
    writeParallax(0, 0);
  }

  return (
    <a
      ref={ref}
      href="#"
      className={`card ${hover ? 'card-hover' : ''}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={onMove}
      onClick={(e) => e.preventDefault()}
      aria-label={`${p.title} — ${p.client}, ${p.year}`}
      style={{ '--tx': '0px', '--ty': '0px' }}
    >
      <div className="card-thumb">
        <div
          className="card-thumb-inner"
          style={{
            transform: `scale(${hover ? 1.06 : 1.01}) translate(var(--tx), var(--ty))`,
            transition: hover ? 'transform 80ms linear' : 'transform 600ms cubic-bezier(0.2,0.8,0.2,1)',
            willChange: 'transform',
          }}
        >
          <ProjectPattern kind={p.pattern} color={p.color} accentColor={p.accentColor} />
        </div>

        <div
          className="card-overlay"
          style={{
            opacity: hover ? 1 : 0,
            transition: 'opacity 220ms ease',
          }}
        >
          <div className="card-overlay-tag">
            <span style={{ background: accent }}></span>
            View case study
          </div>
          <div className="card-overlay-arrow" style={{ transform: hover ? 'translate(0,0)' : 'translate(-6px,6px)' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M10 18h16M18 10l8 8-8 8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        <div className="card-num">{p.n}</div>
      </div>

      <div className="card-meta">
        <div className="card-line">
          <h3 className="card-title">{p.title}</h3>
          <span className="card-year">{p.year}</span>
        </div>
        <div className="card-line">
          <span className="card-client">{p.client}</span>
          <div className="card-tags">
            {p.tags.map((t) => <span key={t}>{t}</span>)}
          </div>
        </div>
      </div>
    </a>
  );
}
