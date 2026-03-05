import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import React from 'react'

interface Props {
  menu: Footer['navItems']
}

export function FooterMenu({ menu }: Props) {
  if (!menu?.length) return null

  return (
    <nav aria-label="Footer navigation">
      <ul className="space-y-2">
        {menu.map((item) => {
          return (
            <li key={item.id}>
              <CMSLink
                appearance="inline"
                className="inline-flex text-sm text-foreground/80 transition-colors hover:text-[color:var(--site-accent-hover)]"
                {...item.link}
              />
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
