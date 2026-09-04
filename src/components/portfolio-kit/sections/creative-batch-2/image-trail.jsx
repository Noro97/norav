import { useRef } from 'react';

const POOL = 16;
const PALETTE = ["#ff7fbf", "#7fffc4", "#ffd47f", "#7fcfff", "#c4a8ff"];
const TRAIL_KEYFRAMES = [
  { opacity: 0.8, transform: 'translate(-50%, -50%) scale(1)' },
  { opacity: 0, transform: 'translate(-50%, -50%) scale(0.4)' },
];
const TRAIL_OPTS = { duration: 800, easing: 'ease-out', fill: 'forwards' };

export function ImageTrail({ accent }) {
  const ref = useRef(null);
  const pool = useRef([]);
  const head = useRef(0);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const i = head.current++;
    const slot = pool.current[i % POOL];
    if (!slot) return;
    const color = i % (PALETTE.length + 1) === PALETTE.length ? accent : PALETTE[i % PALETTE.length];
    slot.style.left = `${e.clientX - r.left}px`;
    slot.style.top = `${e.clientY - r.top}px`;
    slot.style.background = color;
    if (typeof slot.animate === 'function') {
      slot.animate(TRAIL_KEYFRAMES, TRAIL_OPTS);
    }
  };

  return (
    <section className="trail" data-screen-label="Trail" ref={ref} onMouseMove={onMove}>
      <h2 className="trail-headline">
        Brooklyn-based.<br/>
        <em style={{ color: accent }}>Globally-shipped.</em>
      </h2>
      <p className="trail-sub">Move your cursor through the headline</p>
      {Array.from({ length: POOL }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { pool.current[i] = el; }}
          className="trail-blob"
          style={{ animation: 'none', opacity: 0 }}
        ></div>
      ))}
    </section>
  );
}
