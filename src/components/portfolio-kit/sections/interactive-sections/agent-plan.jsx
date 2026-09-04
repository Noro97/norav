import { useEffect, useState } from 'react';

export function AgentPlan({ accent }) {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { title: "You send a brief", note: "A Slack message, an email, a Loom — whatever's easiest" },
    { title: "I reply within 24h", note: "With clarifying questions and a rough timeline" },
    { title: "30-minute scoping call", note: "We talk goals, constraints, success metrics" },
    { title: "Fixed-price proposal", note: "Phases, deliverables, milestones — no hourly rates" },
    { title: "Kick off in 1–2 weeks", note: "Shared Linear board, weekly Looms, daily availability" },
    { title: "Ship together", note: "I stay through implementation review and v1.1" },
  ];
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % steps.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="agent-plan" data-screen-label="What happens next">
      <div className="agent-plan-inner">
        <div className="agent-plan-side">
          <div className="section-eyebrow">
            <span>◈</span><span className="bar"></span><span>What happens next</span>
          </div>
          <h2 className="section-title">
            Six steps from <em style={{ color: accent }}>"hey"</em><br/>to ship.
          </h2>
          <p className="agent-plan-blurb">
            No mystery, no theatrical onboarding. The whole engagement runs on this loop.
          </p>
        </div>
        <div className="agent-plan-list">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`ap-step ${i === activeStep ? "active" : ""} ${i < activeStep ? "done" : ""}`}
              onClick={() => setActiveStep(i)}
            >
              <div className="ap-check" style={i <= activeStep ? { background: accent, borderColor: accent } : {}}>
                {i < activeStep ? "✓" : i === activeStep ? "●" : i + 1}
              </div>
              <div className="ap-line" style={i < activeStep ? { background: accent } : {}}></div>
              <div className="ap-body">
                <h3>{s.title}</h3>
                <p>{s.note}</p>
              </div>
              <div className="ap-time">{i === activeStep ? "now" : i < activeStep ? "done" : `+${i}`}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
