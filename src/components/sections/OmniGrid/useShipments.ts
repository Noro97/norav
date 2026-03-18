import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { SHIPMENTS, ShipmentRecordSchema } from './omnigrid.data'
import type { ShipmentRecord } from './omnigrid.data'
import { z } from 'zod'

const ResponseSchema = z.array(ShipmentRecordSchema)

// Simulated network fetch with Zod validation
async function fetchShipments(): Promise<ShipmentRecord[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 100))
  // Validate with Zod (demonstrates schema validation of "API responses")
  return ResponseSchema.parse(SHIPMENTS)
}

export function useShipments(): UseQueryResult<ShipmentRecord[]> & {
  cacheStatus: 'FRESH' | 'STALE' | 'FETCHING'
} {
  const query = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })

  const cacheStatus = query.isFetching
    ? 'FETCHING' as const
    : query.isStale
      ? 'STALE' as const
      : 'FRESH' as const

  return { ...query, cacheStatus }
}
