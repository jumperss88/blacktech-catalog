import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { POST as submitRequest } from '@/app/(app)/api/requests/submit/route'

import { afterEach, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
const createdProductIDs = new Set<number>()
const createdRequestIDs = new Set<number>()

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterEach(async () => {
    for (const requestID of createdRequestIDs) {
      await payload.delete({
        collection: 'requests',
        id: requestID,
        overrideAccess: true,
      })
    }
    createdRequestIDs.clear()

    for (const productID of createdProductIDs) {
      await payload.delete({
        collection: 'products',
        id: productID,
        overrideAccess: true,
      })
    }
    createdProductIDs.clear()
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })

  it('rejects request submission when product inventory becomes unavailable', async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const product = await payload.create({
      collection: 'products',
      draft: false,
      overrideAccess: true,
      data: {
        brand: 'Int Test',
        model: `Inventory ${suffix}`,
        title: `Int Test Inventory ${suffix}`,
        slug: `int-inventory-${suffix}`,
        inventory: 0,
        _status: 'published',
        layout: [],
        priceInUSDEnabled: true,
        priceInUSD: 1000,
      },
    })
    createdProductIDs.add(product.id)

    const response = await submitRequest(
      new Request('http://127.0.0.1:3000/api/requests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: {
            email: `inventory-${suffix}@test.com`,
          },
          items: [
            {
              productId: product.id,
              quantity: 1,
              title: product.title,
              priceInUSD: 1000,
            },
          ],
        }),
      }),
    )

    const body = await response.json()
    expect(response.status).toBe(409)
    expect(body).toMatchObject({
      code: 'ITEM_UNAVAILABLE',
    })

    const requests = await payload.find({
      collection: 'requests',
      overrideAccess: true,
      where: {
        email: {
          equals: `inventory-${suffix}@test.com`,
        },
      },
    })

    for (const request of requests.docs) {
      createdRequestIDs.add(request.id)
    }

    expect(requests.totalDocs).toBe(0)
  })
})
