import { useEffect, useState } from 'react'
import { useInViewOnce } from '@/hooks/useInViewOnce'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type ScrambleVariant = 'scramble' | 'decrypt' | 'glitch'

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
  const [ref, seen] = useInViewOnce<HTMLSpanElement>()
  // Null means "not mid-animation", so the real text is what renders. Deriving
  // it that way rather than seeding state with `text` keeps the idle path free
  // of a setState, which would otherwise run on every mount for nothing.
  const [scrambled, setScrambled] = useState<string | null>(null)
  const animating = seen && !reducedMotion

  useEffect(() => {
    if (!animating) return

    const chars = variant === 'glitch' ? GLITCH_CHARS : SCRAMBLE_CHARS
    let frame = 0
    let intervalId: ReturnType<typeof setInterval>

    if (variant === 'decrypt') {
      intervalId = setInterval(() => {
        frame += 1
        const revealCount = Math.floor((frame * text.length) / 20)
        setScrambled(
          text
            .split('')
            .map((char, index) => {
              if (/\s/.test(char)) return char
              if (index < revealCount) return char
              return chars[Math.floor(Math.random() * chars.length)]
            })
            .join('')
        )
        if (revealCount >= text.length) {
          setScrambled(null)
          clearInterval(intervalId)
        }
      }, STEP_MS)
    } else {
      const totalTicks = variant === 'glitch' ? 8 : 14
      intervalId = setInterval(() => {
        frame += 1
        if (frame >= totalTicks) {
          setScrambled(null)
          clearInterval(intervalId)
          return
        }
        setScrambled(
          text
            .split('')
            .map((char) => (/\s/.test(char) ? char : chars[Math.floor(Math.random() * chars.length)]))
            .join('')
        )
      }, STEP_MS)
    }

    return () => clearInterval(intervalId)
  }, [animating, text, variant])

  return (
    <span ref={ref} className={className}>
      {scrambled ?? text}
    </span>
  )
}
