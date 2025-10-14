import React from 'react'

interface SlideCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradientFrom: string
  gradientTo: string
}

const SlideCard: React.FC<SlideCardProps> = ({ icon, title, description, gradientFrom, gradientTo }) => {
  return (
    <div className="slide min-w-80 glass-card p-8 rounded-2xl">
      <div className={`w-16 h-16 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-xl mb-6 glass-effect flex items-center justify-center`}>
        {icon}
      </div>
      <h3 className="text-2xl font-semibold text-white mb-4">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  )
}

export default SlideCard
