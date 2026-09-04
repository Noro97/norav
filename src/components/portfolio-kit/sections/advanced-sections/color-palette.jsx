import { useState } from 'react';

export function ColorPalette({ accent }) {
  const [copied, setCopied] = useState(null);
  const palette = [
    { name: "Bone", hex: "#F5EFE6", role: "Background" },
    { name: "Ink", hex: "#1A1A1A", role: "Foreground" },
    { name: "Cobalt", hex: "#3045FF", role: "Accent" },
    { name: "Punch", hex: "#FF4D7A", role: "Highlight" },
    { name: "Citrus", hex: "#FFD447", role: "Caution" },
    { name: "Mint", hex: "#12D3AD", role: "Confirm" },
    { name: "Ash", hex: "#6B6B6B", role: "Muted" },
    { name: "Smoke", hex: "#2E2E2E", role: "Surface 2" },
  ];
  const copy = (hex) => {
    navigator.clipboard?.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1400);
  };
  return (
    <section className="palette" data-screen-label="Color palette">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>◐</span><span className="bar"></span><span>Studio palette · click to copy</span>
        </div>
        <h2 className="section-title">
          Eight colors. <em style={{ color: accent }}>Used carefully.</em>
        </h2>
      </div>
      <div className="palette-grid">
        {palette.map((c, i) => (
          <button
            key={i}
            className="palette-swatch"
            style={{ background: c.hex }}
            onClick={() => copy(c.hex)}
          >
            <div className="palette-meta" style={{ color: c.hex === "#F5EFE6" || c.hex === "#FFD447" ? "#1a1a1a" : "#fff" }}>
              <div className="palette-name">{c.name}</div>
              <div className="palette-hex">{c.hex}</div>
              <div className="palette-role">{c.role}</div>
            </div>
            <div className={`palette-copied ${copied === c.hex ? "show" : ""}`}>Copied ✓</div>
          </button>
        ))}
      </div>
    </section>
  );
}
