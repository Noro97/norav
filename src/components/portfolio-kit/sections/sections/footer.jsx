import { useRef, useState } from 'react';

export function Footer({ accent }) {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [subbing, setSubbing] = useState(false);
  const [subbed, setSubbed] = useState(false);
  const timerRef = useRef(null);

  const isValid = /^\S+@\S+\.\S+$/.test(email);
  const showErr = touched && !isValid && email.length > 0;

  function sub(e) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setSubbing(true);
    timerRef.current = setTimeout(() => {
      setSubbing(false);
      setSubbed(true);
    }, 900);
  }

  return (
    <footer className="footer" data-screen-label="06 Footer">
      <div className="footer-top">
        <div className="footer-mark">
          <span className="mark-glyph" style={{ color: accent }}>*</span>
          <span>Made in Brooklyn. Hosted on a server I can see from my window.</span>
        </div>
      </div>
      <div className="footer-grid">
        <div className="footer-col">
          <div className="muted">Elsewhere</div>
          <ul>
            <li><a href="#">Are.na <span>↗</span></a></li>
            <li><a href="#">Read.cv <span>↗</span></a></li>
            <li><a href="#">GitHub <span>↗</span></a></li>
            <li><a href="#">LinkedIn <span>↗</span></a></li>
          </ul>
        </div>
        <div className="footer-col">
          <div className="muted">Reading list</div>
          <ul>
            <li><a href="#">Field notes (monthly)</a></li>
            <li><a href="#">Talks &amp; writing</a></li>
            <li><a href="#">Now page</a></li>
            <li><a href="#">Colophon</a></li>
          </ul>
        </div>
        <div className="footer-col footer-news">
          <div className="muted">A letter, every other Sunday.</div>
          {!subbed ? (
            <form onSubmit={sub} className="news-form" noValidate>
              <div className={`news-input-wrap ${showErr ? 'news-input-err' : ''} ${touched && isValid ? 'news-input-ok' : ''}`}>
                <input
                  type="email"
                  placeholder="you@somewhere.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  aria-label="Email address"
                  aria-invalid={showErr}
                  disabled={subbing}
                />
                <button
                  type="submit"
                  style={{ color: subbing ? 'var(--fg-dim)' : accent }}
                  disabled={subbing}
                  aria-label="Subscribe"
                >
                  {subbing ? (
                    <span className="news-spinner" aria-hidden="true" style={{ borderTopColor: accent }}></span>
                  ) : (
                    'Subscribe →'
                  )}
                </button>
              </div>
              {showErr && (
                <span className="news-err" role="alert">Enter a valid email address</span>
              )}
            </form>
          ) : (
            <div className="news-thanks" style={{ color: accent }}>
              ✓ You're in. Check your inbox for the latest issue.
            </div>
          )}
          <div className="news-meta">
            <span>1,847 readers</span>
            <span className="dot-sep">·</span>
            <span>No spam, ever</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-big">MAYA<span style={{ color: accent }}>·</span>OKAFOR</div>
        <div className="footer-fine">
          <span>© 2018–2026</span>
          <span className="dot-sep">·</span>
          <span>All work shown with permission</span>
          <span className="dot-sep">·</span>
          <span>v04.2.1</span>
        </div>
      </div>
    </footer>
  );
}
