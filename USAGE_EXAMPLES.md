## Example: Adding SplineSceneBasic to Your App

### Option 1: Add as a standalone section

```tsx
import React from 'react'
import { 
  Navigation, 
  HeroSection, 
  FeaturesSection, 
  SplineSceneBasic,  // Import the new component
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
      
      {/* Add the Spline 3D section here */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <SplineSceneBasic />
      </section>
      
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
```

### Option 2: Create a dedicated section component

```tsx
// src/components/SplineSection.tsx
import React from 'react'
import { SplineSceneBasic } from './SplineSceneBasic'

const SplineSection: React.FC = () => {
  return (
    <section 
      id="3d-showcase" 
      className="py-20 px-4 md:px-8 max-w-7xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Experience the Future
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Interact with our cutting-edge 3D visualization
        </p>
      </div>
      <SplineSceneBasic />
    </section>
  )
}

export default SplineSection
```

Then in App.tsx:
```tsx
import SplineSection from './components/SplineSection'

// In your return statement:
<SplineSection />
```

### Option 3: Replace an existing section

If you want to replace an existing section (e.g., ParallaxSection), simply swap it:

```tsx
const App: React.FC = () => {
  // ... hooks ...

  return (
    <div id="root">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <TimelineSection />
      <SplineSceneBasic />  {/* Instead of ParallaxSection */}
      <ScrollLinked />
      <TestimonialsSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  )
}
```
