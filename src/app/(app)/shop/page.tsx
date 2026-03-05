import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

export const metadata = {
  description: 'Поиск товаров в каталоге.',
  title: 'Каталог',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category } = await searchParams
  const payload = await getPayload({ config: configPromise })
  const selectedCategory = Array.isArray(category) ? category[0] : category

  let categoryFilterIDs: string[] = []

  if (selectedCategory) {
    const categoriesResult = await payload.find({
      collection: 'categories',
      depth: 0,
      draft: false,
      limit: 500,
      overrideAccess: false,
      select: {
        parentCategory: true,
      },
    })

    const byParent = new Map<string, string[]>()

    for (const categoryDoc of categoriesResult.docs) {
      const parentRaw =
        typeof categoryDoc.parentCategory === 'object' && categoryDoc.parentCategory
          ? categoryDoc.parentCategory.id
          : categoryDoc.parentCategory

      if (!parentRaw) continue

      const parentID = String(parentRaw)
      const current = byParent.get(parentID)

      if (current) {
        current.push(String(categoryDoc.id))
      } else {
        byParent.set(parentID, [String(categoryDoc.id)])
      }
    }

    const stack = [String(selectedCategory)]
    const visited = new Set<string>()

    while (stack.length) {
      const current = stack.pop()
      if (!current || visited.has(current)) continue

      visited.add(current)
      const children = byParent.get(current) ?? []

      for (const childID of children) {
        if (!visited.has(childID)) stack.push(childID)
      }
    }

    categoryFilterIDs = Array.from(visited)
  }

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    select: {
      brand: true,
      description: true,
      enableVariants: true,
      inventory: true,
      model: true,
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInUSD: true,
      variants: true,
    },
    ...(sort ? { sort } : { sort: 'title' }),
    ...(searchValue || selectedCategory
      ? {
          where: {
            and: [
              {
                _status: {
                  equals: 'published',
                },
              },
              ...(searchValue
                ? [
                    {
                      or: [
                        {
                          title: {
                            like: searchValue,
                          },
                        },
                        {
                          description: {
                            like: searchValue,
                          },
                        },
                      ],
                    },
                  ]
                : []),
              ...(selectedCategory
                ? [
                    {
                      categories: {
                        in: categoryFilterIDs.length ? categoryFilterIDs : [selectedCategory],
                      },
                    },
                  ]
                : []),
            ],
          },
        }
      : {}),
  })

  const uniqueProducts = products.docs.filter((product, index, docs) => {
    const currentID = String(product.id)
    return docs.findIndex((candidate) => String(candidate.id) === currentID) === index
  })

  const resultsText = uniqueProducts.length > 1 ? 'результатов' : 'результат'

  return (
    <div className="shop-page">
      {searchValue ? (
        <p className="mb-4">
          {products.docs?.length === 0
            ? 'По вашему запросу ничего не найдено: '
            : `Найдено ${uniqueProducts.length} ${resultsText} по запросу `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && uniqueProducts.length === 0 && (
        <p className="mb-4">Товары не найдены. Попробуйте изменить фильтры.</p>
      )}

      {uniqueProducts.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {uniqueProducts.map((product) => {
            return <ProductGridItem key={product.id} product={product} />
          })}
        </Grid>
      ) : null}
    </div>
  )
}
