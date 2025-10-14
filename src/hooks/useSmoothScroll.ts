import { useEffect } from 'react'

export const useSmoothScroll = () => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault()
        const targetId = target.getAttribute('href')
        const targetSection = document.querySelector(targetId!)
        
        if (targetSection) {
          const offsetTop = targetSection.getBoundingClientRect().top + window.scrollY - 100
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          })
          
          // Update active nav state
          document.querySelectorAll('nav a[href^="#"]').forEach(link => {
            link.classList.remove('active')
          })
          target.classList.add('active')
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])
}
