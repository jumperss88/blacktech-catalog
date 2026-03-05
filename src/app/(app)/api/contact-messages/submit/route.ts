import config from '@payload-config'
import { getPayload } from 'payload'

type ContactMessageBody = {
  company?: string
  email?: string
  message?: string
  name?: string
  phone?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request): Promise<Response> {
  try {
    const payload = await getPayload({ config })
    const body = (await req.json()) as ContactMessageBody

    const name = body?.name?.trim() || ''
    const company = body?.company?.trim() || ''
    const phone = body?.phone?.trim() || ''
    const email = body?.email?.trim() || ''
    const message = body?.message?.trim() || ''

    if (!phone && !email) {
      return Response.json({ error: 'Укажите телефон или email для обратной связи.' }, { status: 400 })
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return Response.json({ error: 'Некорректный email.' }, { status: 400 })
    }

    if (message.length < 5) {
      return Response.json({ error: 'Сообщение слишком короткое.' }, { status: 400 })
    }

    const created = await payload.create({
      collection: 'contact-messages',
      data: {
        ...(name ? { name } : {}),
        ...(company ? { company } : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        message,
        sourcePage: 'kontakty',
      },
      overrideAccess: true,
    })

    return Response.json({ ok: true, id: created.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось отправить сообщение.'
    return Response.json({ error: message }, { status: 500 })
  }
}
