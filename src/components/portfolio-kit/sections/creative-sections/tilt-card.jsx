import { useRef, useState } from 'react';

export function TiltCard({ card, accent }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({
      x: (py - 0.5) * -16,
      y: (px - 0.5) * 16,
      gx: px * 100,
      gy: py * 100,
    });
  };
  const reset = () => setTilt({ x: 0, y: 0, gx: 50, gy: 50 });
  return (
    <div
      ref={ref}
      className="tilt-card"
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
    >
      <div className="tilt-bg" style={{ background: card.tone }}></div>
      <div
        className="tilt-shine"
        style={{
          background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.4), transparent 60%)`,
        }}
      ></div>
      <div className="tilt-glyph">{card.glyph}</div>
      <div className="tilt-meta">
        <div className="tilt-year">{card.year}</div>
        <h3 className="tilt-title">{card.title}</h3>
        <div className="tilt-role">{card.role}</div>
      </div>
      <div className="tilt-pill" style={{ background: accent }}>View case →</div>
    </div>
  );
}
