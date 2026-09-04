import { PROJECTS } from './project-data';
import { ProjectCard } from './project-card';

export function Gallery({ accent }) {
  return (
    <section id="work" className="gallery" data-screen-label="03 Gallery">
      <div className="section-head">
        <div className="section-eyebrow">
          <span>03</span>
          <span className="bar"></span>
          <span>Selected work</span>
        </div>
        <h2 className="section-title">
          Six projects I'm <em style={{ color: accent }}>proud of</em>.
          <br />
          <span className="muted">Twelve more on request.</span>
        </h2>
      </div>
      <div className="grid">
        {PROJECTS.map((p) => <ProjectCard key={p.n} p={p} accent={accent} />)}
      </div>
    </section>);

}
