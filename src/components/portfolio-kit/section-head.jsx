/**
 * The header the imported sections open with: a lead glyph or number, an
 * eyebrow, and a title whose middle clause is painted in the accent.
 *
 * Eleven of them were spelling this out — the same six elements, the same
 * `{' '}` between the title and its `<em>`, the same muted second line — which
 * is eleven places to fix when the shape changes and eleven chances for one to
 * drift.
 */

export function SectionEyebrow({ lead, label }) {
  if (!lead && !label) return null;
  return (
    <div className="section-eyebrow">
      {lead && <span>{lead}</span>}
      <span className="bar"></span>
      <span>{label}</span>
    </div>
  );
}

export function SectionTitle({ accent, title, titleAccent, titleTail, subtitle }) {
  if (!title) return null;
  return (
    <h2 className="section-title">
      {title}
      {titleAccent && <>{" "}<em style={{ color: accent }}>{titleAccent}</em></>}
      {titleTail}
      {subtitle && <><br/><span className="muted">{subtitle}</span></>}
    </h2>
  );
}

export function SectionHead({ accent, lead, label, title, titleAccent, titleTail, subtitle }) {
  return (
    <div className="section-head">
      <SectionEyebrow lead={lead} label={label} />
      <SectionTitle
        accent={accent}
        title={title}
        titleAccent={titleAccent}
        titleTail={titleTail}
        subtitle={subtitle}
      />
    </div>
  );
}
