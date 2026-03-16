import StatCard from './StatCard'
import FloatingShapes from './FloatingShapes'

const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <FloatingShapes />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#541A2E]/10 blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="label-editorial tracking-[0.3em] text-xs mb-4 block">Our Story</span>
            <h2 className="font-display text-5xl md:text-6xl font-semibold text-white mb-6 tracking-[-0.02em] leading-[1.05]">
              About Life
              <span className="italic text-[#B51A2B]"> Compass</span>
            </h2>
            <div className="section-divider !mx-0 mb-8" />
            <p className="text-base text-[#DAD4D4]/80 mb-5 leading-relaxed">
              We're empowering individuals to navigate their personal journey with purpose and clarity. Our mission is to provide tools that help you discover, pursue, and achieve your most meaningful goals.
            </p>
            <p className="text-sm text-[#DAD4D4]/60 mb-10 leading-relaxed">
              Founded by a team of life coaches, psychologists, and technology experts, Life Compass combines evidence-based personal development techniques with cutting-edge AI to create a truly personalized growth experience. We believe everyone deserves a clear path to their dreams.
            </p>
            <button className="bg-[#B51A2B] px-10 py-3.5 rounded text-white text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#d63040] transition-all duration-400 shadow-[0_8px_24px_rgba(181,26,43,0.25)]">
              Discover More
            </button>
          </div>
          <div className="liquid-glass-card p-10 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-gradient-to-r from-transparent via-[#B51A2B] to-transparent" />
            <div className="grid grid-cols-2 gap-8">
              <StatCard value="25k+" label="Life Journeys" gradientFrom="from-teal-400" gradientTo="to-teal-500" />
              <StatCard value="94%" label="Goal Achievement" gradientFrom="from-teal-500" gradientTo="to-teal-600" />
              <StatCard value="180+" label="Countries" gradientFrom="from-teal-400" gradientTo="to-teal-500" />
              <StatCard value="24/7" label="Guidance" gradientFrom="from-teal-500" gradientTo="to-teal-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
