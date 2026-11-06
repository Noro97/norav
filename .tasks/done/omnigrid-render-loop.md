# OmniGrid can hit React's update limit while its data loads

- **Found:** 2026-11-06, in S2, while rendering every page for the rehearsal
- **Where:** `src/components/sections/OmniGrid/OmniGridWidget.tsx:51` and `:87`, before the fix
- **Fixed:** 2026-11-06, in its own PR after S2

`const { data: shipments = [] } = useShipments()` makes a new empty array on every render until the query has data. So `table.getRowModel()` returns new `rows` each time, and `useLayoutEffect(() => setRenderTime(...), [rows])` sets state again, which renders again. The loop only stops when two runs round to the same time, or when the data arrives.

**Seen:** "Maximum update depth exceeded", and a blank `/work/omnigrid`, once in a dev build at 1440px inside an iframe.

**Not seen:** a normal dev load, four more loads at 375px, and three live loads with real 4x CPU throttling had no error. So it's timing-dependent, and it hasn't been shown to happen on the live site.

**Fix:** the default is now a module-level `const NO_SHIPMENTS: ShipmentRecord[] = []`, so `rows` keeps its reference until the data arrives. Nothing else in the widget changed.

**Verified:**

- `OmniGrid/__tests__/OmniGridWidget.test.tsx` renders the widget with the query held at no data, and `performance.now` stubbed so no two measurements match. Before the fix it threw "Maximum update depth exceeded". After it, the widget renders twice.
- Dev build, one fresh client-side load each, counting changes to the render-time stat: 26 with the old default, 2 with the fix. So the loop ran on an ordinary dev load, about halfway to React's limit of 50, without showing an error.
- Dev build at 375px: 100 rows and no "Maximum update depth" in the console.
- Production bundle at 1440px and 375px: 100 rows, no sideways scroll, and no errors or warnings in the console. Its one line is i18next's own info message. Filter, sort and the row modal work at 375px.
- The live site wasn't checked. The fix reaches it when this PR merges.
