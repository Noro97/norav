interface StatCardProps {
  value: string
  label: string
  gradientFrom: string
  gradientTo: string
}

const StatCard = ({ value, label }: StatCardProps) => {
  return (
    <div className="stat-card text-center py-4">
      <div className="font-display text-4xl font-semibold text-white mb-1 tracking-tight">
        {value}
      </div>
      <div className="text-[#DAD4D4]/60 text-xs uppercase tracking-[0.15em]">{label}</div>
    </div>
  )
}

export default StatCard
