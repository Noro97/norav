/**
 * Hand-rolled rather than a dependency: the admin needs eight glyphs and an icon
 * package is a megabyte and a build step to deliver them.
 */
const base = {
  width: 15,
  height: 15,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
)

export const PageIcon = () => (
  <svg {...base}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
)

export const SiteIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
  </svg>
)

export const PlusIcon = () => (
  <svg {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const PaletteIcon = () => (
  <svg {...base}>
    <path d="M12 3a9 9 0 1 0 0 18c1 0 1.7-.8 1.7-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.1 0-1 .8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-4-4-7.3-9-7.3z" />
    <circle cx="7.5" cy="12" r="1" fill="currentColor" />
    <circle cx="9.5" cy="8" r="1" fill="currentColor" />
    <circle cx="14.5" cy="7.5" r="1" fill="currentColor" />
  </svg>
)

export const MediaIcon = () => (
  <svg {...base}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m4 17 5-5 4 4 3-2 4 4" />
  </svg>
)

export const MenuIcon = () => (
  <svg {...base}>
    <path d="M4 6h16M4 12h16M4 18h10" />
  </svg>
)

export const RowsIcon = () => (
  <svg {...base}>
    <rect x="3" y="4" width="18" height="7" rx="1.5" />
    <rect x="3" y="14" width="18" height="6" rx="1.5" />
  </svg>
)
