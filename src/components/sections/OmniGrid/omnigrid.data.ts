import { z } from 'zod'
import { createColumnHelper } from '@tanstack/react-table'

// --- Zod schema for API response validation ---
const ShipmentStatusEnum = z.enum(['Pending', 'In Transit', 'Delivered', 'Delayed'])
const ShipmentPriorityEnum = z.enum(['Low', 'Medium', 'High', 'Critical'])

export const ShipmentRecordSchema = z.object({
  id: z.string(),
  code: z.string(),
  origin: z.string(),
  destination: z.string(),
  carrier: z.string(),
  status: ShipmentStatusEnum,
  weight: z.number(),
  cost: z.number(),
  etd: z.string(),
  priority: ShipmentPriorityEnum,
})

export type ShipmentRecord = z.infer<typeof ShipmentRecordSchema>
export type ShipmentStatus = z.infer<typeof ShipmentStatusEnum>
export type ShipmentPriority = z.infer<typeof ShipmentPriorityEnum>

// --- Deterministic PRNG ---
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// --- Data pools ---
const CITIES = [
  'Shanghai', 'Rotterdam', 'Singapore', 'Hamburg', 'Los Angeles',
  'Dubai', 'Busan', 'Hong Kong', 'Mumbai', 'Felixstowe',
  'Antwerp', 'Tokyo', 'New York', 'Santos', 'Colombo',
  'Piraeus', 'Jeddah', 'Tanjung Pelepas', 'Laem Chabang', 'Valencia',
]

const CARRIERS = ['DHL', 'FedEx', 'Maersk', 'UPS', 'DB Schenker', 'Hapag-Lloyd', 'MSC', 'CMA CGM']

const STATUSES: ShipmentStatus[] = ['Pending', 'In Transit', 'Delivered', 'Delayed']
const PRIORITIES: ShipmentPriority[] = ['Low', 'Medium', 'High', 'Critical']

// --- Generator ---
function generateShipments(count: number): ShipmentRecord[] {
  const rand = seededRandom(42)
  const records: ShipmentRecord[] = []

  for (let i = 0; i < count; i++) {
    const originIdx = Math.floor(rand() * CITIES.length)
    let destIdx = Math.floor(rand() * CITIES.length)
    if (destIdx === originIdx) destIdx = (destIdx + 1) % CITIES.length

    const day = 1 + Math.floor(rand() * 28)
    const month = 1 + Math.floor(rand() * 12)

    records.push({
      id: `SHP-${String(i + 1).padStart(5, '0')}`,
      code: String.fromCharCode(65 + Math.floor(rand() * 26))
        + String.fromCharCode(65 + Math.floor(rand() * 26))
        + String(Math.floor(rand() * 10000)).padStart(4, '0'),
      origin: CITIES[originIdx]!,
      destination: CITIES[destIdx]!,
      carrier: CARRIERS[Math.floor(rand() * CARRIERS.length)]!,
      status: STATUSES[Math.floor(rand() * STATUSES.length)]!,
      weight: Math.round((50 + rand() * 9950) * 10) / 10,
      cost: Math.round((100 + rand() * 49900) * 100) / 100,
      etd: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      priority: PRIORITIES[Math.floor(rand() * PRIORITIES.length)]!,
    })
  }

  return records
}

// Module-level singleton (generated once)
export const SHIPMENTS = generateShipments(100)

// --- TanStack Table column definitions ---
const col = createColumnHelper<ShipmentRecord>()

export const OMNIGRID_COLUMNS = [
  col.accessor('id', { header: 'ID', size: 110 }),
  col.accessor('code', { header: 'Code', size: 90 }),
  col.accessor('origin', { header: 'Origin', size: 130 }),
  col.accessor('destination', { header: 'Dest', size: 130 }),
  col.accessor('carrier', { header: 'Carrier', size: 110 }),
  col.accessor('status', { header: 'Status', size: 100 }),
  col.accessor('weight', {
    header: 'Weight',
    size: 90,
    cell: (info) => `${info.getValue().toLocaleString()} kg`,
  }),
  col.accessor('cost', {
    header: 'Cost',
    size: 100,
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
  col.accessor('etd', { header: 'ETD', size: 110 }),
  col.accessor('priority', { header: 'Priority', size: 90 }),
]

// Mini-table columns for bento tile (subset)
export const MINI_COLUMNS = [
  col.accessor('id', { header: 'ID', size: 90 }),
  col.accessor('origin', { header: 'Origin', size: 100 }),
  col.accessor('destination', { header: 'Dest', size: 100 }),
  col.accessor('status', { header: 'Status', size: 80 }),
  col.accessor('cost', {
    header: 'Cost',
    size: 80,
    cell: (info) => `$${Math.round(info.getValue()).toLocaleString()}`,
  }),
]

// Status colours carry meaning, so they stay put when the theme changes —
// "Delayed" has to read as delayed on a green-accented site. In Transit used
// the same cyan as the widget's accent, which is why it used to move with it.
export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  'Pending': 'text-warning',
  'In Transit': 'text-info',
  'Delivered': 'text-success',
  'Delayed': 'text-danger',
}

export const PRIORITY_COLORS: Record<ShipmentPriority, string> = {
  'Low': 'text-white/40',
  'Medium': 'text-amber-400',
  'High': 'text-orange-400',
  'Critical': 'text-red-400',
}
