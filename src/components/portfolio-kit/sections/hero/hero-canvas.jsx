import { useEffect, useRef } from 'react';

export function HeroCanvas({ accent, density }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let cells = [];

    const glyphs = ["+", "·", "—", "○", "△", "/", "\\", "×"];
    const cell = density; // px

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      cells = [];
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          cells.push({
            x: i * cell + cell / 2,
            y: j * cell + cell / 2,
            g: glyphs[(i * 7 + j * 13) % glyphs.length],
            phase: ((i + j) % 8) / 8,
          });
        }
      }
    }
    resize();
    window.addEventListener("resize", resize);

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    }
    function onLeave() {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999; mouseRef.current.y = -9999;
    }
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove", (e) => {
      if (e.touches[0]) onMove(e.touches[0]);
    }, { passive: true });

    let t0 = performance.now();
    function tick(now) {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.font = "11px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const radius = 180;

      for (const c of cells) {
        const dx = c.x - mx;
        const dy = c.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / radius);
        const wobble = Math.sin(t * 0.6 + c.phase * Math.PI * 2) * 0.5 + 0.5;
        const baseAlpha = 0.06 + wobble * 0.04;
        const alpha = baseAlpha + influence * 0.55;
        const offsetX = influence * (dx / dist || 0) * -8;
        const offsetY = influence * (dy / dist || 0) * -8;

        if (influence > 0.05) {
          ctx.fillStyle = accent;
          ctx.globalAlpha = alpha;
        } else {
          ctx.fillStyle = "#f5efe6";
          ctx.globalAlpha = alpha;
        }
        ctx.fillText(c.g, c.x + offsetX, c.y + offsetY);
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [accent, density]);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}
