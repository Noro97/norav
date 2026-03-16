interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradientFrom: string
  gradientTo: string
}

const FeatureCard = ({ icon, title, description, gradientFrom, gradientTo }: FeatureCardProps) => {
  return (
    <div className="feature-card group">
      <div className={`w-10 h-10 bg-linear-to-r ${gradientFrom} ${gradientTo} rounded-lg mb-5 flex items-center justify-center shadow-[0_4px_16px_rgba(181,26,43,0.2)]`}>
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-[#DAD4D4]/70 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

export default FeatureCard
