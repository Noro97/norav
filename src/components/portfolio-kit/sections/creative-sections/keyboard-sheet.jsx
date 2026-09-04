import React from 'react';

export function KeyboardSheet({ accent }) {
  const shortcuts = [
    { keys: ["⌘", "K"], label: "Open command palette" },
    { keys: ["⌘", "/"], label: "Focus search" },
    { keys: ["G", "G"], label: "Go to gallery" },
    { keys: ["G", "A"], label: "Go to about" },
    { keys: ["G", "P"], label: "Go to pricing" },
    { keys: ["⌘", "E"], label: "Email Maya" },
    { keys: ["⌘", "."], label: "Toggle dark mode" },
    { keys: ["?"], label: "Show this sheet" },
  ];
  return (
    <section className="kbd-sheet" data-screen-label="Keyboard shortcuts">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>⌨</span><span className="bar"></span><span>Power user · keyboard shortcuts</span>
        </div>
        <h2 className="section-title">
          Eight keys <em style={{ color: accent }}>worth memorizing</em>.
        </h2>
      </div>
      <div className="kbd-grid">
        {shortcuts.map((s, i) => (
          <div key={i} className="kbd-row">
            <div className="kbd-keys">
              {s.keys.map((k, j) => (
                <React.Fragment key={j}>
                  <kbd className="kbd-key" style={{ borderBottomColor: accent }}>{k}</kbd>
                  {j < s.keys.length - 1 && <span className="kbd-plus">+</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="kbd-line"></div>
            <div className="kbd-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
