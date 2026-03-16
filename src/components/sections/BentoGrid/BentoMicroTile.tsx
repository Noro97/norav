import { useTranslation } from 'react-i18next'

const ICONS: Record<string, React.ReactNode> = {
  zap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
}

interface BentoMicroTileProps {
  index: number
  icon: string
}

export function BentoMicroTile({ index, icon }: BentoMicroTileProps) {
  const { t } = useTranslation('bento')

  return (
    <div className="bento-tile glass-card p-5 flex flex-col gap-3">
      <div className="w-9 h-9 rounded-lg bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center text-crimson-400">
        {ICONS[icon] ?? ICONS.zap}
      </div>
      <h3 className="text-sm font-bold text-white">
        {t(`tiles.${index}.title`)}
      </h3>
      <p className="text-xs text-white/40 leading-relaxed">
        {t(`tiles.${index}.description`)}
      </p>
    </div>
  )
}
