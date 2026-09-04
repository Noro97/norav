import { useRef } from 'react';

export function MagneticCTA({ accent }) {
  const ref = useRef(null);

  const writePos = (x, y) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
  };

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 24;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 24;
    writePos(x, y);
  };
  const reset = () => writePos(0, 0);

  return (
    <section className="magnetic" data-screen-label="Magnetic CTA">
      <div
        ref={ref}
        className="magnetic-panel"
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ borderColor: accent, '--mx': '0px', '--my': '0px' }}
      >
        <div className="magnetic-bg">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="magnetic-line"
              style={{
                top: `${i * 9}%`,
                background: accent,
                transform: `translateX(calc(var(--mx) * ${i % 3 ? 1.5 : -1}))`,
              }}
            ></div>
          ))}
        </div>
        <div
          className="magnetic-content"
          style={{ transform: 'translate(calc(var(--mx) * 0.3), calc(var(--my) * 0.3))' }}
        >
          <div className="magnetic-eye">
            <div
              className="magnetic-eyeball"
              style={{ background: accent, transform: 'translate(calc(var(--mx) * 0.4), calc(var(--my) * 0.4))' }}
            ></div>
          </div>
          <h2 className="magnetic-title">
            Still here?<br/>
            <em style={{ color: accent }}>Let's talk.</em>
          </h2>
          <p className="magnetic-sub">
            One link. One reply within 24 hours. <br />
            Move your cursor — the panel follows.
          </p>
          <button className="magnetic-btn" style={{ background: accent }}>
            Start a brief →
          </button>
        </div>
      </div>
    </section>
  );
}
