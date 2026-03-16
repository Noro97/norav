interface SlideCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradientFrom: string
  gradientTo: string
}

const SlideCard = ({ icon, title, description, gradientFrom, gradientTo }: SlideCardProps) => {
  return (
    <div className="slide min-w-80 glass-card p-8 rounded-2xl">
      <div className={`w-14 h-14 bg-linear-to-r ${gradientFrom} ${gradientTo} rounded-xl mb-6 flex items-center justify-center shadow-[0_4px_20px_rgba(181,26,43,0.2)]`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-[#DAD4D4]/60 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

export default SlideCard
