import { useState } from 'react';

export function BriefAssistant({ accent }) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const suggestions = [
    "Marketing site for a B2B SaaS",
    "Mobile app onboarding flow",
    "Brand identity for a podcast",
    "Dashboard redesign",
  ];
  const handleSubmit = () => {
    if (!text.trim()) return;
    setSubmitted(true);
  };
  const reset = () => { setSubmitted(false); setText(""); };

  return (
    <section className="brief" data-screen-label="Brief assistant">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>◐</span><span className="bar"></span><span>Brief assistant — beta</span>
        </div>
        <h2 className="section-title">
          Tell me about it. <em style={{ color: accent }}>I'll estimate.</em>
        </h2>
      </div>
      <div className="brief-card" style={{ borderColor: submitted ? accent : "var(--line)" }}>
        {!submitted ? (
          <>
            <div className="brief-input-row">
              <textarea
                className="brief-input"
                placeholder="A two-sentence description of what you're building…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
              />
            </div>
            <div className="brief-suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="brief-chip" onClick={() => setText(s)}>
                  {s}
                </button>
              ))}
            </div>
            <div className="brief-actions">
              <div className="brief-tools">
                <button className="brief-tool" title="Attach"><span>+</span></button>
                <button className="brief-tool" title="Voice"><span>◉</span></button>
                <button className="brief-tool" title="Reference"><span>↗</span></button>
              </div>
              <button
                className="brief-submit"
                style={{ background: accent }}
                onClick={handleSubmit}
                disabled={!text.trim()}
              >
                Estimate <span>→</span>
              </button>
            </div>
          </>
        ) : (
          <div className="brief-result">
            <div className="brief-thinking">
              <span className="brief-dot" style={{ background: accent }}></span>
              <span className="brief-dot" style={{ background: accent, animationDelay: "0.2s" }}></span>
              <span className="brief-dot" style={{ background: accent, animationDelay: "0.4s" }}></span>
              <span className="brief-thinking-label">Thinking…</span>
            </div>
            <div className="brief-output">
              <div className="brief-output-row">
                <span className="brief-output-key">Scope</span>
                <span className="brief-output-val">Mid — 2 surfaces, ~12 screens</span>
              </div>
              <div className="brief-output-row">
                <span className="brief-output-key">Timeline</span>
                <span className="brief-output-val">6 weeks, starting Q3</span>
              </div>
              <div className="brief-output-row">
                <span className="brief-output-key">Range</span>
                <span className="brief-output-val" style={{ color: accent, fontFamily: "var(--serif)", fontSize: "22px" }}>
                  $32k — $48k
                </span>
              </div>
              <div className="brief-output-row">
                <span className="brief-output-key">Confidence</span>
                <span className="brief-output-val">Medium · I'd want a 30-min call to tighten this</span>
              </div>
            </div>
            <div className="brief-result-actions">
              <button className="brief-link" onClick={reset}>← New estimate</button>
              <button className="brief-cta" style={{ background: accent }}>Book the call →</button>
            </div>
          </div>
        )}
      </div>
      <p className="brief-disclaimer">Not a real AI — just a thoughtful estimator. The number's still based on the brief, though.</p>
    </section>
  );
}
