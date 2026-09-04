export function SpinningSticker({ accent }) {
  const text = "AVAILABLE MAY 2026 · BROOKLYN STUDIO ·";
  const chars = text.split("");
  return (
    <a href="#contact" className="sticker" style={{ borderColor: accent }}>
      <div className="sticker-spin">
        {chars.map((c, i) => (
          <span
            key={i}
            className="sticker-char"
            style={{
              transform: `translate(-50%, -50%) rotate(${(360 / chars.length) * i}deg) translateY(-44px)`,
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="sticker-center" style={{ background: accent }}>
        <span>↗</span>
      </div>
    </a>
  );
}
