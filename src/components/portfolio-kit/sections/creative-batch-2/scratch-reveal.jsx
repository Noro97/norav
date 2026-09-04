import { useEffect, useRef, useState } from 'react';

export function ScratchReveal({ accent }) {
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    c.width = c.offsetWidth * 2;
    c.height = c.offsetHeight * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, c.offsetWidth, c.offsetHeight);
    ctx.font = "bold 14px JetBrains Mono, monospace";
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.textAlign = "center";
    for (let y = 30; y < c.offsetHeight; y += 60) {
      for (let x = 0; x < c.offsetWidth; x += 180) {
        ctx.fillText("SCRATCH ME · SCRATCH ME ·", x, y);
      }
    }
  }, [accent]);

  const drawingRef = useRef(false);
  const checkProgress = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let cleared = 0;
    let samples = 0;
    for (let i = 3; i < data.length; i += 400) {
      samples++;
      if (data[i] < 50) cleared++;
    }
    setProgress(Math.min(100, (cleared / samples) * 100));
  };

  const scratch = (e) => {
    const c = canvasRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const cx = e.clientX ?? e.touches?.[0]?.clientX;
    const cy = e.clientY ?? e.touches?.[0]?.clientY;
    if (cx == null || cy == null) return;
    const x = cx - r.left;
    const y = cy - r.top;
    const ctx = c.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fill();
  };

  const onDown = (e) => { drawingRef.current = true; scratch(e); };
  const onMove = (e) => { if (drawingRef.current) { scratch(e); checkProgress(); } };
  const onUp = () => { drawingRef.current = false; checkProgress(); };

  return (
    <section className="scratch" data-screen-label="Scratch reveal">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>✦</span><span className="bar"></span><span>Hidden offer · scratch to reveal</span>
        </div>
      </div>
      <div className="scratch-stage">
        <div className="scratch-bg">
          <div className="scratch-prize">
            <div className="scratch-prize-eyebrow">FIRST-TIME CLIENT</div>
            <h3>20% off the first phase.</h3>
            <p>Mention "scratch" in your first message — through end of Q3 only.</p>
            <div className="scratch-prize-code">CODE · STUDIO20</div>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          className="scratch-canvas"
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        ></canvas>
        <div className="scratch-progress">
          <div className="scratch-progress-track">
            <div className="scratch-progress-fill" style={{ width: `${progress}%`, background: accent }}></div>
          </div>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </section>
  );
}
