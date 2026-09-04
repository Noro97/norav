import { useEffect, useRef, useState } from 'react';

export function ChatTestimonials({ accent }) {
  const messages = [
    { from: "client", name: "Lena R.", role: "VP Design, Linear.Wave", text: "Maya's first call had more clarity than three months with our previous studio.", time: "9:14" },
    { from: "studio", text: "Day one, we cut the scope by 40%. That was the call.", time: "9:15" },
    { from: "client", name: "Devon P.", role: "Founder, Spool", text: "The motion grammar she built has shipped on six surfaces. None of them feel busy.", time: "10:02" },
    { from: "studio", text: "Motion isn't decoration — it's how we tell users where they are.", time: "10:04" },
    { from: "client", name: "Priya N.", role: "PM, Atlas", text: "We expected a deck. We got a working component library and three engineers re-onboarded.", time: "14:48" },
    { from: "studio", text: "Decks are receipts. The library is the deliverable.", time: "14:50" },
  ];
  const [visible, setVisible] = useState(0);
  const ref = useRef(null);
  const timeoutsRef = useRef([]);
  const startedRef = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !startedRef.current) {
        startedRef.current = true;
        messages.forEach((_, i) => {
          const id = setTimeout(() => setVisible((v) => v + 1), i * 350);
          timeoutsRef.current.push(id);
        });
      }
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [messages.length]);

  return (
    <section ref={ref} className="chat-test" data-screen-label="Chat testimonials">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>◌</span><span className="bar"></span><span>Recent threads · #studio-feedback</span>
        </div>
        <h2 className="section-title">
          What clients <em style={{ color: accent }}>actually say</em>.
        </h2>
      </div>
      <div className="chat-stream">
        {messages.map((m, i) => {
          const shown = i < visible;
          return (
            <div
              key={i}
              className={`chat-msg chat-msg-${m.from}`}
              style={{
                opacity: shown ? 1 : 0,
                transform: shown ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 400ms ease, transform 400ms ease',
                pointerEvents: shown ? 'auto' : 'none',
              }}
              aria-hidden={!shown}
            >
              {m.from === "client" && (
                <div className="chat-avatar" style={{ background: ["#ff7fbf","#7fffc4","#ffd47f"][i % 3] }}>
                  {m.name?.[0]}
                </div>
              )}
              <div className="chat-bubble" style={m.from === "studio" ? { background: accent, color: "#1a1a1a" } : {}}>
                {m.from === "client" && (
                  <div className="chat-meta">
                    <span className="chat-name">{m.name}</span>
                    <span className="chat-role">{m.role}</span>
                  </div>
                )}
                <p>{m.text}</p>
                <span className="chat-time">{m.time}</span>
              </div>
            </div>
          );
        })}
        {visible < messages.length && (
          <div className="chat-typing">
            <span className="chat-dot" style={{ background: accent }}></span>
            <span className="chat-dot" style={{ background: accent, animationDelay: "0.15s" }}></span>
            <span className="chat-dot" style={{ background: accent, animationDelay: "0.3s" }}></span>
          </div>
        )}
      </div>
    </section>
  );
}
