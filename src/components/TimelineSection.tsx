import { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface TimelineItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}

const timelineItems = [
  {
    title: "Research & Discovery",
    description: "We analyze your needs and market opportunities to create a strategic roadmap.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    title: "Planning & Strategy",
    description: "We develop a comprehensive plan tailored to your specific goals and requirements.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    title: "Design & Development",
    description: "Our expert team brings your vision to life with cutting-edge technology and design.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19L19 12L22 15L15 22L12 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 2L9.586 9.586" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 13C12.1046 13 13 12.1046 13 11C13 9.89543 12.1046 9 11 9C9.89543 9 9 9.89543 9 11C9 12.1046 9.89543 13 11 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    title: "Testing & Refinement",
    description: "We rigorously test and optimize to ensure flawless performance and user experience.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.9 13.5C19.7388 15.5877 18.7603 17.5339 17.1518 18.9456C15.5434 20.3573 13.4365 21.1323 11.3 21.1323C9.16347 21.1323 7.05657 20.3573 5.44815 18.9456C3.83972 17.5339 2.86125 15.5877 2.7 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 6L12 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    title: "Launch & Growth",
    description: "We deploy your solution and provide ongoing support to ensure continued success.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
];

const TimelineItem = ({ title, description, icon, index }: TimelineItemProps) => {
  const itemRef = useRef(null);
  const isInView = useInView(itemRef, { once: false, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={itemRef}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
        visible: { 
          opacity: 1, 
          x: 0, 
          transition: { 
            duration: 0.6, 
            ease: "easeOut",
            delay: index * 0.2 
          } 
        }
      }}
      className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
    >
      <div className="timeline-content">
        <div className="timeline-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.div>
  );
};

const TimelineSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <section id="process" className="timeline-section relative overflow-hidden">
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
        <motion.div
          ref={sectionRef}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
          }}
          className="section-header"
        >
          <h2>Our Process</h2>
          <p>How we turn your vision into reality</p>
        </motion.div>
        
        <div className="timeline">
          <div className="timeline-line"></div>
          {timelineItems.map((item, index) => (
            <TimelineItem
              key={index}
              index={index}
              title={item.title}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;