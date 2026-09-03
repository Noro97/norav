import { useRef, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useBlock } from '@/content/ContentProvider'
import { CHOSEN, UNCHOSEN } from '@/components/ui/selection'
import { useCaseStudyLabel } from '@/content/case-studies'
import { GalleryVariant } from '@/components/ui/effects/GalleryVariant'
import type { CaseStudyContent, CaseStudySettings } from '@norav/content-schema'

interface Activity {
  key: string
  icon: string
  basePoints: number
  baseXP: number
  reps: number
}

const ACTIVITIES: Activity[] = [
  { key: 'squats', icon: 'SQ', basePoints: 35, baseXP: 120, reps: 12 },
  { key: 'pushups', icon: 'PU', basePoints: 30, baseXP: 100, reps: 10 },
  { key: 'jumpingJacks', icon: 'JJ', basePoints: 25, baseXP: 90, reps: 15 },
  { key: 'plank', icon: 'PL', basePoints: 40, baseXP: 150, reps: 60 },
  { key: 'burpees', icon: 'BR', basePoints: 45, baseXP: 160, reps: 8 },
  { key: 'reading', icon: 'RD', basePoints: 20, baseXP: 80, reps: 20 },
]

const LIVENESS_CHALLENGES = [
  'waveHand', 'thumbsUp', 'turnHead', 'smile', 'peace',
] as const

const PIPELINE_NODES = [
  { key: 'tma', nodeKey: 'proof.nodes.tma' },
  { key: 'ffmpeg', nodeKey: 'proof.nodes.ffmpeg' },
  { key: 'supabase', nodeKey: 'proof.nodes.supabase' },
  { key: 'pgmq', nodeKey: 'proof.nodes.pgmq' },
  { key: 'gemini', nodeKey: 'proof.nodes.gemini' },
  { key: 'db', nodeKey: 'proof.nodes.db' },
]


type NodeStatus = 'idle' | 'active' | 'done'
type PipelineStatus = 'idle' | 'running' | 'done'

// Timing constants
const STEP_DURATION = 800
const REP_INTERVAL = 250

