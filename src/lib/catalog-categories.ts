import type { Category } from '@/payload-types'

type CatalogPreset = {
  aliases: string[]
  title: string
}

export type CatalogCategoryView = {
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
}

const CATALOG_PRESETS: CatalogPreset[] = [
  { title: 'Вращающиеся головы', aliases: ['вращающиеся головы', 'головы', 'moving head'] },
  {
    title: 'Светодиодные прожекторы',
    aliases: ['светодиодные прожекторы', 'led прожекторы', 'светодиодный свет'],
  },
  { title: 'Театральный свет', aliases: ['театральный свет', 'студийное оборудование'] },
  {
    title: 'Прожекторы следящего света',
    aliases: ['прожекторы следящего света', 'следящего света', 'follow spot'],
  },
  { title: 'Блайндеры и стробоскопы', aliases: ['блайндеры', 'стробоскопы', 'blinder', 'strobe'] },
  {
    title: 'Генераторы спецэффектов',
    aliases: ['генераторы спецэффектов', 'спецэффекты', 'дым машина'],
  },
  { title: 'Пульты управления', aliases: ['пульты управления', 'управление', 'dmx пульт'] },
  { title: 'Распределение сигнала', aliases: ['распределение сигнала', 'splitter', 'сплиттер'] },
  { title: 'Кабель и разъемы', aliases: ['кабель и разъемы', 'кабель', 'разъемы'] },
  { title: 'Струбцины', aliases: ['струбцины', 'крепления', 'кламп'] },
]

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const getMatchScore = (source: string, alias: string): number => {
  if (source === alias) return 100
  if (source.includes(alias) || alias.includes(source)) return 70

  const sourceTokens = source.split(' ')
  const aliasTokens = alias.split(' ')
  const overlap = aliasTokens.filter((token) => sourceTokens.includes(token)).length
  return overlap * 10
}

const pickCategory = (categories: Category[], usedIDs: Set<string>, aliases: string[]) => {
  let best: Category | null = null
  let bestScore = 0

  for (const category of categories) {
    const categoryID = String(category.id)
    if (usedIDs.has(categoryID) || !category.title) continue

    const source = normalize(category.title)
    for (const aliasRaw of aliases) {
      const alias = normalize(aliasRaw)
      const score = getMatchScore(source, alias)
      if (score > bestScore) {
        best = category
        bestScore = score
      }
    }
  }

  if (best && bestScore >= 20) {
    usedIDs.add(String(best.id))
    return best
  }

  return null
}

const extractMediaURL = (value: unknown): string | undefined => {
  if (!value || typeof value !== 'object') return undefined

  const maybeMedia = value as { url?: unknown }
  return typeof maybeMedia.url === 'string' ? maybeMedia.url : undefined
}

const getCategoryID = (value: unknown): string | undefined => {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  if (value && typeof value === 'object') {
    const maybe = value as { id?: unknown }
    if (typeof maybe.id === 'number' || typeof maybe.id === 'string') return String(maybe.id)
  }
  return undefined
}

export const buildCatalogCategoryViews = (categories: Category[]): CatalogCategoryView[] => {
  const usedIDs = new Set<string>()
  const categoriesByParent = new Map<string, Category[]>()

  for (const category of categories) {
    const parentID = getCategoryID(category.parentCategory)
    if (!parentID) continue

    const current = categoriesByParent.get(parentID)
    if (current) {
      current.push(category)
    } else {
      categoriesByParent.set(parentID, [category])
    }
  }

  return CATALOG_PRESETS.map((preset) => {
    const matched = pickCategory(categories, usedIDs, [preset.title, ...preset.aliases])
    const matchedID = getCategoryID(matched?.id)
    const childCategories = matchedID ? (categoriesByParent.get(matchedID) ?? []) : []
    const children = childCategories
      .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
      .map((child) => ({
        dropdownImageUrl: extractMediaURL(child.dropdownImage),
        href: `/shop?category=${child.id}`,
        id: String(child.id),
        title: child.title,
      }))

    return {
      children,
      dropdownImageUrl: extractMediaURL(matched?.dropdownImage),
      id: matched ? String(matched.id) : `preset-${normalize(preset.title).replace(/\s+/g, '-')}`,
      title: preset.title,
      href: matched
        ? `/shop?category=${matched.id}`
        : `/shop?q=${encodeURIComponent(preset.title)}`,
    }
  })
}
