import { useMediaQuery } from '@/hooks/useMediaQuery'

/** Whether the visitor asked the OS for less motion. Effects gate on this. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
