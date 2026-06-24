import { useEffect } from 'react'

// Shared lock depth so stacked/nested modals don't unlock body scroll until the
// last one closes (a per-modal cleanup would otherwise reset overflow early).
let lockCount = 0

/** Standard modal behavior: close on Escape and lock body scroll while mounted. */
export function useModalChrome(onClose: () => void) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    if (lockCount === 0) document.body.style.overflow = 'hidden'
    lockCount++
    return () => {
      document.removeEventListener('keydown', handleKey)
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) document.body.style.overflow = ''
    }
  }, [onClose])
}
