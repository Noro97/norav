import { useEffect } from 'react'

export const useRippleEffect = () => {
  useEffect(() => {
    const createRipple = (e: MouseEvent) => {
      const button = e.target as HTMLButtonElement
      if (button.tagName !== 'BUTTON') return

      const ripple = document.createElement('span')
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `
      
      button.style.position = 'relative'
      button.style.overflow = 'hidden'
      button.appendChild(ripple)
      
      setTimeout(() => ripple.remove(), 600)
    }

    document.addEventListener('click', createRipple)
    return () => document.removeEventListener('click', createRipple)
  }, [])
}
