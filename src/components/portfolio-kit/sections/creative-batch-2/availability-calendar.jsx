export function AvailabilityCalendar({ accent }) {
  const months = [
    { name: "Jul", year: 2026, status: "booked", note: "Atlas Phase 2" },
    { name: "Aug", year: 2026, status: "booked", note: "Atlas Phase 2" },
    { name: "Sep", year: 2026, status: "available", note: "Open · 1 slot" },
    { name: "Oct", year: 2026, status: "available", note: "Open · 2 slots" },
    { name: "Nov", year: 2026, status: "tentative", note: "Holding for Method" },
    { name: "Dec", year: 2026, status: "off", note: "Studio break" },
  ];
  const colorFor = (s) => s === "available" ? accent : s === "booked" ? "#3a3a3a" : s === "tentative" ? "#6a5a3a" : "#2a2a2a";
  const labelFor = (s) => s === "available" ? "OPEN" : s === "booked" ? "BOOKED" : s === "tentative" ? "TENTATIVE" : "OFF";
  return (
    <section className="cal" data-screen-label="Calendar">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>◷</span><span className="bar"></span><span>Booking calendar · live</span>
        </div>
        <h2 className="section-title">
          Six months <em style={{ color: accent }}>at a glance</em>.
        </h2>
      </div>
      <div className="cal-grid">
        {months.map((m, i) => {
          const days = Array.from({ length: 30 }).map((_, di) => {
            const isOff = m.status === "off";
            const fill = m.status === "available" ? di < 14 : m.status === "tentative" ? di < 8 : di < 28;
            return fill && !isOff;
          });
          return (
            <div key={i} className="cal-month">
              <div className="cal-head">
                <div>
                  <div className="cal-name">{m.name}</div>
                  <div className="cal-year">{m.year}</div>
                </div>
                <span className="cal-status" style={{ background: colorFor(m.status), color: m.status === "available" ? "#1a1a1a" : "#fff" }}>
                  {labelFor(m.status)}
                </span>
              </div>
              <div className="cal-days">
                {days.map((d, di) => (
                  <span
                    key={di}
                    className="cal-day"
                    style={{ background: d ? colorFor(m.status) : "var(--line-soft)" }}
                  ></span>
                ))}
              </div>
              <div className="cal-note">{m.note}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
