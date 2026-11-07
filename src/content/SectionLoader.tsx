/** What a section shows while its chunk arrives. Tall enough to keep what follows below the fold. */
export function SectionLoader({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`${tall ? 'min-h-screen' : 'min-h-[50vh]'} flex items-center justify-center`}>
      <div className="w-5 h-5 border-2 border-primary-500/20 border-t-crimson-500 rounded-full animate-spin" />
    </div>
  )
}
