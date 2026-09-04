import { useEffect, useState } from 'react';

export function AnimatedSub({ accent }) {
  const [val, setVal] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const placeholders = [
    "you@studio.com",
    "founder@startup.io",
    "creative@agency.co",
    "hi@yourname.com",
  ];
  const [phIdx, setPhIdx] = useState(0);
  useEffect(() => {
    if (val) return;
    const t = setInterval(() => setPhIdx(i => (i + 1) % placeholders.length), 2400);
    return () => clearInterval(t);
  }, [val]);
  return (
    <section className="anim-sub" data-screen-label="Subscribe">
      <div className="anim-sub-inner">
        <div className="anim-sub-eyebrow">
          <span style={{ background: accent }} className="anim-sub-pulse"></span>
          <span>FIELD NOTES — A LETTER, ONCE A MONTH</span>
        </div>
        <h2 className="anim-sub-title">
          Notes from the studio,<br/>
          <em style={{ color: accent }}>delivered slowly.</em>
        </h2>
        <div className="anim-sub-form">
          <div className="anim-sub-input-wrap" style={{ borderColor: submitted ? accent : "var(--line)" }}>
            {!val && (
              <div className="anim-sub-placeholder" key={phIdx}>
                {placeholders[phIdx]}
              </div>
            )}
            <input
              type="email"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="anim-sub-input"
            />
          </div>
          <button
            className="anim-sub-submit"
            style={{ background: accent }}
            onClick={() => val && setSubmitted(true)}
          >
            {submitted ? "Subscribed ✓" : "Subscribe →"}
          </button>
        </div>
        <p className="anim-sub-note">2,400+ subscribers · Unsubscribe in one click · Last issue: <a href="#">Apr 14, "Why I stopped charging hourly"</a></p>
      </div>
    </section>
  );
}
