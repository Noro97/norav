import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { SpotlightInteractive } from "@/components/ui/spotlight"
 
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-transparent relative overflow-hidden">
      <SpotlightInteractive 
        size={400}
        className="from-white via-white/50"
      />
      
      <div className="flex h-full">
        {/* Left content */}
        <div className="flex-1 p-12 md:p-16 relative z-10 flex flex-col justify-center">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-tight tracking-[-0.02em]">
            Interactive <span className="italic text-[#B51A2B]">3D</span>
          </h1>
          <p className="mt-6 text-[#DAD4D4]/70 text-sm md:text-base max-w-lg leading-relaxed">
            Bring your UI to life with beautiful 3D scenes. Create immersive experiences
            that capture attention and enhance your design.
          </p>
        </div>

        {/* Right content */}
        <div className="flex-1 relative">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
