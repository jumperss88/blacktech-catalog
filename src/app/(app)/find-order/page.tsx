import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'
import { FindOrderForm } from '@/components/forms/FindOrderForm'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import configPromise from '@payload-config'

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

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return (
    <div className="container py-16">
      <FindOrderForm initialEmail={user?.email} />
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
