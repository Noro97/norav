import { useState } from 'react';

export function ShowReel({ accent }) {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="reel" data-screen-label="Showreel">
      <div className="reel-frame" role="button" tabIndex={0} aria-label={playing ? "Pause reel" : "Play reel"} onClick={() => setPlaying((p) => !p)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPlaying((p) => !p); } }}>
        <div className="reel-bg">
          <div className="reel-rings">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="reel-ring" style={{
                borderColor: i === 0 ? accent : `${accent}55`,
                animationDelay: `${i * 0.4}s`,
              }}/>
            ))}
          </div>
        </div>
        <div className="reel-content">
          <div className="reel-eyebrow">
            <span className="dot" style={{ background: accent }}></span>
            <span>2026 SHOWREEL · 02:14</span>
          </div>
          <button className={`reel-play ${playing ? "playing" : ""}`} style={{ background: accent }}>
            {playing ? (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="6" y="4" width="3" height="14" fill="currentColor"/>
                <rect x="13" y="4" width="3" height="14" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M6 4 L18 11 L6 18 Z" fill="currentColor"/>
              </svg>
            )}
          </button>
          <h2 className="reel-title">A two-minute<br/>tour of the work.</h2>
          <p className="reel-sub">Cut from 11 case studies. Soundtracked.</p>
        </div>
        <div className="reel-corner-tl">REEL · 04</div>
        <div className="reel-corner-tr">{playing ? "● PLAYING" : "○ PAUSED"}</div>
        <div className="reel-corner-bl">{playing ? "00:32" : "00:00"} / 02:14</div>
        <div className="reel-corner-br">SHOT IN BROOKLYN</div>
      </div>
    </section>
  );
}
