import type { Media, Product } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { GridTileImage } from '@/components/Grid/tile'
import { ProductDescription } from '@/components/product/ProductDescription'
import { RichText } from '@/components/RichText'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { groupSpecificationItems } from '@/utilities/specGrouping'
import { Gallery } from '@/components/product/Gallery'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery =
    product.gallery?.filter((item): item is Media => typeof item === 'object' && item !== null) || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'

  const seoImage = metaImage || (gallery.length ? gallery[0] : undefined)

  return {
    description: product.meta?.description || '',
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt ?? undefined,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: product.meta?.title || product.title,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery =
    product.gallery?.filter((item): item is Media => typeof item === 'object' && item !== null) ||
    []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const hasStock = product.enableVariants
    ? product?.variants?.docs?.some((variant) => {
        if (typeof variant !== 'object') return false
        return variant.inventory && variant?.inventory > 0
      })
    : product.inventory! > 0

  let price = product.priceInUSD

  if (product.enableVariants && product?.variants?.docs?.length) {
    price = product?.variants?.docs?.reduce((acc, variant) => {
      if (typeof variant === 'object' && variant?.priceInUSD && acc && variant?.priceInUSD > acc) {
        return variant.priceInUSD
      }
      return acc
    }, price)
  }

  const productJsonLd = {
    name: product.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.description,
    image: metaImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      price: price,
      priceCurrency: 'RUB',
    },
  }

  const relatedProducts =
    product.relatedProducts?.filter((relatedProduct) => typeof relatedProduct === 'object') ?? []
  const specifications = (Array.isArray(product.specifications) ? product.specifications : []).filter(
    (row) => {
      const hasName = typeof row?.name === 'string' && row.name.trim().length > 0
      const hasValue = typeof row?.value === 'string' && row.value.trim().length > 0
      return hasName || hasValue
    },
  )
  const hasSpecifications = specifications.length > 0
  const groupedSpecifications = groupSpecificationItems(
    specifications.map((row) => ({
      label: row?.name || '',
      value: row?.value || '',
      group: typeof row?.group === 'string' ? row.group : undefined,
    })),
  )
  const specificationsView =
    typeof product.specificationsView === 'string' ? product.specificationsView : 'grouped'
  const hasLexicalExtraDescription = hasMeaningfulLexicalContent(product.extraDescription)
  const hasHTMLExtraDescription = hasMeaningfulHTMLContent(product.descriptionHTML)
  const isHTMLDescriptionMode = product.descriptionMode === 'html'
  const htmlExtraDescription =
    hasHTMLExtraDescription && typeof product.descriptionHTML === 'string'
      ? product.descriptionHTML
      : null
  const lexicalExtraDescription = hasLexicalExtraDescription ? product.extraDescription : null
  const shouldRenderHTMLExtraDescription = isHTMLDescriptionMode && Boolean(htmlExtraDescription)
  const shouldRenderLexicalExtraDescription =
    !isHTMLDescriptionMode && Boolean(lexicalExtraDescription)
  const hasExtraDescription = shouldRenderHTMLExtraDescription || shouldRenderLexicalExtraDescription
  const categoryTrail = getCategoryTrail(product)

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="container pt-2 pb-8">
        <nav className="product-breadcrumbs mb-2" aria-label="breadcrumb">
          <Link href="/catalog" className="product-breadcrumb-link">
            Каталог
          </Link>
          {categoryTrail.parent ? (
            <>
              <span className="product-breadcrumb-sep">›</span>
              <Link
                href={`/shop?category=${categoryTrail.parent.id}`}
                className="product-breadcrumb-link"
              >
                {categoryTrail.parent.title}
              </Link>
            </>
          ) : null}
          {categoryTrail.child ? (
            <>
              <span className="product-breadcrumb-sep">›</span>
              <Link
                href={`/shop?category=${categoryTrail.child.id}`}
                className="product-breadcrumb-link"
              >
                {categoryTrail.child.title}
              </Link>
            </>
          ) : null}
          <span className="product-breadcrumb-sep">›</span>
          <span className="product-breadcrumb-current">{product.title}</span>
        </nav>
        <div className="flex flex-col gap-12 rounded-lg border p-8 md:py-12 lg:flex-row lg:gap-8 bg-transparent">
          <div className="h-full w-full basis-full lg:basis-1/2">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
              }
            >
              {Boolean(gallery?.length) && <Gallery gallery={gallery} />}
            </Suspense>
          </div>

          <div className="basis-full lg:basis-1/2">
            <ProductDescription
              hasExtraDescription={hasExtraDescription}
              hasSpecifications={hasSpecifications}
              product={product}
            />
          </div>
        </div>

        {hasExtraDescription || hasSpecifications ? (
          <div className="mt-6 space-y-6">
            {hasExtraDescription ? (
              <section id="product-description">
                {shouldRenderHTMLExtraDescription ? (
                  <div
                    className="product-extra-description product-description-html"
                    dangerouslySetInnerHTML={{ __html: htmlExtraDescription || '' }}
                  />
                ) : shouldRenderLexicalExtraDescription && lexicalExtraDescription ? (
                  <div className="product-extra-description">
                    <RichText
                      className="product-description-richtext"
                      data={lexicalExtraDescription}
                      enableGutter={false}
                    />
                  </div>
                ) : null}
              </section>
            ) : null}

            {hasSpecifications ? (
              <section id="product-specifications" className="product-specs-table-wrap">
                {specificationsView === 'table' ? (
                  <table className="product-specs-table">
                    <thead>
                      <tr>
                        <th colSpan={2}>{product.specificationsTitle || 'Характеристики'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specifications.map((row, index) => (
                        <tr key={row.id || index}>
                          <td>{row.name || ''}</td>
                          <td>{row.value || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="product-specs-groups">
                    <h2 className="product-specs-groups-title">
                      {product.specificationsTitle || 'Характеристики'}
                    </h2>
                    <div className="product-specs-groups-grid">
                      {groupedSpecifications.map((group) => (
                        <section key={group.key} className="product-specs-group-card">
                          <h3 className="product-specs-group-title">{group.titleRu}</h3>
                          <ul className="product-specs-group-list">
                            {group.items.map((row, index) => (
                              <li
                                key={`${group.key}-${index}`}
                                className="product-specs-group-item"
                              >
                                <span>
                                  {row.label && row.value
                                    ? `${row.label}: ${row.value}`
                                    : row.label || row.value || ''}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ) : null}
          </div>
        ) : null}
      </div>

      {product.layout?.length ? <RenderBlocks blocks={product.layout} /> : <></>}

      {relatedProducts.length ? (
        <div className="container">
          <RelatedProducts products={relatedProducts as Product[]} />
        </div>
      ) : (
        <></>
      )}
    </React.Fragment>
  )
}

function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null
  const uniqueProducts = products.filter((product, index, docs) => {
    const currentID = String(product.id)
    return docs.findIndex((candidate) => String(candidate.id) === currentID) === index
  })

  return (
    <div className="py-8">
      <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {uniqueProducts.map((product) => (
          <li
            className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
            key={product.id}
          >
            <Link className="relative h-full w-full" href={`/products/${product.slug}`}>
              <GridTileImage
                label={{
                  amount: product.priceInUSD!,
                  title: product.title,
                }}
                media={product.meta?.image as Media}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const queryProductBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
    populate: {
      variants: {
        title: true,
        priceInUSD: true,
        inventory: true,
        options: true,
      },
    },
  })

  return result.docs?.[0] || null
}

const isCategoryObject = (value: unknown): value is { id: number | string; parentCategory?: unknown; title?: string } =>
  Boolean(value && typeof value === 'object' && 'id' in (value as object))

const normalizeCategory = (value: unknown) => {
  if (!isCategoryObject(value)) return null

  const id = String(value.id)
  const title = typeof value.title === 'string' ? value.title : ''

  return { id, parentCategory: value.parentCategory, title }
}

const getCategoryTrail = (product: Product) => {
  const categories = Array.isArray(product.categories)
    ? product.categories.map((item) => normalizeCategory(item)).filter((item): item is NonNullable<ReturnType<typeof normalizeCategory>> => Boolean(item))
    : []

  if (!categories.length) return { child: null as null | { id: string; title: string }, parent: null as null | { id: string; title: string } }

  const byID = new Map(categories.map((category) => [category.id, category]))
  const childCandidate =
    categories.find((category) => Boolean(category.parentCategory)) ?? null

  if (!childCandidate) {
    const parent = categories[0]
    return {
      child: null,
      parent: parent ? { id: parent.id, title: parent.title } : null,
    }
  }

  const parentRaw = childCandidate.parentCategory
  const parentID =
    typeof parentRaw === 'object' && parentRaw !== null && 'id' in parentRaw
      ? String((parentRaw as { id: string | number }).id)
      : parentRaw
        ? String(parentRaw)
        : null

  const parentFromList = parentID ? byID.get(parentID) : null
  const parentTitle =
    parentFromList?.title ||
    (typeof parentRaw === 'object' && parentRaw !== null && 'title' in parentRaw
      ? String((parentRaw as { title?: string }).title || '')
      : '')

  const parent =
    parentID && parentTitle
      ? {
          id: parentID,
          title: parentTitle,
        }
      : null

  return {
    child: { id: childCandidate.id, title: childCandidate.title },
    parent,
  }
}

const extractLexicalText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''

  const asRecord = node as { text?: unknown; children?: unknown }
  const ownText = typeof asRecord.text === 'string' ? asRecord.text : ''
  const children = Array.isArray(asRecord.children) ? asRecord.children : []
  const childrenText = children.map((child) => extractLexicalText(child)).join(' ')

  return `${ownText} ${childrenText}`.trim()
}

const hasMeaningfulLexicalContent = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false

  const root = (value as { root?: unknown }).root
  if (!root) return false

  const text = extractLexicalText(root).replace(/\s+/g, ' ').trim()
  return text.length > 0
}

const hasMeaningfulHTMLContent = (value: unknown): boolean => {
  if (typeof value !== 'string') return false

  const plain = value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return plain.length > 0
}
