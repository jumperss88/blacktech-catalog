import type { Product, Variant } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import clsx from 'clsx'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { AddToCart } from '@/components/Cart/AddToCart'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { brand, description, gallery, model, priceInUSD, title } = product

  let price = priceInUSD

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInUSD &&
      typeof variant.priceInUSD === 'number'
    ) {
      price = variant.priceInUSD
    }
  }

  const image = gallery?.[0] && typeof gallery[0] !== 'string' ? gallery[0] : false

  const brandName = typeof brand === 'string' ? brand.trim() : ''
  const modelName = typeof model === 'string' ? model.trim() : ''
  const displayName = title?.trim() || ''

  const pickText = (value: unknown): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (Array.isArray(value)) return value.map((item) => pickText(item)).join(' ')

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      const ownText = typeof record.text === 'string' ? record.text : ''

      if (record.root) {
        return `${ownText} ${pickText(record.root)}`.trim()
      }

      if (record.children) {
        return `${ownText} ${pickText(record.children)}`.trim()
      }

      return ownText
    }

    return ''
  }

  const shortDescription = pickText(description).replace(/\s+/g, ' ').trim()

  return (
    <article className="product-shop-card group">
      <Link className="product-shop-card-link" href={`/products/${product.slug}`}>
        <div className="product-shop-card-media">
          {image ? (
            <Media
              className={clsx('relative h-full w-full')}
              fill
              imgClassName={clsx('h-full w-full object-contain -translate-y-2 scale-[1.22]', {
                'transition duration-300 ease-in-out group-hover:scale-[1.27]': true,
              })}
              resource={image}
            />
          ) : null}
        </div>

        <div className="product-shop-card-text">
          {shortDescription ? <p className="product-shop-card-desc line-clamp-4">{shortDescription}</p> : null}

          <div className="product-shop-card-body">
            <h3 className="product-card-title leading-tight min-w-0">
              {brandName || modelName ? (
                <>
                  <span className="product-shop-card-brand line-clamp-1">{brandName || displayName}</span>
                  {modelName ? (
                    <span className="product-shop-card-model line-clamp-1">{modelName}</span>
                  ) : null}
                </>
              ) : (
                <span className="line-clamp-2">{displayName}</span>
              )}
            </h3>
          </div>
        </div>
      </Link>

      <div className="product-shop-card-footer">
        <div className="product-shop-card-price-wrap">
          {typeof price === 'number' ? (
            <Price as="span" className="product-card-price" amount={price} />
          ) : (
            <span className="product-shop-card-price-empty">Цена по запросу</span>
          )}
        </div>
        <div className="product-shop-card-actions">
          <AddToCart iconOnly product={product as Product} />
        </div>
      </div>
    </article>
  )
}
