import { AnimatedTestimonials } from "./ui/animated-testimonials";

const testimonials = [
  {
    quote:
      "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
    name: "Sarah Chen",
    designation: "Product Manager at TechFlow",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
    name: "Michael Rodriguez",
    designation: "CTO at InnovateSphere",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
    name: "Emily Watson",
    designation: "Operations Director at CloudScale",
    src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
    name: "James Kim",
    designation: "Engineering Lead at DataPro",
    src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
    name: "Lisa Thompson",
    designation: "VP of Technology at FutureNet",
    src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="testimonials-section relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shapes">
          <div className="svg-shape shape-1">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="60" fill="#B51A2B" fillOpacity="0.15"/>
              <circle cx="60" cy="60" r="40" fill="#B51A2B" fillOpacity="0.25"/>
              <circle cx="60" cy="60" r="20" fill="#B51A2B" fillOpacity="0.35"/>
            </svg>
          </div>
          <div className="svg-shape shape-2">
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="70" cy="70" r="70" fill="#d63040" fillOpacity="0.15"/>
              <circle cx="70" cy="70" r="45" fill="#d63040" fillOpacity="0.25"/>
              <circle cx="70" cy="70" r="25" fill="#d63040" fillOpacity="0.35"/>
            </svg>
          </div>
          <div className="svg-shape shape-3">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" rx="25" fill="#B51A2B" fillOpacity="0.15"/>
              <rect x="20" y="20" width="60" height="60" rx="15" fill="#B51A2B" fillOpacity="0.25"/>
            </svg>
          </div>
          <div className="svg-shape shape-4">
            <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="55" cy="55" r="55" fill="#541A2E" fillOpacity="0.15"/>
              <circle cx="55" cy="55" r="35" fill="#541A2E" fillOpacity="0.25"/>
              <circle cx="55" cy="55" r="20" fill="#541A2E" fillOpacity="0.35"/>
            </svg>
          </div>
          <div className="svg-shape shape-5">
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="90" height="90" rx="20" fill="#d63040" fillOpacity="0.15"/>
              <rect x="18" y="18" width="54" height="54" rx="12" fill="#d63040" fillOpacity="0.25"/>
            </svg>
          </div>
          <div className="svg-shape shape-6">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fill="#B51A2B" fillOpacity="0.2"/>
              <path d="M50 20L73.3 35V65L50 80L26.7 65V35L50 20Z" fill="#B51A2B" fillOpacity="0.3"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="container relative z-20">
        <div className="section-header">
          <h2>What Our Clients Say</h2>
          <p>Trusted by industry leaders worldwide</p>
        </div>
        
        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </div>
    </section>
  );
};

export default TestimonialsSection;