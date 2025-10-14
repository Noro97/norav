import { useEffect } from 'react'

export const useAnimationTriggers = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          
          // Staggered animations for child elements
          const children = entry.target.querySelectorAll('.feature-card, .stat-card, .glass-card')
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('animate-in')
            }, index * 100)
          })
        }
      })
    }, observerOptions)
    
    // Observe sections
    const sections = document.querySelectorAll('section')
    sections.forEach(section => observer.observe(section))

    return () => {
      sections.forEach(section => observer.unobserve(section))
    }
  }, [])
}
