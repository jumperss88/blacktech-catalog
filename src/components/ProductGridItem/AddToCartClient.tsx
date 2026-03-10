'use client'

import type { Product } from '@/payload-types'

import dynamic from 'next/dynamic'
import React from 'react'

const AddToCart = dynamic(
  () => import('@/components/Cart/AddToCart').then((module) => module.AddToCart),
  {
    loading: () => <div aria-hidden="true" className="h-9 w-9 rounded-full border border-border/50" />,
    ssr: false,
  },
)

type Props = {
  product: Product
}

export function AddToCartClient({ product }: Props) {
  return <AddToCart iconOnly product={product} />
}
