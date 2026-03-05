'use client'
import type { Product, Variant } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense } from 'react'
import { ChevronDown } from 'lucide-react'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'

type Props = {
  product: Product
  hasExtraDescription: boolean
  hasSpecifications: boolean
}

export function ProductDescription({ hasExtraDescription, hasSpecifications, product }: Props) {
  const { currency } = useCurrency()
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  const priceField = `priceIn${currency.code}` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const priceField = `priceIn${currency.code}` as keyof Variant
    const variantsOrderedByPrice = product.variants?.docs
      ?.filter((variant) => variant && typeof variant === 'object')
      .sort((a, b) => {
        if (
          typeof a === 'object' &&
          typeof b === 'object' &&
          priceField in a &&
          priceField in b &&
          typeof a[priceField] === 'number' &&
          typeof b[priceField] === 'number'
        ) {
          return a[priceField] - b[priceField]
        }

        return 0
      }) as Variant[]

    const lowestVariant = variantsOrderedByPrice[0][priceField]
    const highestVariant = variantsOrderedByPrice[variantsOrderedByPrice.length - 1][priceField]
    if (
      variantsOrderedByPrice &&
      typeof lowestVariant === 'number' &&
      typeof highestVariant === 'number'
    ) {
      lowestAmount = lowestVariant
      highestAmount = highestVariant
    }
  } else if (product[priceField] && typeof product[priceField] === 'number') {
    amount = product[priceField]
  }

  const displayName =
    [product.brand, product.model]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .join(' ')
      .trim() || product.title

  return (
    <div className="flex flex-col gap-6">
      <h1 className="product-detail-title text-[2rem] md:text-[2.15rem] font-semibold leading-tight">
        {displayName}
      </h1>
      {product.description ? (
        <RichText
          className="product-description-richtext"
          data={product.description}
          enableGutter={false}
        />
      ) : null}

      {hasExtraDescription || hasSpecifications ? (
        <div className="flex flex-wrap items-center gap-2">
          {hasExtraDescription ? (
            <a
              href="#product-description"
              className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Описание
              <ChevronDown className="h-4 w-4" />
            </a>
          ) : null}
          {hasSpecifications ? (
            <a
              href="#product-specifications"
              className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Характеристики
              <ChevronDown className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      ) : null}

      {hasVariants && (
        <>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>

          <hr />
        </>
      )}
      <div className="flex w-full justify-end">
        <div className="flex flex-col items-end gap-3">
          <div className="font-mono uppercase">
            {hasVariants ? (
              <Price className="product-detail-price" highestAmount={highestAmount} lowestAmount={lowestAmount} />
            ) : (
              <Price className="product-detail-price" amount={amount} />
            )}
          </div>
          <Suspense fallback={null}>
            <StockIndicator product={product} />
          </Suspense>
          <Suspense fallback={null}>
            <AddToCart product={product} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
