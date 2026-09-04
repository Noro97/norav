import { useEffect, useState } from 'react';

export function NowPlaying({ accent }) {
  const [bars, setBars] = useState([0.5, 0.8, 0.3]);
  useEffect(() => {
    const t = setInterval(() => {
      setBars([Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2]);
    }, 240);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="now-playing">
      <div className="np-cover">
        <div className="np-cover-art" style={{ background: accent }}>
          <span>♪</span>
        </div>
      </div>
      <div className="np-info">
        <div className="np-status">
          <div className="np-bars">
            {bars.map((h, i) => (
              <span key={i} style={{ height: `${h * 100}%`, background: accent }}></span>
            ))}
          </div>
          <span>NOW PLAYING</span>
        </div>
        <div className="np-track">Drowsy — Banks</div>
        <div className="np-album">Studio mix · Vol. 14</div>
      </div>
    </div>
  );
}
