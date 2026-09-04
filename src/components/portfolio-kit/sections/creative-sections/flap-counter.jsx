import { useEffect, useRef, useState } from 'react';

export function FlapCounter({ accent }) {
  const targets = [
    { label: "Projects shipped", value: 127, suffix: "" },
    { label: "Avg satisfaction", value: 4.9, suffix: "/5", decimals: 1 },
    { label: "Hours not billed", value: 0, suffix: "" },
    { label: "Years independent", value: 8, suffix: "" },
  ];
  const [animated, setAnimated] = useState(false);
  const [vals, setVals] = useState(targets.map(() => 0));
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animated) {
        setAnimated(true);
        targets.forEach((t, i) => {
          let start = 0;
          const dur = 1400;
          const startT = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - startT) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = start + (t.value - start) * eased;
            setVals(prev => { const n = [...prev]; n[i] = v; return n; });
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [animated]);

  return (
    <section ref={ref} className="flap" data-screen-label="Counter">
      <div className="flap-grid">
        {targets.map((t, i) => (
          <div key={i} className="flap-cell">
            <div className="flap-value" style={{ color: accent }}>
              {t.decimals ? vals[i].toFixed(t.decimals) : Math.round(vals[i])}
              <span className="flap-suffix">{t.suffix}</span>
            </div>
            <div className="flap-label">{t.label}</div>
            <div className="flap-bar">
              <div className="flap-bar-fill" style={{ background: accent, width: `${animated ? 100 : 0}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
