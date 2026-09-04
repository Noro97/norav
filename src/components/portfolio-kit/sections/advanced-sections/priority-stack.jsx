import { useState } from 'react';

export function PriorityStack({ accent }) {
  const [items, setItems] = useState([
    { id: "a", title: "Brand systems", desc: "Identity, type, motion principles", color: "#ff7fbf" },
    { id: "b", title: "Product design", desc: "Web, mobile, dashboards", color: "#7fffc4" },
    { id: "c", title: "Marketing sites", desc: "Hero to footer, conversion-focused", color: "#ffd47f" },
    { id: "d", title: "Design systems", desc: "Tokens, components, docs", color: "#7fcfff" },
    { id: "e", title: "Motion design", desc: "Brand films, UI motion grammar", color: "#c4a8ff" },
  ]);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  const onDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e, id) => {
    e.preventDefault();
    if (id !== dragId) setOverId(id);
  };
  const onDrop = (e, id) => {
    e.preventDefault();
    if (!dragId || dragId === id) return;
    const next = [...items];
    const fromIdx = next.findIndex(i => i.id === dragId);
    const toIdx = next.findIndex(i => i.id === id);
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setItems(next);
    setDragId(null);
    setOverId(null);
  };
  const onDragEnd = () => { setDragId(null); setOverId(null); };

  return (
    <section className="priority" data-screen-label="Priority stack">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>⇅</span><span className="bar"></span><span>Drag to rank · what matters most to you?</span>
        </div>
        <h2 className="section-title">
          What do you <em style={{ color: accent }}>actually</em> need?
        </h2>
      </div>
      <div className="priority-list">
        {items.map((it, i) => (
          <div
            key={it.id}
            className={`pri-row ${dragId === it.id ? "dragging" : ""} ${overId === it.id ? "over" : ""}`}
            draggable
            onDragStart={(e) => onDragStart(e, it.id)}
            onDragOver={(e) => onDragOver(e, it.id)}
            onDrop={(e) => onDrop(e, it.id)}
            onDragEnd={onDragEnd}
          >
            <div className="pri-handle">
              <span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="pri-rank" style={{ color: accent }}>0{i + 1}</div>
            <div className="pri-swatch" style={{ background: it.color }}></div>
            <div className="pri-body">
              <h3>{it.title}</h3>
              <p>{it.desc}</p>
            </div>
            <div className="pri-meta">
              {i === 0 && <span className="pri-badge" style={{ background: accent }}>Top priority</span>}
              {i === items.length - 1 && <span className="pri-badge pri-badge-muted">Skip</span>}
            </div>
          </div>
        ))}
      </div>
      <p className="priority-note">↕ Try dragging a row up or down. The order persists for your visit.</p>
    </section>
  );
}
