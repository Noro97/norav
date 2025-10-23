import FeaturesSlider from './FeaturesSlider'

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-teal-500 mb-6">
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
