import React from 'react'
import FeaturesSlider from './FeaturesSlider'

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-6">
            Powerful Life Navigation Tools
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover what makes Life Compass the ultimate companion for personal growth and goal achievement
          </p>
        </div>

        <FeaturesSlider />
      </div>
    </section>
  )
}

export default FeaturesSection
