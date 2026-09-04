import { useState } from 'react';

export function TypeTester({ accent }) {
  const [weight, setWeight] = useState(400);
  const [size, setSize] = useState(96);
  const [tracking, setTracking] = useState(-2);
  const [text, setText] = useState("Designed in Brooklyn");

  return (
    <section className="type-tester" data-screen-label="Type tester">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>Aa</span><span className="bar"></span><span>Type playground · drag the sliders</span>
        </div>
      </div>
      <div className="tt-stage">
        <div
          className="tt-canvas"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setText(e.currentTarget.textContent)}
          style={{
            fontWeight: weight,
            fontSize: `${size}px`,
            letterSpacing: `${tracking / 100}em`,
          }}
        >
          {text}
        </div>
        <div className="tt-controls">
          <div className="tt-control">
            <div className="tt-label">
              <span>Weight</span>
              <span style={{ color: accent }}>{weight}</span>
            </div>
            <input type="range" min="100" max="900" step="100" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="tt-slider" style={{ accentColor: accent }} />
            <div className="tt-ticks">
              {[100, 300, 500, 700, 900].map(w => <span key={w}>{w}</span>)}
            </div>
          </div>
          <div className="tt-control">
            <div className="tt-label">
              <span>Size</span>
              <span style={{ color: accent }}>{size}px</span>
            </div>
            <input type="range" min="32" max="200" value={size} onChange={(e) => setSize(Number(e.target.value))} className="tt-slider" style={{ accentColor: accent }} />
          </div>
          <div className="tt-control">
            <div className="tt-label">
              <span>Tracking</span>
              <span style={{ color: accent }}>{(tracking / 100).toFixed(2)}em</span>
            </div>
            <input type="range" min="-8" max="20" value={tracking} onChange={(e) => setTracking(Number(e.target.value))} className="tt-slider" style={{ accentColor: accent }} />
          </div>
        </div>
        <div className="tt-foot">
          <span>↑ click the headline to edit</span>
          <span>·</span>
          <span>specimen: GT Sectra Display</span>
        </div>
      </div>
    </section>
  );
}
