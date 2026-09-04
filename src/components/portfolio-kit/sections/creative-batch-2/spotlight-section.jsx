import { useRef } from 'react';

const MASK = 'radial-gradient(circle 220px at var(--mx) var(--my), #000 0%, transparent 70%)';

export function SpotlightSection({ accent }) {
  const ref = useRef(null);
  const revealRef = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
    if (revealRef.current) revealRef.current.style.opacity = '1';
  };
  const onLeave = () => {
    if (revealRef.current) revealRef.current.style.opacity = '0';
  };

  return (
    <section
      ref={ref}
      className="spotlight"
      data-screen-label="Spotlight"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ '--mx': '-300px', '--my': '-300px' }}
    >
      <div className="spotlight-base">
        <div className="spotlight-static">A short manifesto for the studio</div>
      </div>
      <div
        ref={revealRef}
        className="spotlight-reveal"
        style={{
          maskImage: MASK,
          WebkitMaskImage: MASK,
          background: accent,
          opacity: 0,
        }}
      >
        <div className="spotlight-hidden">Make less, make it count</div>
      </div>
      <div className="spotlight-corner-tl">04 ／ MANIFESTO</div>
      <div className="spotlight-corner-br">↳ MOVE YOUR CURSOR</div>
    </section>
  );
}
