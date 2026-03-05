'use client'

import { Button } from '@/components/ui/button'
import { Cart } from '@/components/Cart'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { MobileMenu } from './MobileMenu'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/cn'
import { ChevronDown } from 'lucide-react'
import { SearchOverlay } from './SearchOverlay'

type Props = {
  categories: {
    children?: {
      dropdownImageUrl?: string
      href: string
      id: string
      title: string
    }[]
    dropdownImageUrl?: string
    href: string
    id: string
    title: string
  }[]
  menu: {
    href: string
    id: string
    label: string
  }[]
}

export function HeaderClient({ categories, menu }: Props) {
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-50 border-b bg-background/92 backdrop-blur-md supports-[backdrop-filter]:bg-background/82">
      <nav className="container flex h-16 items-center justify-between">
        <div className="block flex-none md:hidden">
          <MobileMenu categories={categories} menu={menu} />
        </div>
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex w-full items-center gap-6 md:flex-1">
            <Link className="flex w-full items-center justify-center md:w-auto" href="/">
              <img
                src="/blacklogo.svg"
                alt="Black Tech Light"
                className="headerBrandLogo"
              />
            </Link>
            <ul className="hidden gap-4 text-sm md:flex md:items-center">
              {menu.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn('relative navLink px-0.5 py-1', {
                      active: item.href !== '/' ? pathname.includes(item.href) : false,
                    })}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <Suspense fallback={null}>
              <SearchOverlay />
            </Suspense>
            <Cart />
            <div className="catalogDropdown">
              <Button
                asChild
                className="hidden md:inline-flex gap-2 font-mono text-xs font-normal uppercase tracking-widest"
                variant="outline"
              >
                <Link href="/catalog">
                  Каталог <ChevronDown className="h-4 w-4" />
                </Link>
              </Button>
              <div className="catalogMenu">
                <ul>
                  <li>
                    <Link className="catalogMenuLink catalogMenuAllLink" href="/catalog">
                      Все категории
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id} className="catalogMenuItem">
                      <Link className="catalogMenuLink catalogMenuParentLink" href={category.href}>
                        {category.children?.length ? <ChevronDown className="catalogMenuParentArrow h-4 w-4" /> : null}
                        <span>{category.title}</span>
                        {category.dropdownImageUrl ? (
                          <img
                            src={category.dropdownImageUrl}
                            alt={category.title}
                            className="catalogMenuThumb"
                          />
                        ) : null}
                      </Link>
                      {category.children?.length ? (
                        <div className="catalogSubmenu">
                          <ul>
                            {category.children.map((child) => (
                              <li key={child.id}>
                                <Link className="catalogMenuLink catalogSubmenuLink" href={child.href}>
                                  {child.dropdownImageUrl ? (
                                    <img
                                      src={child.dropdownImageUrl}
                                      alt={child.title}
                                      className="catalogMenuThumb"
                                    />
                                  ) : null}
                                  {child.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
