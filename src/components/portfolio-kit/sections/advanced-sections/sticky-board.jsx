import { useRef, useState } from 'react';

const INITIAL_NOTES = [
  { id: 1, x: 8, y: 12, text: "ship beats perfect", rot: -3, color: "#ffe28a" },
  { id: 2, x: 35, y: 8, text: "the brief is the product", rot: 2, color: "#ffb3d4" },
  { id: 3, x: 62, y: 22, text: "motion = meaning", rot: -2, color: "#9fe8ff" },
  { id: 4, x: 12, y: 50, text: "say no, often", rot: 4, color: "#c8ffb3" },
  { id: 5, x: 42, y: 58, text: "type before color", rot: -1, color: "#ffd49b" },
  { id: 6, x: 70, y: 58, text: "show your work", rot: 3, color: "#d4b8ff" },
];

export function StickyBoard({ accent }) {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const boardRef = useRef(null);
  const dragRef = useRef(null);

  const onMouseMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const x = Math.max(0, Math.min(85, ((e.clientX - d.boardLeft - d.offsetX) / d.boardW) * 100));
    const y = Math.max(0, Math.min(80, ((e.clientY - d.boardTop - d.offsetY) / d.boardH) * 100));
    d.x = x;
    d.y = y;
    d.node.style.left = `${x}%`;
    d.node.style.top = `${y}%`;
  };

  const onMouseUp = () => {
    const d = dragRef.current;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    if (!d) return;
    setNotes(prev => prev.map(n => n.id === d.id ? { ...n, x: d.x, y: d.y } : n));
    dragRef.current = null;
  };

  const onMouseDown = (e, id) => {
    const board = boardRef.current.getBoundingClientRect();
    const node = e.currentTarget;
    const noteRect = node.getBoundingClientRect();
    dragRef.current = {
      id,
      node,
      offsetX: e.clientX - noteRect.left,
      offsetY: e.clientY - noteRect.top,
      boardW: board.width,
      boardH: board.height,
      boardLeft: board.left,
      boardTop: board.top,
      x: parseFloat(node.style.left) || 0,
      y: parseFloat(node.style.top) || 0,
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <section className="sticky-board" data-screen-label="Sticky board">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>✱</span><span className="bar"></span><span>Studio principles · drag the notes</span>
        </div>
        <h2 className="section-title">
          Six rules taped to <em style={{ color: accent }}>the wall</em>.
        </h2>
      </div>
      <div ref={boardRef} className="sticky-canvas">
        <div className="sticky-grid"></div>
        {notes.map(n => (
          <div
            key={n.id}
            className="sticky-note"
            style={{
              left: `${n.x}%`, top: `${n.y}%`, background: n.color,
              transform: `rotate(${n.rot}deg)`,
            }}
            onMouseDown={(e) => onMouseDown(e, n.id)}
          >
            {n.text}
          </div>
        ))}
        <div className="sticky-corner-tl">PRINCIPLES.BOARD</div>
        <div className="sticky-corner-br">{notes.length} notes · drag any</div>
      </div>
    </section>
  );
}
