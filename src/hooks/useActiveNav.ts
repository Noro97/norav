import { useEffect } from 'react'

export const useActiveNav = () => {
  useEffect(() => {
    const updateActiveNavigation = () => {
      const sections = document.querySelectorAll('section[id]')
      const navLinks = document.querySelectorAll('nav a[href^="#"]')
      let current = ''
      
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY - 150
        const sectionHeight = section.clientHeight
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          current = section.getAttribute('id') || ''
        }
      })
      
      navLinks.forEach(link => {
        link.classList.remove('active')
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active')
        }
      })
    }

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveNavigation()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
}
