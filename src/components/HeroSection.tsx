import FloatingShapes from './FloatingShapes'
import FeatureCard from './FeatureCard'

const HeroSection = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <FloatingShapes />

      {/* Crimson ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#B51A2B]/[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#541A2E]/[0.08] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-20">
        <div className="hero-content">
          {/* Editorial label */}
          <div className="animate-fade-in mb-8">
            <span className="label-editorial tracking-[0.3em] text-xs">Navigate Your Journey</span>
          </div>

          <h1 className="font-display text-7xl md:text-[8.5rem] font-semibold text-white mb-6 tracking-[-0.03em] leading-[0.9] animate-fade-in">
            Life
            <span className="block text-[#B51A2B]">Compass</span>
          </h1>

          <div className="section-divider animate-fade-in-delay-1" />

          <p className="text-lg md:text-xl text-[#DAD4D4]/80 mb-10 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-delay-1">
            Navigate life's journey with purpose and clarity. Our revolutionary platform guides you towards your goals with intelligent insights and personalized recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
            <button className="bg-[#B51A2B] px-10 py-4 rounded text-white text-sm font-semibold uppercase tracking-[0.15em] hover:bg-[#d63040] transition-all duration-400 shadow-[0_8px_30px_rgba(181,26,43,0.3)] hover:shadow-[0_16px_40px_rgba(181,26,43,0.4)] hover:-translate-y-0.5">
              Begin Your Journey
            </button>
            <button className="border border-[#DAD4D4]/20 px-10 py-4 rounded text-[#DAD4D4] text-sm font-medium uppercase tracking-[0.15em] hover:border-[#B51A2B]/40 hover:text-white transition-all duration-400 backdrop-blur-sm">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 relative animate-fade-in-delay-3">
          <div className="liquid-glass-card max-w-4xl mx-auto p-10 relative overflow-hidden">
            {/* Subtle top crimson border accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-[#B51A2B] to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
              <FeatureCard
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                }
                title="Goal Tracking"
                description="Track your progress with intelligent milestone tracking and achievement analytics."
                gradientFrom="from-teal-400"
                gradientTo="to-teal-500"
              />
              <FeatureCard
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
                title="Privacy First"
                description="Your personal journey data is protected with end-to-end encryption and privacy controls."
                gradientFrom="from-teal-500"
                gradientTo="to-teal-600"
              />
              <FeatureCard
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                }
                title="Personalized"
                description="AI-powered recommendations tailored to your unique life goals and preferences."
                gradientFrom="from-teal-400"
                gradientTo="to-teal-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
