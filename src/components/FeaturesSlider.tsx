import React, { useRef } from 'react'
import SlideCard from './SlideCard'

const FeaturesSlider: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (sliderRef.current) {
      sliderRef.current.style.animationPlayState = 'paused'
    }
  }

  const handleMouseLeave = () => {
    if (sliderRef.current) {
      sliderRef.current.style.animationPlayState = 'running'
    }
  }

  return (
    <div className="slider-container overflow-hidden relative">
      <div 
        ref={sliderRef}
        className="slider-track flex space-x-8 animate-slide"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SlideCard
          icon={
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          }
          title="Life Insights"
          description="Get deep insights into your progress with our AI-powered analytics that understand your personal growth patterns."
          gradientFrom="from-purple-500"
          gradientTo="to-blue-500"
        />
        <SlideCard
          icon={
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          }
          title="Cross-Platform"
          description="Access your life compass on any device - seamlessly sync your goals and progress across all platforms."
          gradientFrom="from-blue-500"
          gradientTo="to-purple-500"
        />
        <SlideCard
          icon={
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          }
          title="Goal Synchronization"
          description="Keep your aspirations aligned with real-time goal tracking and milestone celebrations with friends and mentors."
          gradientFrom="from-purple-500"
          gradientTo="to-pink-500"
        />
        <SlideCard
          icon={
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          }
          title="Personal Security"
          description="Your personal journey and sensitive goal data are protected with military-grade encryption and privacy controls."
          gradientFrom="from-blue-500"
          gradientTo="to-cyan-500"
        />
      </div>
    </div>
  )
}

export default FeaturesSlider
