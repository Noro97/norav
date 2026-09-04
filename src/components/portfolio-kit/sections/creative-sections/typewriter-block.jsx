import { useEffect, useState } from 'react';

export function TypewriterBlock({ accent }) {
  const phrases = [
    "ship in six weeks",
    "design with motion",
    "stay through launch",
    "say no, often",
    "answer within 24h",
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), 1600);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setPhraseIdx((p) => (p + 1) % phrases.length);
      return;
    }
    const speed = deleting ? 30 : 70;
    const t = setTimeout(() => {
      setText(deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [text, deleting, phraseIdx]);

  return (
    <section className="typer" data-screen-label="Typewriter">
      <div className="typer-inner">
        <div className="section-eyebrow">
          <span>▮</span><span className="bar"></span><span>What I do, on repeat</span>
        </div>
        <h2 className="typer-line">
          <span className="typer-static">Hire me to </span>
          <span className="typer-dynamic" style={{ color: accent }}>{text}</span>
          <span className="typer-caret" style={{ background: accent }}></span>
          <span className="typer-static">.</span>
        </h2>
        <div className="typer-bullets">
          {phrases.map((p, i) => (
            <span
              key={i}
              className={`typer-bullet ${i === phraseIdx ? "active" : ""}`}
              style={i === phraseIdx ? { background: accent, color: "#1a1a1a" } : {}}
            >
              {String(i + 1).padStart(2, "0")} · {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
