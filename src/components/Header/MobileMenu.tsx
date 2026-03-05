'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type Props = {
  categories: {
    children?: {
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

export function MobileMenu({ categories, menu }: Props) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:bg-black dark:text-white">
        <MenuIcon className="h-4" />
      </SheetTrigger>

      <SheetContent side="left" className="px-4">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle>Меню</SheetTitle>
        </SheetHeader>

        <div className="py-4">
          <ul className="flex w-full flex-col gap-2 border-b pb-4">
            {menu?.map((item) => (
              <li className="py-1" key={item.id}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li className="py-1">
              <Link href="/catalog">Каталог</Link>
            </li>
          </ul>

          <div className="pt-4">
            <h2 className="text-base font-semibold">Каталог</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={category.href}>{category.title}</Link>
                  {category.children?.length ? (
                    <ul className="mt-1 ml-3 flex flex-col gap-1">
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <Link className="text-sm opacity-80" href={child.href}>
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
