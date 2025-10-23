interface StatCardProps {
  value: string
  label: string
  gradientFrom: string
  gradientTo: string
}

const StatCard = ({ value, label, gradientFrom, gradientTo }: StatCardProps) => {
  return (
    <div className="stat-card text-center">
      <div className={`text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r ${gradientFrom} ${gradientTo} mb-2`}>
        {value}
      </div>
      <div className="text-gray-300 text-sm">{label}</div>
    </div>
  )
}

export default StatCard
