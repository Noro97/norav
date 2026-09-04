export function BentoGrid({ accent }) {
  return (
    <section className="bento" data-screen-label="Bento">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>✦</span><span className="bar"></span><span>Inside the studio</span>
        </div>
        <h2 className="section-title">
          A peek at the <em style={{ color: accent }}>workshop</em>.
        </h2>
      </div>
      <div className="bento-grid">
        <div className="b-cell b-cell-typography">
          <div className="b-tag">FREE</div>
          <h3>Type<br/>specimens</h3>
          <div className="type-stack">
            <div className="type-row" style={{ fontWeight: 300 }}>Light</div>
            <div className="type-row" style={{ fontWeight: 400 }}>Regular</div>
            <div className="type-row" style={{ fontWeight: 500 }}>Medium</div>
            <div className="type-row" style={{ fontWeight: 600 }}>Semibold</div>
            <div className="type-row" style={{ fontWeight: 700 }}>Bold</div>
          </div>
          <div className="type-pill" style={{ background: accent }}>fonts</div>
          <div className="type-aa">Aa</div>
        </div>

        <div className="b-cell b-cell-portrait">
          <div className="portrait-stripes-2">
            <div className="portrait-label">Portrait</div>
            <div className="portrait-sub">A little about me</div>
            <div className="portrait-grid">
              {Array.from({length: 100}).map((_, i) => (
                <span key={i} style={{ opacity: ((i*7)%11)/10 + 0.1, background: i%17===0 ? accent : 'currentColor' }}/>
              ))}
            </div>
          </div>
        </div>

        <div className="b-cell b-cell-print">
          <div className="b-tag">FREE</div>
          <h3>Print<br/>guide</h3>
          <div className="print-mock">
            <div className="print-paper paper-1"></div>
            <div className="print-paper paper-2"></div>
            <div className="print-paper paper-3" style={{ background: accent }}>
              <span>Our Daily<br/>Bread</span>
            </div>
          </div>
        </div>

        <div className="b-cell b-cell-banners">
          <div className="b-cell-eyebrow">Design <span style={{ color: accent }}>banners</span></div>
          <div className="banner-row">
            <div className="banner-mock" style={{ background: '#2a2a2a' }}>
              <div className="banner-strip" style={{ background: accent }}></div>
            </div>
            <div className="banner-mock" style={{ background: '#1a1a1a' }}>
              <div className="banner-strip" style={{ background: '#fff' }}></div>
            </div>
            <div className="banner-mock" style={{ background: accent, color: '#1a1a1a' }}>
              <div className="banner-strip" style={{ background: '#1a1a1a' }}></div>
            </div>
          </div>
        </div>

        <div className="b-cell b-cell-decks">
          <div className="b-cell-eyebrow">Design <span style={{ color: accent }}>decks</span></div>
          <div className="deck-stack">
            <div className="deck-frame">
              <div className="deck-grid">
                {Array.from({length: 6}).map((_, i) => (
                  <div key={i} className="deck-thumb" style={{ background: i===2 ? accent : `oklch(${0.3 + i*0.08} 0.05 80)` }}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="b-cell b-cell-cards">
          <div className="b-cell-eyebrow">Design <span style={{ color: accent }}>cards</span></div>
          <div className="card-mock-row">
            <div className="card-mock"><div style={{ background: 'oklch(0.55 0.15 25)' }}></div></div>
            <div className="card-mock"><div style={{ background: 'oklch(0.45 0.12 200)' }}></div></div>
            <div className="card-mock"><div style={{ background: accent, color: '#1a1a1a' }}>♥</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
