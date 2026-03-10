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
      <nav className="headerNav container flex h-16 items-center justify-between md:h-16">
        <div className="block flex-none md:hidden">
          <MobileMenu categories={categories} menu={menu} />
        </div>
        <div className="flex w-full items-center justify-between gap-4">
          <div className="headerMainGroup flex w-full items-center gap-7 md:w-auto">
            <Link className="headerBrandLink flex w-full items-center justify-center md:w-auto" href="/">
              <img
                src="/blacklogo.svg"
                alt="Black Tech Light"
                className="headerBrandLogo"
              />
            </Link>
            <ul className="headerNavList hidden md:flex md:items-center">
              {menu.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn('headerNavLink relative navLink', {
                      active: item.href !== '/' ? pathname.includes(item.href) : false,
                    })}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="headerActions flex shrink-0 items-center justify-end gap-2.5">
            <Suspense fallback={null}>
              <SearchOverlay />
            </Suspense>
            <Cart />
            <div className="catalogDropdown">
              <Button
                asChild
                className="headerCatalogButton hidden md:inline-flex h-9 w-32 gap-1.5 rounded-[10px] px-0 font-mono text-base font-normal uppercase tracking-normal"
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
