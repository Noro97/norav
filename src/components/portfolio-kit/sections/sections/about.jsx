import { useCallback, useEffect, useRef, useState } from 'react';
import { TESTIMONIALS } from './testimonial-data';

const INTERVAL = 7000;

export function About({ accent }) {
  const [idx, setIdx] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const dragRef = useRef({ active: false, startX: 0 });
  const intervalRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % TESTIMONIALS.length);
      startTimeRef.current = Date.now();
    }, INTERVAL);
  }, []);

  /* auto-advance + progress bar RAF */
  useEffect(() => {
    resetTimer();
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress((elapsed / INTERVAL) * 100);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      clearInterval(intervalRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [resetTimer]);

  function goTo(i) {
    setIdx(i);
    startTimeRef.current = Date.now();
    resetTimer();
  }

  function onDown(e) {
    dragRef.current.active = true;
    dragRef.current.startX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    setIsDragging(false);
  }
  function onMove(e) {
    if (!dragRef.current.active) return;
    const x = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - dragRef.current.startX;
    setDragX(x);
    setIsDragging(Math.abs(x) > 6);
  }
  function onUp() {
    if (!dragRef.current.active) return;
    if (dragX < -60) goTo((idx + 1) % TESTIMONIALS.length);
    else if (dragX > 60) goTo((idx - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    dragRef.current.active = false;
    setDragX(0);
    setIsDragging(false);
  }

  return (
    <section id="about" className="about" data-screen-label="04 About">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>04</span>
          <span className="bar"></span>
          <span>About / words from collaborators</span>
        </div>
      </div>
      <div className="about-grid">
        <div className="bio">
          <div className="bio-portrait">
            <div className="portrait-frame" style={{ borderColor: accent }}>
              <div className="portrait-stripes">
                <span>portrait</span>
                <span className="muted">drop a 4:5 image here</span>
              </div>
              <div className="portrait-tag" style={{ background: accent }}>MO — 2026</div>
            </div>
          </div>
          <div className="bio-text">
            <p className="bio-lead">
              I started as a print designer in Lagos, took a long detour through
              motion at a New York studio, and landed in product because I
              liked when things <em>responded back</em>.
            </p>
            <p>
              Today I work with two or three teams a year — usually founders
              with a real engineering bench and a problem worth solving twice.
              I do the work end-to-end: research, IA, IxD, visual, and the
              motion grammar that ties it together.
            </p>
            <ul className="bio-list">
              <li><span>Currently</span><span>Independent — booking May 2026</span></li>
              <li><span>Previously</span><span>Atelier Six, Frog, Pentagram (intern)</span></li>
              <li><span>Tools</span><span>Figma, Origami, After Effects, Cursor</span></li>
              <li><span>Speaks at</span><span>Config, Awwwards Conf, IxDA</span></li>
            </ul>
          </div>
        </div>

        <div
          className={`testimonials ${isDragging ? 'testimonials-dragging' : ''}`}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        >
          <div className="t-header">
            <div className="t-counter">
              <span style={{ color: accent }}>{String(idx + 1).padStart(2, '0')}</span>
              <span className="muted">/ {String(TESTIMONIALS.length).padStart(2, '0')}</span>
            </div>
            <div className="t-drag-hint" aria-hidden="true">
              <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
                <path d="M2 6h24M18 1l5 5-5 5M10 1L5 6l5 5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
              </svg>
            </div>
          </div>

          <div className="t-quote-mark" style={{ color: accent }}>"</div>

          <div className="t-stage">
            {TESTIMONIALS.map((t, i) => {
              const offset = i - idx;
              return (
                <blockquote
                  key={i}
                  className="t-card"
                  aria-hidden={offset !== 0}
                  style={{
                    transform: `translateX(calc(${offset * 100}% + ${offset === 0 ? dragX : 0}px))`,
                    opacity: offset === 0 ? 1 : 0,
                    pointerEvents: offset === 0 ? 'auto' : 'none',
                    transition: isDragging ? 'none' : 'transform 400ms cubic-bezier(0.4,0,0.2,1), opacity 300ms',
                  }}
                >
                  <p>{t.quote}</p>
                  <footer>
                    <div className="t-avatar" style={{ background: t.color, color: '#1a1a1a' }}>{t.avatar}</div>
                    <div>
                      <div className="t-name">{t.name}</div>
                      <div className="t-role">{t.role}</div>
                    </div>
                  </footer>
                </blockquote>
              );
            })}
          </div>

          {/* auto-play progress bar */}
          <div className="t-progress-track">
            <div
              className="t-progress-fill"
              style={{ width: `${progress}%`, background: accent }}
            />
          </div>

          <div className="t-controls">
            <button
              onClick={() => goTo((idx - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              aria-label="Previous testimonial"
            >←</button>
            <div className="t-dots" role="tablist" aria-label="Testimonials">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={`Testimonial ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={i === idx ? 'active' : ''}
                  style={i === idx ? { background: accent } : {}}
                />
              ))}
            </div>
            <button
              onClick={() => goTo((idx + 1) % TESTIMONIALS.length)}
              aria-label="Next testimonial"
            >→</button>
          </div>
        </div>
      </div>
    </section>
  );
}
