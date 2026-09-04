import { useState } from 'react';

export function MessageDock({ accent }) {
  const [open, setOpen] = useState(false);
  const channels = [
    { label: "Email", value: "maya@studio.so", icon: "✉" },
    { label: "Calendar", value: "cal.com/maya", icon: "◷" },
    { label: "Twitter", value: "@mayaokafor", icon: "𝕏" },
    { label: "Read.cv", value: "read.cv/maya", icon: "▤" },
    { label: "Signal", value: "+1 ••• ••• 4421", icon: "▽" },
  ];
  return (
    <div className="msg-dock-wrap">
      {open && (
        <div className="msg-dock-panel">
          <div className="msg-dock-head">
            <span>Quick contact</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          {channels.map((c, i) => (
            <button key={i} className="msg-dock-row">
              <span className="msg-dock-icon" style={{ color: accent, borderColor: accent }}>{c.icon}</span>
              <span className="msg-dock-label">
                <span className="msg-dock-key">{c.label}</span>
                <span className="msg-dock-val">{c.value}</span>
              </span>
              <span className="msg-dock-copy">Copy</span>
            </button>
          ))}
          <div className="msg-dock-foot">
            <span className="msg-dock-status">
              <span className="msg-dock-pulse" style={{ background: accent }}></span>
              Replying within 4h today
            </span>
          </div>
        </div>
      )}
      <button
        className={`msg-dock-fab ${open ? "open" : ""}`}
        style={{ background: accent }}
        onClick={() => setOpen(v => !v)}
      >
        {open ? "✕" : "✉"}
      </button>
    </div>
  );
}
