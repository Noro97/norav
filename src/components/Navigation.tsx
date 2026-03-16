import { useState, useEffect } from 'react'
import { useNavbarEffects } from '../hooks'

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#process', label: 'Process' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#about', label: 'About' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
]

const Navigation = () => {
  useNavbarEffects()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Nav bar — always on top */}
      <nav className={`fixed top-0 left-0 right-0 px-6 py-4 border-b border-white/[0.04] transition-all duration-300 ${isOpen ? 'z-[100] bg-[#16162F]' : 'z-50 backdrop-blur-md bg-[#16162F]/40'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="#home" className="flex items-center space-x-3">
            <img src="/assets/img/logo-new.svg" alt="Life Compass" className="w-12 h-12" />
            <span className="text-4xl text-[#B51A2B] tracking-wide" style={{ fontFamily: "'Righteous', cursive" }}>Life Compass</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#DAD4D4]/60 hover:text-white transition-colors duration-300 text-[13px] tracking-wide uppercase"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <button className="hidden md:block bg-[#B51A2B] px-6 py-2 rounded text-white text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-[#d63040] transition-all duration-300 shadow-[0_4px_16px_rgba(181,26,43,0.25)]">
            Start Journey
          </button>

          {/* Mobile: burger or X */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DAD4D4" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DAD4D4" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[99] bg-[#16162F] flex flex-col items-center justify-center pt-20">
          <div className="flex flex-col items-center space-y-7">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-[#DAD4D4] hover:text-[#B51A2B] text-lg uppercase tracking-[0.2em] transition-colors duration-300"
                style={{
                  animation: 'fadeSlideIn 0.3s ease forwards',
                  animationDelay: `${i * 40}ms`,
                  opacity: 0,
                }}
              >
                {link.label}
              </a>
            ))}
            <div
              className="pt-6"
              style={{
                animation: 'fadeSlideIn 0.3s ease forwards',
                animationDelay: `${navLinks.length * 40}ms`,
                opacity: 0,
              }}
            >
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="bg-[#B51A2B] px-10 py-3.5 rounded text-white text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#d63040] transition-all duration-300 shadow-[0_4px_16px_rgba(181,26,43,0.25)]"
              >
                Start Journey
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

export default Navigation
