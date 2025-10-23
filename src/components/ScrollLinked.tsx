"use client" 

import { 
    animate, 
    motion, 
    MotionValue, 
    useMotionValue, 
    useMotionValueEvent, 
    useScroll, 
} from "motion/react" 
import { useRef } from "react" 

export default function ScrollLinked() { 
    const ref = useRef(null) 
    const { scrollXProgress } = useScroll({ container: ref }) 
    const maskImage = useScrollOverflowMask(scrollXProgress) 

    return ( 
        <section className="relative overflow-hidden py-20">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="floating-shapes">
                    <div className="svg-shape shape-1">
                        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="60" cy="60" r="60" fill="#38859c" fillOpacity="0.15"/>
                            <circle cx="60" cy="60" r="40" fill="#38859c" fillOpacity="0.25"/>
                            <circle cx="60" cy="60" r="20" fill="#38859c" fillOpacity="0.35"/>
                        </svg>
                    </div>
                    <div className="svg-shape shape-3">
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100" height="100" rx="25" fill="#38859c" fillOpacity="0.15"/>
                            <rect x="20" y="20" width="60" height="60" rx="15" fill="#38859c" fillOpacity="0.25"/>
                        </svg>
                    </div>
                    <div className="svg-shape shape-4">
                        <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="55" cy="55" r="55" fill="#2d6a7c" fillOpacity="0.15"/>
                            <circle cx="55" cy="55" r="35" fill="#2d6a7c" fillOpacity="0.25"/>
                            <circle cx="55" cy="55" r="20" fill="#2d6a7c" fillOpacity="0.35"/>
                        </svg>
                    </div>
                    <div className="svg-shape shape-5">
                        <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="90" height="90" rx="20" fill="#4a9fb8" fillOpacity="0.15"/>
                            <rect x="18" y="18" width="54" height="54" rx="12" fill="#4a9fb8" fillOpacity="0.25"/>
                        </svg>
                    </div>
                    <div className="svg-shape shape-6">
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fill="#38859c" fillOpacity="0.2"/>
                            <path d="M50 20L73.3 35V65L50 80L26.7 65V35L50 20Z" fill="#38859c" fillOpacity="0.3"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div id="example" className="relative z-20"> 
                <svg id="progress" width="80" height="80" viewBox="0 0 100 100"> 
                    <circle cx="50" cy="50" r="30" pathLength="1" className="bg" /> 
                    <motion.circle 
                        cx="50" 
                        cy="50" 
                        r="30" 
                        className="indicator" 
                        style={{ pathLength: scrollXProgress }} 
                    /> 
                </svg> 
                <motion.ul ref={ref} style={{ maskImage }}> 
                    <li style={{ background: "#ff0088" }}></li> 
                    <li style={{ background: "#dd00ee" }}></li> 
                    <li style={{ background: "#9911ff" }}></li> 
                    <li style={{ background: "#0d63f8" }}></li> 
                    <li style={{ background: "#0cdcf7" }}></li> 
                    <li style={{ background: "#8df0cc" }}></li> 
                </motion.ul> 
            </div> 
        </section>
    ) 
} 

const left = `0%` 
const right = `100%` 
const leftInset = `20%` 
const rightInset = `80%` 
const transparent = `#0000` 
const opaque = `#000`

function useScrollOverflowMask(scrollXProgress: MotionValue<number>) { 
    const maskImage = useMotionValue( 
        `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})` 
    ) 

    useMotionValueEvent(scrollXProgress, "change", (value) => { 
        if (value === 0) { 
            animate( 
                maskImage, 
                `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})` 
            ) 
        } else if (value === 1) { 
            animate( 
                maskImage, 
                `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${right}, ${opaque})` 
            ) 
        } else if ( 
            scrollXProgress.getPrevious() === 0 || 
            scrollXProgress.getPrevious() === 1 
        ) { 
            animate( 
                maskImage, 
                `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${rightInset}, ${transparent})` 
            ) 
        } 
    }) 

    return maskImage 
}