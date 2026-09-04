import { withDefaults } from '../../content';
import { SectionHead } from '../../section-head';

export const DEFAULTS = {
  headGlyph: '◇',
  headLabel: 'Tool stack',
  title: 'Eight tools,',
  titleAccent: 'used daily',
  titleTail: '.',
  tools: [
    { name: 'Figma', note: 'Daily driver', glyph: 'F' },
    { name: 'Origami', note: 'Motion prototypes', glyph: 'Or' },
    { name: 'After Effects', note: 'Brand motion', glyph: 'Ae' },
    { name: 'Cursor', note: 'Engineering handoffs', glyph: 'C' },
    { name: 'Notion', note: 'Briefs & docs', glyph: 'N' },
    { name: 'Linear', note: 'Project tracking', glyph: 'L' },
    { name: 'Loom', note: 'Async reviews', glyph: 'Lm' },
    { name: 'Arc', note: 'Browser of choice', glyph: 'Ar' },
  ],
};

export function ToolStack({ accent, content }) {
  const c = withDefaults(DEFAULTS, content);
  return (
    <section className="tools" data-screen-label="Tools">
      <SectionHead
        accent={accent}
        lead={c.headGlyph}
        label={c.headLabel}
        title={c.title}
        titleAccent={c.titleAccent}
        titleTail={c.titleTail}
      />
      <div className="tools-grid">
        {c.tools.map((t, i) => (
          <div key={i} className="tool-cell">
            <div className="tool-glyph" style={{ borderColor: accent, color: accent }}>{t.glyph}</div>
            <div>
              <div className="tool-name">{t.name}</div>
              <div className="tool-note">{t.note}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
