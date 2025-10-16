import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const ParallaxSection: React.FC = () => {
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
            <circle cx="60" cy="60" r="60" fill="#4A6CF7" fillOpacity="0.1"/>
            <circle cx="60" cy="60" r="40" fill="#4A6CF7" fillOpacity="0.2"/>
            <circle cx="60" cy="60" r="20" fill="#4A6CF7" fillOpacity="0.3"/>
          </svg>
        </motion.div>
        
        <motion.div className="shape shape-2" style={{ y: y2 }}>
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="20" fill="#F123C4" fillOpacity="0.15"/>
            <rect x="20" y="20" width="60" height="60" rx="10" fill="#F123C4" fillOpacity="0.25"/>
          </svg>
        </motion.div>
        
        <motion.div className="shape shape-3" style={{ y: y3 }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 0L74.6 20V60L40 80L5.4 60V20L40 0Z" fill="#22D3EE" fillOpacity="0.2"/>
          </svg>
        </motion.div>
      </div>
      
      <StyleSheet />
    </section>
  );
};

const StyleSheet = () => (
  <style>
    {`
    .parallax-section {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      color: #333;
    }

    .parallax-content {
      text-align: center;
      z-index: 10;
      padding: 30px;
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      backdrop-filter: blur(20px);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        inset 0 -1px 0 rgba(255, 255, 255, 0.1);
    }

    .parallax-content h2 {
      font-size: 3rem;
      margin-bottom: 20px;
      background: linear-gradient(90deg, #4a6cf7 0%, #f123c4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .parallax-content p {
      font-size: 1.25rem;
      margin-bottom: 30px;
      color: rgba(255, 255, 255, 0.8);
    }

    .cta-button {
      background: linear-gradient(90deg, #4a6cf7 0%, #f123c4 100%);
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 30px;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 10px 20px rgba(74, 108, 247, 0.3);
    }

    .cta-button:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(74, 108, 247, 0.4);
    }

    .parallax-shapes {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .shape {
      position: absolute;
    }

    .shape-1 {
      top: 15%;
      left: 10%;
    }

    .shape-2 {
      top: 60%;
      right: 15%;
    }

    .shape-3 {
      bottom: 20%;
      left: 25%;
    }

    @media (max-width: 768px) {
      .parallax-content h2 {
        font-size: 2rem;
      }
      
      .parallax-content p {
        font-size: 1rem;
      }
    }
    `}
  </style>
);

export default ParallaxSection;