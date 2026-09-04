import { useEffect, useRef, useState } from 'react';

export function CommandPalette({ accent }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);

  const items = [
    { kind: "Page", label: "Selected work", hint: "Gallery", action: "Scroll to gallery" },
    { kind: "Page", label: "About Maya", hint: "About", action: "Scroll to about" },
    { kind: "Page", label: "Pricing", hint: "Pricing", action: "Scroll to pricing" },
    { kind: "Page", label: "Show reel", hint: "Video", action: "Play reel" },
    { kind: "Action", label: "Email Maya", hint: "Contact", action: "mailto:" },
    { kind: "Action", label: "Book a call", hint: "Calendar", action: "Open Cal.com" },
    { kind: "Action", label: "Download CV (PDF)", hint: "File · 240kb", action: "Download" },
    { kind: "Theme", label: "Toggle dark mode", hint: "Theme", action: "Toggle" },
    { kind: "Theme", label: "Cycle accent color", hint: "Theme", action: "Cycle" },
    { kind: "Social", label: "Twitter / X", hint: "@mayaokafor", action: "Open" },
    { kind: "Social", label: "Read the journal", hint: "Writing", action: "Scroll" },
  ];
  const filtered = query
    ? items.filter(i => (i.label + " " + i.kind + " " + i.hint).toLowerCase().includes(query.toLowerCase()))
    : items;

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(v => !v);
        return;
      }
      if (e.key === "Escape") { setOpen(false); return; }
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(filtered.length - 1, s + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(0, s - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered.length]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);
  useEffect(() => { setSelected(0); }, [query]);

  if (!open) {
    return (
      <button className="cmdk-trigger" onClick={() => setOpen(true)}>
        <span className="cmdk-trigger-icon">⌘</span>
        <span>Search · K</span>
        <span className="cmdk-trigger-kbd">⌘K</span>
      </button>
    );
  }

  return (
    <div className="cmdk-overlay" onClick={() => setOpen(false)}>
      <div className="cmdk-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-header">
          <span style={{ color: accent }}>◇</span>
          <input
            ref={inputRef}
            className="cmdk-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the studio…"
          />
          <span className="cmdk-esc">ESC</span>
        </div>
        <div className="cmdk-list">
          {filtered.length === 0 && <div className="cmdk-empty">No results for "{query}"</div>}
          {filtered.map((it, i) => (
            <div
              key={i}
              className={`cmdk-item ${i === selected ? "selected" : ""}`}
              onMouseEnter={() => setSelected(i)}
              style={i === selected ? { background: `color-mix(in oklab, ${accent} 14%, transparent)` } : {}}
            >
              <span className="cmdk-kind" style={{ color: accent }}>{it.kind}</span>
              <span className="cmdk-label">{it.label}</span>
              <span className="cmdk-hint">{it.hint}</span>
              <span className="cmdk-arrow">↵</span>
            </div>
          ))}
        </div>
        <div className="cmdk-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
          <span className="cmdk-spacer"></span>
          <span style={{ color: accent }}>● open to commands</span>
        </div>
      </div>
    </div>
  );
}
