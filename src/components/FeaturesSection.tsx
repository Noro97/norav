import FeaturesSlider from './FeaturesSlider'
import FloatingShapes from './FloatingShapes'

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <FloatingShapes />
      {/* Section glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#B51A2B]/[0.04] blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="text-center mb-16">
          <span className="label-editorial tracking-[0.3em] text-xs mb-4 block">What We Offer</span>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-white mb-4 tracking-[-0.02em] leading-[1.05]">
            Powerful Life
            <span className="italic text-[#B51A2B]"> Navigation</span> Tools
          </h2>
          <div className="section-divider mt-6" />
          <p className="text-base text-[#DAD4D4]/70 max-w-xl mx-auto leading-relaxed">
            Discover what makes Life Compass the ultimate companion for personal growth and goal achievement
          </p>
        </div>

        <FeaturesSlider />
      </div>
    </section>
  )
}

export default FeaturesSection
