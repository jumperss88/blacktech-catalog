import { Media } from '@/components/Media'
import type { Category, Media as MediaType, Product } from '@/payload-types'
import configPromise from '@payload-config'
import { buildCatalogCategoryViews } from '@/lib/catalog-categories'
import Link from 'next/link'
import { getPayload } from 'payload'

export const metadata = {
  description: 'Категории каталога BlackTechLight.',
  title: 'Каталог категорий',
}

const getPrimaryImage = (product: Partial<Product>): MediaType | null => {
  const galleryImage = product.gallery?.[0]
  if (galleryImage && typeof galleryImage === 'object') return galleryImage as MediaType

  if (product.meta?.image && typeof product.meta.image === 'object') return product.meta.image as MediaType

  return null
}

const getCategoryImage = (category: Category | undefined): MediaType | null => {
  if (!category) return null

  const image = category.catalogImage
  if (image && typeof image === 'object') return image as MediaType

  return null
}

export default async function CatalogPage() {
  const payload = await getPayload({ config: configPromise })

  const categoriesResult = await payload.find({
    collection: 'categories',
    depth: 1,
    draft: false,
    limit: 120,
    overrideAccess: false,
    select: {
      catalogImage: true,
      slug: true,
      title: true,
    },
    sort: 'title',
  })

  const categories = categoriesResult.docs as Category[]
  const mappedCategories = buildCatalogCategoryViews(categories)
  const categoryByID = new Map(categories.map((category) => [String(category.id), category]))

  const matchedCategoryIDs = mappedCategories.flatMap((item) => {
    const category = categoryByID.get(item.id)
    return category ? [category.id] : []
  })

  const productsResult = matchedCategoryIDs.length
    ? await payload.find({
        collection: 'products',
        depth: 2,
        draft: false,
        limit: 200,
        overrideAccess: false,
        select: {
          categories: true,
          gallery: true,
          meta: true,
        },
        where: {
          categories: {
            in: matchedCategoryIDs,
          },
        },
      })
    : { docs: [] as Partial<Product>[] }

  const imageByCategory = new Map<string, MediaType>()

  for (const product of productsResult.docs as Partial<Product>[]) {
    const image = getPrimaryImage(product)
    if (!image) continue

    const productCategories = Array.isArray(product.categories) ? product.categories : []

    for (const productCategory of productCategories) {
      if (!productCategory) continue

      const categoryID =
        typeof productCategory === 'object' && productCategory !== null
          ? String(productCategory.id)
          : String(productCategory)

      if (!imageByCategory.has(categoryID)) {
        imageByCategory.set(categoryID, image)
      }
    }
  }

  return (
    <main className="container py-10 md:py-14">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight md:mb-8 md:text-4xl">Каталог</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {mappedCategories.map((item) => {
          const categoryID = categoryByID.has(item.id) ? item.id : null
          const category = categoryID ? categoryByID.get(categoryID) : undefined
          const previewImage = getCategoryImage(category) ?? (categoryID ? imageByCategory.get(categoryID) : null)

          return (
            <Link
              href={item.href}
              key={item.title}
              className="group rounded-2xl border bg-white p-4 transition-colors hover:border-[color:var(--site-accent)] md:p-5"
            >
              <div className="mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-white">
                {previewImage ? (
                  <Media
                    className="h-full w-full"
                    imgClassName="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                    resource={previewImage}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white text-xs text-muted-foreground">
                    Категория
                  </div>
                )}
              </div>

              <h2 className="text-center text-sm font-semibold leading-snug md:text-base">{item.title}</h2>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
