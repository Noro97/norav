import React from 'react'
import { 
  Navigation, 
  HeroSection, 
  FeaturesSection, 
  AboutSection, 
  ContactSection, 
  Footer,
  ScrollLinked,
  TestimonialsSection,
  TimelineSection,
  ParallaxSection
} from './components'
import { 
  useSmoothScroll, 
  useActiveNav, 
  useNavbarEffects, 
  useAnimationTriggers, 
  useRippleEffect 
} from './hooks'

const App: React.FC = () => {
  // Initialize all interactive features
  useSmoothScroll()
  useActiveNav()
  useNavbarEffects()
  useAnimationTriggers()
  useRippleEffect()

  return (
    <div id="root">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <TimelineSection />
      <ParallaxSection />
      <ScrollLinked />
      <TestimonialsSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  )
}

export default App
