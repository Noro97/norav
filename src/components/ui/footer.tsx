import { Button } from "@/components/ui/button"

interface FooterProps {
  logo: React.ReactNode
  brandName: string
  socialLinks: Array<{
    icon: React.ReactNode
    href: string
    label: string
  }>
  mainLinks: Array<{
    href: string
    label: string
  }>
  legalLinks: Array<{
    href: string
    label: string
  }>
  copyright: {
    text: string
    license?: string
  }
}

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  return (
    <footer className="pb-6 pt-16 lg:pb-8 lg:pt-24 relative">
      <div className="px-4 lg:px-8">
        <div className="md:flex md:items-start md:justify-between">
          <a
            href="/"
            className="flex items-center gap-x-2 group"
            aria-label={brandName}
          >
            <div className="relative">
              {logo}
              <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 rounded-lg blur-sm" />
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-linear-to-r from-white to-white/80">{brandName}</span>
          </a>
          <ul className="flex list-none mt-6 md:mt-0 space-x-3">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-teal-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-teal-500/20 group"
                  asChild
                >
                  <a href={link.href} target="_blank" aria-label={link.label}>
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-white/5 mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
          <nav className="lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="my-1 mx-2 shrink-0">
                  <a
                    href={link.href}
                    className="text-sm text-white/70 hover:text-teal-400 underline-offset-4 transition-colors duration-200 relative group px-2 py-1 rounded-md"
                  >
                    <span className="relative z-10">{link.label}</span>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md backdrop-blur-sm" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  <a
                    href={link.href}
                    className="text-sm text-white/50 hover:text-teal-400 underline-offset-4 transition-colors duration-200 relative group px-2 py-1 rounded-md"
                  >
                    <span className="relative z-10">{link.label}</span>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md backdrop-blur-sm" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 text-sm leading-6 text-white/40 whitespace-nowrap lg:mt-0 lg:row-[1/3] lg:col-[1/4]">
            <div>{copyright.text}</div>
            {copyright.license && <div className="text-white/30">{copyright.license}</div>}
          </div>
        </div>
      </div>
    </footer>
  )
}
