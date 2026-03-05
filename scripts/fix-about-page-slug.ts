import configPromise from '@payload-config'
import { getPayload } from 'payload'

const TARGET_SLUG = 'o-nas'
const LEGACY_SLUG = '-'

const run = async () => {
  const payload = await getPayload({ config: configPromise })

  const [legacyPages, targetPages] = await Promise.all([
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      pagination: false,
      where: { slug: { equals: LEGACY_SLUG } },
    }),
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      pagination: false,
      where: { slug: { equals: TARGET_SLUG } },
    }),
  ])

  if (!legacyPages.docs.length) {
    console.log(`Страниц со slug "${LEGACY_SLUG}" не найдено, менять нечего.`)
    return
  }

  if (targetPages.docs.length) {
    console.log(
      `Уже существует страница со slug "${TARGET_SLUG}" (id=${targetPages.docs[0]?.id}). Обновление slug пропущено, чтобы не создавать конфликт.`,
    )
    return
  }

  const page = legacyPages.docs[0]

  await payload.update({
    collection: 'pages',
    id: page.id,
    data: {
      slug: TARGET_SLUG,
    },
    draft: false,
    overrideAccess: true,
  })

  console.log(`Готово: страница id=${page.id} переведена со slug "${LEGACY_SLUG}" на "${TARGET_SLUG}".`)
}

void run()
