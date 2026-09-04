import { useEffect, useRef, useState } from 'react';

const links = [
  { href: '#work', label: 'Work', num: '01' },
  { href: '#about', label: 'About', num: '02' },
  { href: '#contact', label: 'Contact', num: '03' },
];

export function Nav({ accent }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* lock body scroll when menu open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`} ref={menuRef}>
        <a href="#" className="nav-logo" onClick={close}>
          <span className="logo-mark" style={{ background: accent }}></span>
          <span className="logo-text">Maya<span className="muted">.Okafor</span></span>
        </a>

        {/* desktop links */}
        <div className="nav-links">
          {links.map(({ href, label, num }) => (
            <a key={href} href={href}>
              {label}<span className="link-num">{num}</span>
            </a>
          ))}
          <a href="#contact" className="nav-cta" style={{ borderColor: accent, color: accent }}>
            Let's talk →
          </a>
        </div>

        {/* hamburger — mobile only */}
        <button
          className="nav-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="burger-bar" style={{ background: open ? accent : 'var(--fg)' }}></span>
          <span
            className="burger-bar burger-bar-mid"
            style={{
              background: 'var(--fg)',
              opacity: open ? 0 : 1,
              transform: open ? 'scaleX(0)' : 'scaleX(1)',
            }}
          ></span>
          <span
            className="burger-bar"
            style={{
              background: open ? accent : 'var(--fg)',
              width: open ? '100%' : '60%',
            }}
          ></span>
        </button>
      </nav>

      {/* mobile drawer */}
      <div
        className={`mobile-menu ${open ? 'mobile-menu-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="mobile-menu-inner">
          <nav className="mobile-nav-links">
            {links.map(({ href, label, num }, i) => (
              <a
                key={href}
                href={href}
                className="mobile-nav-link"
                style={{ transitionDelay: open ? `${i * 60 + 80}ms` : '0ms' }}
                onClick={close}
              >
                <span className="mobile-link-num" style={{ color: accent }}>{num}</span>
                <span className="mobile-link-label">{label}</span>
                <span className="mobile-link-arrow">↗</span>
              </a>
            ))}
          </nav>
          <div className="mobile-menu-footer">
            <a
              href="#contact"
              className="btn btn-primary"
              style={{ background: accent }}
              onClick={close}
            >
              <span>Let's talk</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </a>
            <div className="mobile-menu-meta">
              <span className="muted" style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>Brooklyn, NY</span>
              <span className="logo-mark" style={{ background: accent, display: 'inline-block', margin: '0 8px' }}></span>
              <span className="muted" style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* backdrop */}
      {open && (
        <div
          className="mobile-backdrop"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  );
}
