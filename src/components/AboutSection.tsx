import React from 'react'
import StatCard from './StatCard'

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              About Life Compass
            </h2>
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              We're empowering individuals to navigate their personal journey with purpose and clarity. Our mission is to provide tools that help you discover, pursue, and achieve your most meaningful goals.
            </p>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Founded by a team of life coaches, psychologists, and technology experts, Life Compass combines evidence-based personal development techniques with cutting-edge AI to create a truly personalized growth experience. We believe everyone deserves a clear path to their dreams.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 rounded-full text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-300 glass-effect">
              Discover More
            </button>
          </div>
          <div className="liquid-glass-card p-8 relative overflow-hidden">
            <div className="grid grid-cols-2 gap-6">
              <StatCard value="25k+" label="Life Journeys" gradientFrom="from-purple-400" gradientTo="to-blue-400" />
              <StatCard value="94%" label="Goal Achievement" gradientFrom="from-blue-400" gradientTo="to-purple-400" />
              <StatCard value="180+" label="Countries" gradientFrom="from-purple-400" gradientTo="to-pink-400" />
              <StatCard value="24/7" label="Guidance" gradientFrom="from-pink-400" gradientTo="to-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
