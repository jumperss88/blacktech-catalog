'use client'
import type { Media, Product } from '@/payload-types'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import AutoScroll from 'embla-carousel-auto-scroll'
import Link from 'next/link'
import React from 'react'
import { GridTileImage } from '@/components/Grid/tile'

export const CarouselClient: React.FC<{ products: Product[] }> = ({ products }) => {
  if (!products?.length) return null

  // Purposefully duplicating products to make the carousel loop and not run out of products on wide screens.
  const carouselProducts = [...products, ...products, ...products]

  const getPrimaryImage = (product: Product): Media | null => {
    const firstGalleryImage = product.gallery?.[0]
    if (firstGalleryImage && typeof firstGalleryImage === 'object') {
      return firstGalleryImage as Media
    }

    if (product.meta?.image && typeof product.meta.image === 'object') {
      return product.meta.image as Media
    }

    return null
  }

  const extractRichTextText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''

    const record = node as { text?: unknown; children?: unknown }
    const ownText = typeof record.text === 'string' ? record.text : ''
    const children = Array.isArray(record.children) ? record.children : []
    const childrenText = children.map((child) => extractRichTextText(child)).join(' ')

    return `${ownText} ${childrenText}`.trim()
  }

  const getShortDescription = (product: Product): string => {
    if (!product.description || typeof product.description !== 'object') return ''

    const root = (product.description as { root?: unknown }).root
    const rawText = extractRichTextText(root).replace(/\s+/g, ' ').trim()
    if (!rawText) return ''

    const maxLength = 170
    if (rawText.length <= maxLength) return rawText

    return `${rawText.slice(0, maxLength).trimEnd()}...`
  }

  return (
    <Carousel
      className="w-full"
      opts={{ align: 'start', loop: true }}
      plugins={[
        AutoScroll({
          playOnInit: true,
          speed: 1,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      <CarouselContent>
        {carouselProducts.map((product, i) => {
          const primaryImage = getPrimaryImage(product)
          const shortDescription = getShortDescription(product)

          return (
            <CarouselItem
              className="carousel-product-item relative h-[210px] w-[84%] max-w-[380px] flex-none sm:h-[230px] sm:w-[62%] md:h-[240px] md:w-[48%] lg:h-[24vh] lg:max-h-[220px] lg:w-1/3"
              key={`${product.slug}${i}`}
            >
              <Link className="relative h-full w-full" href={`/products/${product.slug}`}>
                {primaryImage ? (
                  <GridTileImage
                    backgroundTheme="white"
                    imageFit="contain"
                    imagePosition="right"
                    topLeftDescription={shortDescription}
                    label={{
                      amount: product.priceInUSD!,
                      title: product.title,
                    }}
                    media={primaryImage}
                  />
                ) : null}
              </Link>
            </CarouselItem>
          )
        })}
      </CarouselContent>
    </Carousel>
  )
}
