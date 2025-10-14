import React from 'react'

interface StatCardProps {
  value: string
  label: string
  gradientFrom: string
  gradientTo: string
}

const StatCard: React.FC<StatCardProps> = ({ value, label, gradientFrom, gradientTo }) => {
  return (
    <div className="stat-card text-center">
      <div className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradientFrom} ${gradientTo} mb-2`}>
        {value}
      </div>
      <div className="text-gray-300 text-sm">{label}</div>
    </div>
  )
}

export default StatCard
