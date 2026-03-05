import config from '@payload-config'
import { getPayload } from 'payload'

type RequestBody = {
  contact?: {
    name?: string
    company?: string
    phone?: string
    email?: string
    comment?: string
  }
  items?: {
    productId?: number
    quantity?: number
    title?: string
    variantId?: number
    variantLabel?: string
    priceInUSD?: number
  }[]
  subtotal?: number
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request): Promise<Response> {
  try {
    const payload = await getPayload({ config })
    const body = (await req.json()) as RequestBody

    const phone = body?.contact?.phone?.trim() || ''
    const email = body?.contact?.email?.trim() || ''
    const hasContact = Boolean(phone || email)

    if (!hasContact) {
      return Response.json(
        { error: 'Для отправки заявки укажите телефон или email.' },
        { status: 400 },
      )
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return Response.json({ error: 'Некорректный email.' }, { status: 400 })
    }

    const requestItems = Array.isArray(body?.items) ? body.items : []

    if (requestItems.length === 0) {
      return Response.json({ error: 'В заявке нет товаров.' }, { status: 400 })
    }

    const normalizedItems = requestItems
      .filter((item) => item?.productId && item?.quantity && item.quantity > 0)
      .map((item) => ({
        product: item.productId as number,
        quantity: item.quantity as number,
        title: item.title || 'Без названия',
        variant: item.variantId || undefined,
        variantLabel: item.variantLabel || undefined,
        priceInUSD: typeof item.priceInUSD === 'number' ? item.priceInUSD : undefined,
      }))

    if (normalizedItems.length === 0) {
      return Response.json({ error: 'Некорректные позиции в заявке.' }, { status: 400 })
    }

    const authResult = await payload.auth({ headers: req.headers }).catch(() => null)
    const user = authResult && 'user' in authResult ? authResult.user : null

    const createdRequest = await payload.create({
      collection: 'requests',
      draft: false,
      data: {
        status: 'new',
        ...(body?.contact?.name?.trim() ? { name: body.contact.name.trim() } : {}),
        ...(body?.contact?.company?.trim() ? { company: body.contact.company.trim() } : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        ...(body?.contact?.comment?.trim() ? { comment: body.contact.comment.trim() } : {}),
        items: normalizedItems,
        ...(typeof body?.subtotal === 'number' ? { subtotal: body.subtotal } : {}),
        ...(user?.id ? { customer: user.id } : {}),
      },
    })

    return Response.json({ ok: true, requestId: createdRequest.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось отправить заявку.'
    return Response.json({ error: message }, { status: 500 })
  }
}
