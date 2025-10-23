import StatCard from './StatCard'
import FloatingShapes from './FloatingShapes'

const AboutSection = () => {
  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <FloatingShapes />
      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-teal-500 mb-6">
              About Life Compass
            </h2>
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              We're empowering individuals to navigate their personal journey with purpose and clarity. Our mission is to provide tools that help you discover, pursue, and achieve your most meaningful goals.
            </p>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Founded by a team of life coaches, psychologists, and technology experts, Life Compass combines evidence-based personal development techniques with cutting-edge AI to create a truly personalized growth experience. We believe everyone deserves a clear path to their dreams.
            </p>
            <button className="bg-linear-to-r from-teal-600 to-teal-700 px-8 py-3 rounded-full text-white font-semibold hover:from-teal-500 hover:to-teal-600 transition-all duration-300 glass-effect">
              Discover More
            </button>
          </div>
          <div className="liquid-glass-card p-8 relative overflow-hidden">
            <div className="grid grid-cols-2 gap-6">
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
