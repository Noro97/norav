import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { WorkflowDiagram } from './WorkflowDiagram'
import { WORKFLOWS } from './workflow.data'
import { useBlock } from '@/content/ContentProvider'
import { ThreadsBackground } from '@/components/ui/effects/ThreadsBackground'
import { BeamsBackground } from '@/components/ui/effects/BeamsBackground'
import type { WorkflowContent, WorkflowSettings } from '@norav/content-schema'

gsap.registerPlugin(ScrollTrigger)

export function WorkflowAutomation({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<WorkflowContent, WorkflowSettings>('workflow')
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver(anchorId ?? 'workflows', sectionRef)
  const [animate, setAnimate] = useState(false)

  useGSAP(() => {
    const section = sectionRef.current!

    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      onEnter: () => setAnimate(true),
    })

    const header = section.querySelector('.wf-header')
    if (header) {
      gsap.fromTo(
        header.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: { trigger: section, start: 'top 85%' },
        }
      )
    }

    const cards = section.querySelectorAll('.wf-card')
    if (cards.length) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 75%' },
        }
      )
    }
  }, { scope: sectionRef })

  if (!block) return null
  const { content, settings } = block

  return (
    <section
      id={anchorId ?? 'workflows'}
      ref={sectionRef}
      className="relative px-gutter-x py-24"
    >
      {settings.background === 'threads' && <ThreadsBackground />}
      {settings.background === 'beams' && <BeamsBackground />}

      <div className="relative z-10 w-full max-w-content mx-auto">
        <div className="wf-header">
          <span className="label-mono">{content.sectionLabel}</span>
          <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3 mb-4">
            {content.title}
          </h2>
          <p className="text-tertiary-ink/40 text-body-regular max-w-xl mb-12">{content.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {content.workflows.map((card) => {
            // The diagram is code; an id the code does not know is skipped
            // rather than rendering an empty card.
            const workflow = WORKFLOWS.find((candidate) => candidate.id === card.diagram)
            if (!workflow) return null
            return (
            <div
              key={card.diagram}
              className="wf-card relative overflow-hidden rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl p-5 transition-all duration-300 hover:border-secondary-500/20 hover:shadow-[0_0_40px_-12px_rgba(108,58,237,0.15)] flex flex-col"
            >
              {/* n8n badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-secondary-500/15 flex items-center justify-center">
                  <span className="text-caption font-semibold text-secondary-500">n8n</span>
                </div>
                <h3 className="type-label text-tertiary-ink/60">
                  {card.title}
                </h3>
              </div>

              {/* Workflow diagram */}
              <div className="mb-4 bg-tertiary-ink/[0.02] rounded-xl p-3 border border-tertiary-ink/[0.04]">
                <WorkflowDiagram workflow={workflow} animate={animate} />
              </div>

              {/* Description */}
              <p className="font-mono text-body-small text-tertiary-ink/40 leading-relaxed mt-auto pt-4">
                {card.description}
              </p>
            </div>
            )
          })}
        </div>

        {/* Tech stack badges */}
        <div className="mt-8 flex flex-wrap items-center gap-2 justify-center">
          {content.techStack.map((tech) => (
            <span
              key={tech.name}
              className="px-3 py-1.5 rounded-full border border-tertiary-ink/[0.06] bg-tertiary-ink/[0.02] font-mono text-caption text-tertiary-ink/30"
            >
              {tech.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
