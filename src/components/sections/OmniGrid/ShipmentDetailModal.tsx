import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Warehouse, Truck, ShieldCheck, MapPin, CircleCheckBig, X } from 'lucide-react'
import type { ShipmentRecord } from './omnigrid.data'
import { STATUS_COLORS, PRIORITY_COLORS } from './omnigrid.data'
import { useModalChrome } from '@/hooks/useModalChrome'

const TRACKING_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  package: Package, warehouse: Warehouse, truck: Truck,
  shieldCheck: ShieldCheck, mapPin: MapPin, circleCheckBig: CircleCheckBig,
}

interface Props {
  shipment: ShipmentRecord
  onClose: () => void
}

const TRACKING_STEPS = [
  { label: 'Order Placed', icon: 'package' },
  { label: 'Picked Up', icon: 'warehouse' },
  { label: 'In Transit', icon: 'truck' },
  { label: 'Customs', icon: 'shieldCheck' },
  { label: 'Last Mile', icon: 'mapPin' },
  { label: 'Delivered', icon: 'circleCheckBig' },
]

function getTrackingProgress(status: string): number {
  switch (status) {
    case 'Pending': return 1
    case 'In Transit': return 3
    case 'Delayed': return 3
    case 'Delivered': return 6
    default: return 1
  }
}

export function ShipmentDetailModal({ shipment, onClose }: Props) {
  useModalChrome(onClose)

  const progress = getTrackingProgress(shipment.status)

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-tertiary-shade/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="case-study-card relative w-full max-w-lg bg-tertiary-bg/95 shadow-2xl overflow-hidden"
        >
          {/* Top accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-secondary-500/40 to-transparent" />

          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="type-label text-secondary-300 mb-2">
                  Shipment Details
                </div>
                <h3 className="font-display text-display-sm font-black text-tertiary-ink">
                  {shipment.id}
                  <span className="text-tertiary-ink/45 text-body-sm font-normal ml-2">({shipment.code})</span>
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-tertiary-ink/[0.06] transition-colors text-tertiary-ink/40 hover:text-tertiary-ink/70"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <DetailField label="Origin" value={shipment.origin} />
              <DetailField label="Destination" value={shipment.destination} />
              <DetailField label="Carrier" value={shipment.carrier} />
              <DetailField label="ETD" value={shipment.etd} />
              <DetailField label="Weight" value={`${shipment.weight.toLocaleString()} kg`} />
              <DetailField label="Cost" value={`$${shipment.cost.toLocaleString()}`} valueClass="text-secondary-300 font-semibold" />
              <DetailField
                label="Status"
                value={shipment.status}
                valueClass={STATUS_COLORS[shipment.status]}
              />
              <DetailField
                label="Priority"
                value={shipment.priority}
                valueClass={PRIORITY_COLORS[shipment.priority]}
              />
            </div>

            {/* Tracking timeline */}
            <div className="mb-2">
              <div className="type-label text-tertiary-ink/45 mb-4">
                Tracking Timeline
              </div>
              <div className="flex items-center gap-1">
                {TRACKING_STEPS.map((step, i) => {
                  const isActive = i < progress
                  const isCurrent = i === progress - 1
                  return (
                    <div key={step.label} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-body-sm border transition-all ${
                            isCurrent
                              ? 'border-secondary-500/50 bg-secondary-500/20 shadow-[0_0_12px_color-mix(in_srgb,_var(--color-secondary-500)_30%,_transparent)]'
                              : isActive
                                ? 'border-status-success/30 bg-status-success/10'
                                : 'border-tertiary-ink/[0.06] bg-tertiary-ink/[0.02]'
                          }`}
                        >
                          {(() => {
                            const Icon = TRACKING_ICONS[step.icon]
                            return Icon ? <Icon size={16} className={isActive ? '' : 'opacity-30'} /> : null
                          })()}
                        </div>
                        <span className={`text-body-xs font-mono mt-1.5 text-center leading-tight ${
                          isActive ? 'text-tertiary-ink/50' : 'text-tertiary-ink/35'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {i < TRACKING_STEPS.length - 1 && (
                        <div className={`h-px flex-1 mx-1 ${
                          i < progress - 1 ? 'bg-status-success/30' : 'bg-tertiary-ink/[0.06]'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom glow */}
          <div className="h-px bg-gradient-to-r from-transparent via-secondary-500/20 to-transparent" />
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

function DetailField({ label, value, valueClass = 'text-tertiary-ink/70' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-xl bg-tertiary-ink/[0.02] border border-tertiary-ink/[0.06] p-3">
      <div className="type-label text-tertiary-ink/40 mb-1">{label}</div>
      <div className={`text-body-sm font-mono ${valueClass}`}>{value}</div>
    </div>
  )
}
