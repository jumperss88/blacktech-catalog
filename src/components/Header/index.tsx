import type { Category, Header } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import './index.css'
import { HeaderClient } from './index.client'
import { buildCatalogCategoryViews, type CatalogCategoryView } from '@/lib/catalog-categories'

type HeaderNavItemView = {
  href: string
  id: string
  label: string
}

type HeaderNavItem = NonNullable<NonNullable<Header['navItems']>[number]>

const normalizeHeaderHref = (href: string) => {
  const normalized = href.trim()

  if (!normalized) return ''
  if (normalized === '-' || normalized === '/-') return '/o-nas'
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized
  if (normalized.startsWith('mailto:') || normalized.startsWith('tel:')) return normalized

  return normalized.startsWith('/') ? normalized : `/${normalized}`
}

const getLinkHref = (headerItem: HeaderNavItem) => {
  if (headerItem.link.type === 'custom') return normalizeHeaderHref(headerItem.link.url || '')

  if (
    headerItem.link.type === 'reference' &&
    typeof headerItem.link.reference?.value === 'object' &&
    headerItem.link.reference?.value?.slug
  ) {
    const slug = headerItem.link.reference.value.slug === '-' ? 'o-nas' : headerItem.link.reference.value.slug
    const relationPrefix = headerItem.link.reference.relationTo !== 'pages' ? `/${headerItem.link.reference.relationTo}` : ''

    return `${relationPrefix}/${slug}`
  }

  return ''
}

const mapHeaderNavItems = (navItems: Header['navItems']): HeaderNavItemView[] => {
  if (!navItems?.length) return []

  return navItems
    .map((item) => {
      const href = getLinkHref(item)
      if (!href) return null

      return {
        href,
        id: String(item.id),
        label: item.link.label || href,
      }
    })
    .filter((item): item is HeaderNavItemView => Boolean(item))
}

export async function Header() {
  const payload = await getPayload({ config: configPromise })
  const header = await payload.findGlobal({
    slug: 'header',
    depth: 2,
  })

  const fallbackCategories = await payload.find({
    collection: 'categories',
    depth: 1,
    overrideAccess: false,
    select: {
      dropdownImage: true,
      parentCategory: true,
      title: true,
    },
    sort: 'title',
  })

  const selectedCategories = header.catalogCategories?.filter(
    (category): category is Category => typeof category === 'object' && category !== null,
  )
  const allCategories = fallbackCategories.docs as Category[]
  const categoriesSource = selectedCategories?.length
    ? [
        ...selectedCategories,
        ...allCategories.filter((category) => {
          const parent =
            typeof category.parentCategory === 'object' && category.parentCategory !== null
              ? String(category.parentCategory.id)
              : category.parentCategory
                ? String(category.parentCategory)
                : null

          return parent ? selectedCategories.some((selected) => String(selected.id) === parent) : false
        }),
      ]
    : allCategories
  const categoriesView: CatalogCategoryView[] = buildCatalogCategoryViews(categoriesSource)

  return (
    <HeaderClient
      categories={categoriesView}
      menu={mapHeaderNavItems(header.navItems)}
    />
  )
}
