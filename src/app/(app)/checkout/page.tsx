import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { CheckoutPage } from '@/components/checkout/CheckoutPage'

export default function Checkout() {
  return (
    <div className="container min-h-[90vh] flex">
      <h1 className="sr-only">Ваша заявка</h1>

      <CheckoutPage />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Ваша заявка на оборудование.',
  openGraph: mergeOpenGraph({
    title: 'Ваша заявка',
    url: '/checkout',
  }),
  title: 'Ваша заявка',
}
