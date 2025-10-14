import React from 'react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradientFrom: string
  gradientTo: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradientFrom, gradientTo }) => {
  return (
    <div className="feature-card">
      <div className={`w-12 h-12 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-lg mb-4 glass-effect flex items-center justify-center`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  )
}

export default FeatureCard
