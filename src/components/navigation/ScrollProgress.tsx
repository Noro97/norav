import { useAppStore } from '@/store/useAppStore'

export function ScrollProgress() {
  const progress = useAppStore((s) => s.scrollProgress)

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
      <div
        className="h-full bg-crimson-500/80 origin-left transition-none"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
