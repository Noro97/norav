import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export type ScrambleVariant = 'scramble' | 'decrypt' | 'glitch'

interface Props {
  text: string
  variant?: ScrambleVariant
  className?: string
}

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________'
const GLITCH_CHARS = '01_-/\\|#@%&'
const STEP_MS = 30

/**
 * A text reveal that resolves from noise to the real string, character by
 * character, once it scrolls into view. `decrypt` resolves left-to-right and
 * settles each character in place as it's "cracked" (classic terminal
 * decrypt); `scramble` shuffles the whole string every tick until a final
 * flip to the real text; `glitch` is a shorter, denser version of `scramble`
 * using a terminal-flavoured character set, for the VibeCoding ghost lines.
 */
export function ScrambleText({ text, variant = 'scramble', className }: Props) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(text)
  const [run, setRun] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRun(true)
          obs.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!run || reducedMotion) {
      setDisplay(text)
      return
    }

    const chars = variant === 'glitch' ? GLITCH_CHARS : SCRAMBLE_CHARS
    let frame = 0
    let intervalId: ReturnType<typeof setInterval>

    if (variant === 'decrypt') {
      intervalId = setInterval(() => {
        frame += 1
        const revealCount = Math.floor((frame * text.length) / 20)
        setDisplay(
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' '
              if (index < revealCount) return char
              return chars[Math.floor(Math.random() * chars.length)]
            })
            .join('')
        )
        if (revealCount >= text.length) {
          setDisplay(text)
          clearInterval(intervalId)
        }
      }, STEP_MS)
    } else {
      const totalTicks = variant === 'glitch' ? 8 : 14
      intervalId = setInterval(() => {
        frame += 1
        if (frame >= totalTicks) {
          setDisplay(text)
          clearInterval(intervalId)
          return
        }
        setDisplay(
          text
            .split('')
            .map((char) => (char === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]))
            .join('')
        )
      }, STEP_MS)
    }

    return () => clearInterval(intervalId)
  }, [run, reducedMotion, text, variant])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
