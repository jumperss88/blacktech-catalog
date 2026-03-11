import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'
import { FindOrderForm } from '@/components/forms/FindOrderForm'
import { redirect } from 'next/navigation'

type Props = {
  searchParams: Promise<{
    email?: string
    orderID?: string
  }>
}

export default async function FindOrderPage({ searchParams }: Props) {
  const { email, orderID } = await searchParams

  if (email && orderID) {
    redirect(`/orders/${encodeURIComponent(orderID)}?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="container py-16">
      <FindOrderForm />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Find your order with us using your email.',
  openGraph: mergeOpenGraph({
    title: 'Find order',
    url: '/find-order',
  }),
  title: 'Find order',
}
