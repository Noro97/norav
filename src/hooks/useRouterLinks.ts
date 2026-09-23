import { useEffect, type RefObject } from 'react'
import { useNavigate } from 'react-router'

/**
 * Sends plain links to pages of this site through the router.
 *
 * Most of the site links with the router's own <Link>. Two things cannot: the
 * imported kit sections, which render plain <a href> from their content, and a
 * post body, which is HTML from the CMS. Without this every such click reloads
 * the whole application to show a page it already has. So a click on a link
 * inside `root` that leads to a page of this site becomes a router navigation;
 * everything a browser should keep handling — a new tab, a modified click, a
 * download, another origin, mail — is left alone.
 */
export function useRouterLinks(root: RefObject<HTMLElement | null>) {
  const navigate = useNavigate()

  useEffect(() => {
    const element = root.current
    if (!element) return

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const link = (event.target as Element | null)?.closest?.('a[href]')
      if (!(link instanceof HTMLAnchorElement)) return
      if (link.target && link.target !== '_self') return
      if (link.hasAttribute('download')) return

      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin) return

      event.preventDefault()
      navigate(url.pathname + url.search)
    }

    element.addEventListener('click', onClick)
    return () => element.removeEventListener('click', onClick)
  }, [root, navigate])
}
