import {
  SplineSceneBasic,
  Navigation,
  HeroSection,
  FeaturesSection,
  AboutSection,
  ContactSection,
  Footer,
  ScrollLinked,
  TestimonialsSection,
  TimelineSection,
  ParallaxSection,
  PricingSection,
} from "./components";
import {
  useSmoothScroll,
  useActiveNav,
  useNavbarEffects,
  useAnimationTriggers,
  useRippleEffect,
} from "./hooks";

const App = () => {
  // Initialize all interactive features
  useSmoothScroll();
  useActiveNav();
  useNavbarEffects();
  useAnimationTriggers();
  useRippleEffect();

  return (
    <>
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      
      {/* Spline 3D Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <SplineSceneBasic />
      </section>
      
      <TimelineSection />
      <ParallaxSection />
      <ScrollLinked />
      <TestimonialsSection />
      <AboutSection />
      <PricingSection />
      <ContactSection />
      <Footer />
    </>
  );
};

export default App;
