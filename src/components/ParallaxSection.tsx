import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const ParallaxSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <section id="showcase" className="parallax-section" ref={ref}>
      <div className="container">
        <motion.div 
          className="parallax-content"
          style={{ opacity, scale }}
        >
          <h2>Innovative Solutions for Modern Challenges</h2>
          <p>Discover how our cutting-edge technology transforms businesses</p>
          <motion.button className="cta-button">Get Started</motion.button>
        </motion.div>
      </div>
      
      <div className="parallax-shapes">
        <motion.div className="shape shape-1" style={{ y: y1 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="60" fill="#94a3b8" fillOpacity="0.1"/>
            <circle cx="60" cy="60" r="40" fill="#94a3b8" fillOpacity="0.2"/>
            <circle cx="60" cy="60" r="20" fill="#94a3b8" fillOpacity="0.3"/>
          </svg>
        </motion.div>
        
        <motion.div className="shape shape-2" style={{ y: y2 }}>
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="20" fill="#cbd5e1" fillOpacity="0.15"/>
            <rect x="20" y="20" width="60" height="60" rx="10" fill="#cbd5e1" fillOpacity="0.25"/>
          </svg>
        </motion.div>
        
        <motion.div className="shape shape-3" style={{ y: y3 }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 0L74.6 20V60L40 80L5.4 60V20L40 0Z" fill="#22D3EE" fillOpacity="0.2"/>
          </svg>
        </motion.div>
      </div>
      
    </section>
  );
};

export default ParallaxSection;