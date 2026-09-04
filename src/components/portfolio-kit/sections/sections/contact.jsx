import { useEffect, useRef, useState } from 'react';

const MAX_MSG = 600;

export function Contact({ accent }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [touched, setTouched] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const errors = {
    name: form.name.trim().length < 2 ? 'Tell me what to call you' : '',
    email: !/^\S+@\S+\.\S+$/.test(form.email) ? 'Need a valid email' : '',
    message: form.message.trim().length < 10 ? 'A line or two — what are you working on?' : '',
  };
  const valid = !errors.name && !errors.email && !errors.message;

  function submit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!valid) return;
    setSending(true);
    timerRef.current = setTimeout(() => { setSending(false); setSent(true); }, 900);
  }

  const msgLen = form.message.length;
  const msgNearLimit = msgLen > MAX_MSG * 0.8;

  if (sent) {
    return (
      <section id="contact" className="contact" data-screen-label="05 Contact">
        <div className="contact-sent">
          <div className="sent-mark" style={{ color: accent }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M8 24l12 12 20-24" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <h2>Message in the queue.</h2>
          <p>I read every note personally. Expect a reply within two working days — usually faster.</p>
          <button
            onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); setTouched({}); }}
            className="btn btn-secondary"
          >
            Send another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="contact" data-screen-label="05 Contact">
      <div className="contact-grid">
        <div className="contact-left">
          <div className="section-eyebrow">
            <span>05</span>
            <span className="bar"></span>
            <span>Start something</span>
          </div>
          <h2 className="section-title">
            Got a project worth <em style={{ color: accent }}>doing right</em>?
          </h2>
          <p className="contact-blurb">
            Brief engagements from two weeks. Fractional design lead from
            three months. I reply to every inquiry — even the ones I have
            to say no to.
          </p>
          <div className="contact-direct">
            <div>
              <span className="muted">Or skip the form</span>
              <a href="mailto:hello@mayaokafor.studio">hello@mayaokafor.studio</a>
            </div>
            <div>
              <span className="muted">PGP / receipts</span>
              <a href="#">key 0xA4F2…91C</a>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={submit} noValidate>
          {/* Name */}
          <div className={`field field-float ${form.name ? 'field-filled' : ''} ${touched.name && errors.name ? 'field-err' : ''} ${touched.name && !errors.name ? 'field-ok' : ''}`}>
            <input
              type="text"
              id="cf-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={() => setTouched({ ...touched, name: true })}
              placeholder=" "
              autoComplete="name"
            />
            <label htmlFor="cf-name">
              <span className="field-num" style={{ color: accent }}>01</span> Name
            </label>
            {touched.name && errors.name && (
              <span className="err" role="alert">{errors.name}</span>
            )}
            {touched.name && !errors.name && (
              <span className="field-check" style={{ color: accent }}>✓</span>
            )}
          </div>

          {/* Email */}
          <div className={`field field-float ${form.email ? 'field-filled' : ''} ${touched.email && errors.email ? 'field-err' : ''} ${touched.email && !errors.email ? 'field-ok' : ''}`}>
            <input
              type="email"
              id="cf-email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onBlur={() => setTouched({ ...touched, email: true })}
              placeholder=" "
              autoComplete="email"
            />
            <label htmlFor="cf-email">
              <span className="field-num" style={{ color: accent }}>02</span> Email
            </label>
            {touched.email && errors.email && (
              <span className="err" role="alert">{errors.email}</span>
            )}
            {touched.email && !errors.email && (
              <span className="field-check" style={{ color: accent }}>✓</span>
            )}
          </div>

          {/* Message */}
          <div className={`field field-float field-textarea ${form.message ? 'field-filled' : ''} ${touched.message && errors.message ? 'field-err' : ''} ${touched.message && !errors.message ? 'field-ok' : ''}`}>
            <textarea
              id="cf-message"
              rows="5"
              value={form.message}
              maxLength={MAX_MSG}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              onBlur={() => setTouched({ ...touched, message: true })}
              placeholder=" "
            />
            <label htmlFor="cf-message">
              <span className="field-num" style={{ color: accent }}>03</span> What are you building
            </label>
            <div className="field-footer">
              {touched.message && errors.message
                ? <span className="err" role="alert">{errors.message}</span>
                : touched.message && !errors.message
                  ? <span className="field-check" style={{ color: accent }}>✓</span>
                  : <span />
              }
              <span
                className="field-count"
                style={{ color: msgNearLimit ? 'var(--accent)' : 'var(--fg-dim)' }}
              >
                {msgLen}/{MAX_MSG}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg contact-submit"
            disabled={sending}
            style={{ background: accent }}
          >
            {sending ? (
              <>
                <span className="contact-spinner" aria-hidden="true"></span>
                <span>Sending…</span>
              </>
            ) : (
              <>
                <span>Send the brief</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
