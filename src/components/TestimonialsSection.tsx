import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'motion/react';

interface TestimonialProps {
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
}

const testimonials: TestimonialProps[] = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechGrowth Inc.",
    quote: "This product transformed our customer engagement strategy. We've seen a 40% increase in conversion rates since implementation.",
    image: "/assets/img/testimonial-1.svg"
  },
  {
    name: "Michael Chen",
    role: "CTO",
    company: "Innovate Solutions",
    quote: "The integration was seamless and the support team was exceptional. Our development cycle shortened by weeks.",
    image: "/assets/img/testimonial-2.svg"
  },
  {
    name: "Elena Rodriguez",
    role: "Product Manager",
    company: "Global Systems",
    quote: "Intuitive, powerful, and exactly what our team needed. The ROI has been incredible in just the first quarter.",
    image: "/assets/img/testimonial-3.svg"
  }
];

const TestimonialCard = ({ name, role, company, quote, image }: TestimonialProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
      }}
      className="testimonial-card"
    >
      <div className="testimonial-content">
        <div className="quote-icon">
          <svg width="42" height="36" viewBox="0 0 42 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 0H9.75C7.16523 0 4.6875 1.03125 2.8125 2.90625C0.9375 4.78125 0 7.25 0 9.75V16.5C0 19 0.9375 21.4688 2.8125 23.3438C4.6875 25.2188 7.16523 26.25 9.75 26.25H16.5C19.0859 26.25 21.5625 25.2188 23.4375 23.3438C25.3125 21.4688 26.25 19 26.25 16.5V9.75C26.25 7.25 25.3125 4.78125 23.4375 2.90625C21.5625 1.03125 19.0859 0 16.5 0ZM42 9.75V16.5C42 19 41.0625 21.4688 39.1875 23.3438C37.3125 25.2188 34.8359 26.25 32.25 26.25H25.5C22.9141 26.25 20.4375 25.2188 18.5625 23.3438C16.6875 21.4688 15.75 19 15.75 16.5V9.75C15.75 7.25 16.6875 4.78125 18.5625 2.90625C20.4375 1.03125 22.9141 0 25.5 0H32.25C34.8359 0 37.3125 1.03125 39.1875 2.90625C41.0625 4.78125 42 7.25 42 9.75Z" fill="currentColor" fillOpacity="0.1"/>
          </svg>
        </div>
        <p className="quote-text">{quote}</p>
        <div className="testimonial-author">
          <div className="author-image">
            <img src={image} alt={name} />
          </div>
          <div className="author-info">
            <h4>{name}</h4>
            <p>{role}, {company}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <motion.div
          ref={sectionRef}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.6 } }
          }}
          className="section-header"
        >
          <h2>What Our Clients Say</h2>
          <p>Trusted by industry leaders worldwide</p>
        </motion.div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              {...testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;