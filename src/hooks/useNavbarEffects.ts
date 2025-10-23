import { useEffect } from 'react'

export const useNavbarEffects = () => {
  useEffect(() => {
    const navbar = document.querySelector('nav')
    if (!navbar) return

    navbar.style.transition = 'transform 0.3s ease-in-out'

    let lastScrollY = window.scrollY
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          
          // Show/hide navbar based on scroll direction
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down - hide navbar
            navbar.style.transform = 'translateY(-100%)'
          } else {
            // Scrolling up - show navbar
            navbar.style.transform = 'translateY(0)'
          }
          
          lastScrollY = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
}