export function ProofWidget({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<CaseStudyContent, CaseStudySettings>('proof')
  // Before the early return: the number is a hook, and a hook cannot sit
  // behind a conditional.
  const sectionLabel = useCaseStudyLabel('proof', block?.content.sectionLabel ?? '')
  const { t } = useTranslation(['projects', 'common'])
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver(anchorId ?? 'proof', sectionRef)

  const [selectedActivity, setSelectedActivity] = useState(0)
  const [livenessChallenge, setLivenessChallenge] = useState(
    () => LIVENESS_CHALLENGES[Math.floor(Math.random() * LIVENESS_CHALLENGES.length)]!
  )
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('idle')
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatus[]>(() =>
    Array(PIPELINE_NODES.length).fill('idle') as NodeStatus[]
  )
  const [logLines, setLogLines] = useState<string[]>([])
  const [confidence, setConfidence] = useState(0)
  const [processingTime, setProcessingTime] = useState(0)
  const [points, setPoints] = useState(0)
  const [streak, setStreak] = useState(0)
  const [repCount, setRepCount] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])
  const cancelledRef = useRef(false)

  // Cleanup all timers
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    intervalsRef.current.forEach(clearInterval)
    timersRef.current = []
    intervalsRef.current = []
  }, [])

  useEffect(() => () => { cancelledRef.current = true; clearAllTimers() }, [clearAllTimers])

  // GSAP entrance
  useGSAP(() => {
    const left = sectionRef.current!.querySelector('.proof-left')
    const right = sectionRef.current!.querySelector('.proof-right')
    if (left) {
      gsap.fromTo(left,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.8,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      )
    }
    if (right) {
      gsap.fromTo(right,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.8,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      )
    }
  }, { scope: sectionRef })

  const setNode = useCallback((index: number, status: NodeStatus) => {
    setNodeStatuses(prev => {
      const next = [...prev]
      next[index] = status
      return next
    })
  }, [])

  const addLog = useCallback((line: string) => {
    setLogLines(prev => [...prev, line])
  }, [])

  const handleSelectActivity = useCallback((index: number) => {
    if (pipelineStatus === 'running') return
    setSelectedActivity(index)
    setLivenessChallenge(
      LIVENESS_CHALLENGES[Math.floor(Math.random() * LIVENESS_CHALLENGES.length)]!
    )
    // Reset if was done
    if (pipelineStatus === 'done') {
      setPipelineStatus('idle')
      setNodeStatuses(Array(PIPELINE_NODES.length).fill('idle') as NodeStatus[])
      setLogLines([])
      setConfidence(0)
      setProcessingTime(0)
      setPoints(0)
      setStreak(0)
      setRepCount(0)
      setShowResult(false)
    }
  }, [pipelineStatus])

  const handleStart = useCallback(() => {
    if (pipelineStatus === 'running') return
    clearAllTimers()
    cancelledRef.current = false

    // Reset state
    setPipelineStatus('running')
    setNodeStatuses(Array(PIPELINE_NODES.length).fill('idle') as NodeStatus[])
    setLogLines([])
    setConfidence(0)
    setProcessingTime(0)
    setPoints(0)
    setStreak(0)
    setRepCount(0)
    setShowResult(false)

    const activity = ACTIVITIES[selectedActivity]!
    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(() => { if (!cancelledRef.current) fn() }, ms)
      timersRef.current.push(id)
    }

    // Step 1: Upload
    schedule(() => {
      setNode(0, 'active')
      addLog(t('projects:proof.pipeline.upload'))
    }, 0)

    // Step 2: FFmpeg + Supabase
    schedule(() => {
      setNode(0, 'done')
      setNode(1, 'active')
      setNode(2, 'active')
      addLog(t('projects:proof.pipeline.enqueue'))
    }, STEP_DURATION)

    // Step 3: pgmq Queue
    schedule(() => {
      setNode(1, 'done')
      setNode(2, 'done')
      setNode(3, 'active')
      addLog(t('projects:proof.pipeline.analyze'))
    }, STEP_DURATION * 2)

    // Step 4: Gemini analyzing — count reps
    schedule(() => {
      setNode(3, 'done')
      setNode(4, 'active')
      let count = 0
      const interval = setInterval(() => {
        if (cancelledRef.current) { clearInterval(interval); return }
        count++
        setRepCount(count)
        if (count >= activity.reps) {
          clearInterval(interval)
        }
      }, REP_INTERVAL)
      intervalsRef.current.push(interval)
    }, STEP_DURATION * 3)

    // Step 5: DB update + points
    const repDuration = activity.reps * REP_INTERVAL
    schedule(() => {
      setNode(4, 'done')
      setNode(5, 'active')
      addLog(t('projects:proof.pipeline.countReps', { count: activity.reps }))
      addLog(t('projects:proof.pipeline.verified', { points: activity.basePoints }))
    }, STEP_DURATION * 3 + repDuration)

    // Step 6: Complete — animate metrics
    schedule(() => {
      setNode(5, 'done')

      // Animate metrics over 600ms
      const steps = 20
      const streakTarget = 7 + Math.floor(Math.random() * 20)
      let step = 0
      const interval = setInterval(() => {
        if (cancelledRef.current) { clearInterval(interval); return }
        step++
        const progress = step / steps
        setConfidence(Math.round(984 * progress) / 10)
        setProcessingTime(Math.round(12 * progress) / 10)
        setPoints(Math.round(activity.basePoints * progress))
        setStreak(Math.round(streakTarget * progress))
        if (step >= steps) clearInterval(interval)
      }, 30)
      intervalsRef.current.push(interval)
    }, STEP_DURATION * 3 + repDuration + 400)

    // Step 7: Show result
    schedule(() => {
      setPipelineStatus('done')
      setShowResult(true)
    }, STEP_DURATION * 3 + repDuration + 1200)
  }, [pipelineStatus, selectedActivity, clearAllTimers, setNode, addLog, t])

  const handleReset = useCallback(() => {
    clearAllTimers()
    cancelledRef.current = false
    setPipelineStatus('idle')
    setNodeStatuses(Array(PIPELINE_NODES.length).fill('idle') as NodeStatus[])
    setLogLines([])
    setConfidence(0)
    setProcessingTime(0)
    setPoints(0)
    setStreak(0)
    setRepCount(0)
    setShowResult(false)
    setLivenessChallenge(
      LIVENESS_CHALLENGES[Math.floor(Math.random() * LIVENESS_CHALLENGES.length)]!
    )
  }, [clearAllTimers])

  const activity = ACTIVITIES[selectedActivity]!

  if (!block) return null
  const { content, settings } = block
  const screenshots = content.screenshots.map((s) => s.image).filter(Boolean)

  return (
    <section
      id={anchorId ?? 'proof'}
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="label-mono">{sectionLabel}</span>
          <h2 className="text-display-lg font-bold text-white mt-3">
            {content.title}
          </h2>
          <p className="text-body-lg text-white/50 max-w-2xl mt-4">
            {content.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {content.techStack.map((tag) => (
              <span key={tag.name} className="case-study-pill text-xs font-mono text-white/45">
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="case-study-card grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          {/* LEFT — Controls */}
          <div className="proof-left bg-white/[0.02] p-6 md:p-8 space-y-5">
            {/* Window chrome */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-crimson-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
              <div className="w-3 h-3 rounded-full bg-green-500/40" />
              <span className="ml-3 font-mono text-xs text-white/45">{t('projects:proof.windowLabel')}</span>
            </div>

            {/* Activity selector */}
            <div>
              <label className="block font-mono text-xs text-white/40 mb-2 tracking-wider uppercase">
                {t('projects:proof.labels.activity')}
              </label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map((act, i) => (
                  <button
                    key={act.key}
                    onClick={() => handleSelectActivity(i)}
                    className={`px-3 py-1.5 text-xs font-mono rounded border transition-all ${
                      selectedActivity === i ? CHOSEN : UNCHOSEN
                    }`}
                  >
                    <span className="mr-1.5 opacity-60">{act.icon}</span>
                    {t(`projects:proof.activities.${act.key}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Liveness challenge */}
            <div className="case-study-card flex items-center gap-3 px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <div>
                <span className="font-mono text-xs text-white/40 block">{t('projects:proof.liveness.title')}</span>
                <span className="font-mono text-sm text-amber-400/80">
                  {t(`projects:proof.liveness.${livenessChallenge}`)}
                </span>
              </div>
            </div>

            {/* Start / Reset button */}
            {pipelineStatus === 'done' ? (
              <button
                onClick={handleReset}
                className="group relative inline-flex items-center gap-3 px-7 py-3.5 bg-white/5 border border-white/20 text-white/60 font-mono text-sm tracking-wider uppercase rounded transition-all hover:bg-white/10 hover:text-white/80"
              >
                {t('projects:proof.button.reset')}
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={pipelineStatus === 'running'}
                className="group relative inline-flex items-center gap-3 px-7 py-3.5 bg-crimson-500/10 border border-crimson-500/30 text-crimson-400 font-mono text-sm tracking-wider uppercase rounded transition-all hover:bg-crimson-500/20 hover:border-crimson-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${pipelineStatus === 'running' ? 'bg-yellow-400 animate-pulse' : 'bg-crimson-500'}`} />
                {pipelineStatus === 'running'
                  ? t('projects:proof.button.running')
                  : t('projects:proof.button.start')
                }
              </button>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="case-study-card p-3 text-center">
                <div className="text-xl font-bold text-crimson-400 font-mono">{confidence}%</div>
                <div className="text-xs text-white/50 font-mono mt-1">{t('projects:proof.metrics.confidence')}</div>
              </div>
              <div className="case-study-card p-3 text-center">
                <div className="text-xl font-bold text-crimson-400 font-mono">{processingTime}s</div>
                <div className="text-xs text-white/50 font-mono mt-1">{t('projects:proof.metrics.processingTime')}</div>
              </div>
              <div className="case-study-card p-3 text-center border-gold-500/30">
                <div className="text-xl font-bold text-gold-400 font-mono">+{points}</div>
                <div className="text-xs text-white/50 font-mono mt-1">{t('projects:proof.metrics.points')}</div>
              </div>
              <div className="case-study-card p-3 text-center">
                <div className="text-xl font-bold text-crimson-400 font-mono">{streak}d</div>
                <div className="text-xs text-white/50 font-mono mt-1">{t('projects:proof.metrics.streak')}</div>
              </div>
            </div>

            {/* Pipeline log */}
            <div className="font-mono text-xs space-y-1 max-h-28 overflow-y-auto">
              {logLines.map((line, i) => (
                <div key={i} className={i === logLines.length - 1 && pipelineStatus === 'running' ? 'text-white/50' : 'text-green-400/60'}>
                  {line}
                </div>
              ))}
              {pipelineStatus === 'running' && repCount > 0 && (
                <div className="text-yellow-400/60">
                  [{t('projects:proof.pipeline.repsLive', { count: repCount })}]
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Pipeline Diagram */}
          <div className="proof-right bg-background p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-green-500/40" />
              <span className="font-mono text-xs text-white/45">{t('projects:proof.pipeline.title')}</span>
            </div>

            {/* Nodes */}
            <div className="space-y-0">
              {PIPELINE_NODES.map((node, i) => {
                const status = nodeStatuses[i]!
                return (
                  <div key={node.key}>
                    {/* Node */}
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-500 ${
                        status === 'active'
                          ? 'border-crimson-500/50 bg-crimson-500/5 shadow-[0_0_20px_color-mix(in_srgb,_var(--color-crimson-500)_15%,_transparent)]'
                          : status === 'done'
                          ? 'border-green-500/20 bg-green-500/[0.02]'
                          : 'border-white/8 bg-transparent'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center font-mono text-xs font-bold transition-colors duration-500 ${
                        status === 'active'
                          ? 'bg-crimson-500/20 text-crimson-400'
                          : status === 'done'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-white/5 text-white/30'
                      }`}>
                        {status === 'done' ? (
                          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 8l3.5 3.5L13 5" />
                          </svg>
                        ) : (
                          <span>{String(i + 1).padStart(2, '0')}</span>
                        )}
                      </div>

                      {/* Label */}
                      <span className={`font-mono text-sm transition-colors duration-500 ${
                        status === 'active' ? 'text-crimson-400' :
                        status === 'done' ? 'text-green-400/70' : 'text-white/40'
                      }`}>
                        {t(`projects:${node.nodeKey}`)}
                      </span>

                      {/* Status dot */}
                      <div className="ml-auto">
                        {status === 'active' && (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-400 opacity-50" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-crimson-500" />
                          </span>
                        )}
                        {status === 'done' && (
                          <span className="w-3 h-3 rounded-full bg-green-500 block" />
                        )}
                        {status === 'idle' && (
                          <span className="w-3 h-3 rounded-full bg-white/10 block" />
                        )}
                      </div>
                    </div>

                    {/* Connector line */}
                    {i < PIPELINE_NODES.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <div className={`h-4 border-l-2 border-dashed transition-colors duration-500 ${
                          nodeStatuses[i] === 'done'
                            ? 'border-green-500/30'
                            : nodeStatuses[i] === 'active'
                            ? 'border-crimson-500/40'
                            : 'border-white/8'
                        }`} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Result card */}
            <div className={`case-study-card mt-6 p-5 transition-all duration-600 ${
              showResult
                ? 'border-crimson-500/30 opacity-100 translate-y-0'
                : 'border-transparent opacity-0 translate-y-4 pointer-events-none'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <svg viewBox="0 0 16 16" className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l3.5 3.5L13 5" />
                </svg>
                <span className="font-mono text-sm font-bold text-green-400">
                  {t('projects:proof.result.title')}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-white/50">
                    {t(`projects:proof.activities.${activity.key}`)}
                  </span>
                  <span className="font-mono text-xs text-white/60">
                    {t('projects:proof.result.reps', { count: activity.reps })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gold-400 font-bold">
                    {t('projects:proof.result.physioPoints', { count: activity.basePoints })}
                  </span>
                  <span className="case-study-pill font-mono text-xs text-gold-400/80 border-gold-500/30 py-0.5">
                    {t('projects:proof.result.premium')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-sky-400">
                    {t('projects:proof.result.xpGained', { count: activity.baseXP })}
                  </span>
                </div>
              </div>

              <button className="mt-3 w-full px-4 py-2 bg-[#26a5e4]/10 border border-[#26a5e4]/20 text-[#26a5e4] font-mono text-xs rounded-lg hover:bg-[#26a5e4]/20 transition-colors">
                {t('projects:proof.result.share')}
              </button>
            </div>
          </div>
        </div>

        {screenshots.length > 0 && (
          <div className="mt-10">
            <GalleryVariant images={screenshots} variant={settings.galleryStyle} alt={content.title} />
          </div>
        )}
      </div>
    </section>
  )
}
