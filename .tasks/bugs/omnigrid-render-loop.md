# OmniGrid can hit React's update limit while its data loads

- **Found:** 2026-11-06, in S2, while rendering every page for the rehearsal
- **Where:** `src/components/sections/OmniGrid/OmniGridWidget.tsx:51` and `:87`
- **Not fixed.** S2 only reports it

`const { data: shipments = [] } = useShipments()` makes a new empty array on every render until the query has data. So `table.getRowModel()` returns new `rows` each time, and `useLayoutEffect(() => setRenderTime(...), [rows])` sets state again, which renders again. The loop only stops when two runs round to the same time, or when the data arrives.

**Seen:** "Maximum update depth exceeded", and a blank `/work/omnigrid`, once in a dev build at 1440px inside an iframe.

**Not seen:** a normal dev load, four more loads at 375px, and three live loads with real 4x CPU throttling had no error. So it's timing-dependent, and it hasn't been shown to happen on the live site.

**Fix:** give the default a stable reference, with a module-level `const NO_SHIPMENTS: ShipmentRecord[] = []`.
