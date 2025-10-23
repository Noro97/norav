import FloatingShapes from './FloatingShapes'
import FeatureCard from './FeatureCard'

const HeroSection = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <FloatingShapes />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-20">
        <div className="hero-content">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 via-teal-300 to-teal-400 mb-6 tracking-tight leading-tight animate-fade-in">
            Life Compass
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay-1">
            Navigate life's journey with purpose and clarity. Our revolutionary platform guides you towards your goals with intelligent insights and personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
            <button className="bg-linear-to-r from-teal-600 to-teal-700 px-8 py-4 rounded-full text-white font-semibold hover:from-teal-500 hover:to-teal-600 transition-all duration-300 glass-effect transform hover:scale-105">
              Begin Your Journey
            </button>
            <button className="border border-white/30 px-8 py-4 rounded-full text-white font-semibold hover:bg-teal-500/20 transition-all duration-300 glass-effect transform hover:scale-105">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Liquid Glass Card */}
        <div className="mt-16 relative animate-fade-in-delay-3">
          <div className="liquid-glass-card max-w-4xl mx-auto p-8 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <FeatureCard
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                }
                title="Goal Tracking"
                description="Track your progress with intelligent milestone tracking and achievement analytics."
                gradientFrom="from-teal-400"
                gradientTo="to-teal-500"
              />
              <FeatureCard
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
                title="Privacy First"
                description="Your personal journey data is protected with end-to-end encryption and privacy controls."
                gradientFrom="from-teal-500"
                gradientTo="to-teal-600"
              />
              <FeatureCard
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
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
