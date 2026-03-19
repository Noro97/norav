import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useScrollProgress'

interface Education {
  index: number
  period: string
  gpa?: string
  highlightCount: number
}

interface Certification {
  index: number
  date: string
  credentialId?: string
}

const EDUCATION: Education[] = [
  {
    index: 0,
    period: '2015 — 2019',
    gpa: '3.8 / 4.0',
    highlightCount: 3,
  },
]

const CERTIFICATIONS: Certification[] = [
  { index: 0, date: 'Mar 2024' },
  { index: 1, date: 'Nov 2023' },
  { index: 2, date: 'Aug 2023' },
  { index: 3, date: 'Jan 2023' },
  { index: 4, date: 'Sep 2022' },
]

export function EducationCerts() {
  const { t } = useTranslation('education')
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('education', sectionRef)

  useGSAP(() => {
    const section = sectionRef.current!
    const header = section.querySelector('.edu-header')
    if (header) {
      gsap.fromTo(header.children,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
          scrollTrigger: { trigger: section, start: 'top 85%' } }
      )
    }

    const eduCards = section.querySelectorAll('.edu-card')
    if (eduCards.length) {
      gsap.fromTo(eduCards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1,
          scrollTrigger: { trigger: section, start: 'top 85%' } }
      )
    }

    const certCards = section.querySelectorAll('.cert-card')
    if (certCards.length) {
      gsap.fromTo(certCards,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.08,
          scrollTrigger: { trigger: section, start: 'top 50%' } }
      )
    }
  }, { scope: sectionRef })

  return (
    <section
      id="education"
      ref={sectionRef}
      className="relative px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="edu-header">
          <span className="label-mono">{t('sectionLabel')}</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-4">
            {t('title')}
          </h2>
          <p className="text-white/40 text-base max-w-xl mb-12">
            {t('description')}
          </p>
        </div>

        {/* Education */}
        <div className="mb-16">
          <h3 className="font-mono text-xs text-white/30 tracking-wider uppercase mb-6">
            {t('educationHeading')}
          </h3>
          {EDUCATION.map((edu) => (
            <div key={edu.index} className="edu-card glass-card p-6 md:p-8 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-crimson-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 3L2 8l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-lg">
                        {t(`degree.${edu.index}.degree`)} {t(`degree.${edu.index}.field`)}
                      </h4>
                      <span className="font-mono text-sm text-crimson-400">{t(`degree.${edu.index}.institution`)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {edu.gpa && (
                        <span className="px-2 py-0.5 bg-crimson-500/10 border border-crimson-500/20 rounded font-mono text-xs text-crimson-400">
                          GPA: {edu.gpa}
                        </span>
                      )}
                      <span className="font-mono text-xs text-white/30">{edu.period}</span>
                    </div>
                  </div>

                  {edu.highlightCount > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {Array.from({ length: edu.highlightCount }, (_, i) => (
                        <li key={i} className="flex gap-2 text-sm text-white/45">
                          <span className="text-crimson-500 shrink-0">▸</span>
                          <span>{t(`degree.${edu.index}.highlights.${i}`)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div>
          <h3 className="font-mono text-xs text-white/30 tracking-wider uppercase mb-6">
            {t('certificationsHeading')}
          </h3>
          <div className="cert-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.index}
                className="cert-card glass-card p-4 group hover:translate-y-[-2px] transition-transform"
              >
                <div className="flex items-start gap-3">
                  {/* Badge */}
                  <div className="w-8 h-8 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-crimson-500/20 transition-colors">
                    <svg viewBox="0 0 16 16" className="w-4 h-4 text-white/20 group-hover:text-crimson-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 1l2 3.5H14l-3 2.5 1 4L8 8.5 4 11l1-4L2 4.5h4L8 1z" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-white/70 text-sm font-medium leading-tight group-hover:text-white/90 transition-colors">
                      {t(`certs.${cert.index}.name`)}
                    </h4>
                    <span className="font-mono text-xs text-crimson-400/60 block mt-0.5">
                      {t(`certs.${cert.index}.issuer`)}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-mono text-xs text-white/20">{cert.date}</span>
                      {cert.credentialId && (
                        <>
                          <span className="text-white/30">·</span>
                          <span className="font-mono text-xs text-white/35 truncate">
                            {cert.credentialId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
