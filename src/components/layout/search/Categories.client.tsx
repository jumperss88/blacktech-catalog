'use client'
import React, { useCallback, useMemo } from 'react'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import clsx from 'clsx'

type Props = {
  category: {
    children?: {
      href: string
      id: string
      title: string
    }[]
    href: string
    id: string
    title: string
  }
  isChild?: boolean
}

export const CategoryItem: React.FC<Props> = ({ category, isChild = false }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = useMemo(() => {
    const current = searchParams.toString()
    const categoryURL = new URL(category.href, 'https://blacktech.local')
    const target = categoryURL.searchParams.toString()
    const currentCategory = searchParams.get('category')
    const targetCategory = categoryURL.searchParams.get('category')

    if (currentCategory && targetCategory) {
      return currentCategory === targetCategory
    }

    return current === target
  }, [category.href, searchParams])

  const setQuery = useCallback(() => {
    if (isActive) {
      router.push(pathname)
      return
    }

    router.push(category.href)
  }, [category.href, isActive, pathname, router])

  return (
    <button
      onClick={() => setQuery()}
      className={clsx(
        'w-full rounded-md py-1.5 text-left text-[0.95rem] leading-tight transition-colors hover:cursor-pointer hover:bg-[color:var(--site-accent-tint)]',
        {
          'px-2.5': !isChild,
          'px-2.5 pl-7 text-[0.86rem]': isChild,
        },
        {
          'bg-[color:var(--site-accent-tint)] font-semibold text-foreground': isActive,
          'text-muted-foreground hover:text-foreground': !isActive,
        },
      )}
      aria-pressed={isActive}
    >
      <span
        className={clsx('inline-block', {
          underline: isActive,
        })}
      >
        {category.title}
      </span>
    </button>
  )
}

type CategoriesListProps = {
  categories: {
    children?: {
      href: string
      id: string
      title: string
    }[]
    href: string
    id: string
    title: string
  }[]
}

export const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => {
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category')

  const isHrefActive = useCallback(
    (href: string) => {
      const hrefURL = new URL(href, 'https://blacktech.local')
      const hrefCategory = hrefURL.searchParams.get('category')
      if (currentCategory && hrefCategory) return currentCategory === hrefCategory
      return searchParams.toString() === hrefURL.searchParams.toString()
    },
    [currentCategory, searchParams],
  )

  return (
    <ul className="space-y-1">
      {categories.map((category) => {
        const hasChildren = Boolean(category.children?.length)
        const isParentActive = isHrefActive(category.href)
        const hasActiveChild = hasChildren
          ? category.children!.some((child) => isHrefActive(child.href))
          : false
        const shouldShowChildren = hasChildren && (isParentActive || hasActiveChild)

        return (
          <li key={category.id}>
            <CategoryItem category={category} />
            {shouldShowChildren ? (
              <ul className="mt-1 space-y-0.5">
                {category.children!.map((child) => (
                  <li key={child.id}>
                    <CategoryItem category={child} isChild />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
