import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0
  return true
}

const hasGlobalHomeContent = (home: Record<string, unknown>) => {
  return (
    hasMeaningfulValue(home.hero) ||
    hasMeaningfulValue(home.layout) ||
    hasMeaningfulValue(home.meta)
  )
}

const run = async () => {
  const force = process.argv.includes('--force')
  const payload = await getPayload({ config: configPromise })

  const homePageResult = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      slug: {
        equals: 'home',
      },
    },
  })

  const homePage = homePageResult.docs[0]

  if (!homePage) {
    console.log('Страница pages/home не найдена. Перенос не выполнен.')
    return
  }

  const homeGlobal = await payload.findGlobal({
    slug: 'home',
    depth: 0,
  })

  if (hasGlobalHomeContent(homeGlobal as unknown as Record<string, unknown>) && !force) {
    console.log(
      'Global "home" уже заполнен. Чтобы перезаписать данными из pages/home, запустите с флагом --force.',
    )
    return
  }

  await payload.updateGlobal({
    slug: 'home',
    context: {
      disableRevalidate: true,
    },
    data: {
      title: homePage.title || 'Главная',
      hero: homePage.hero,
      layout: homePage.layout,
      meta: homePage.meta,
    },
  })

  console.log(
    `Готово: данные pages/home (id=${homePage.id}) перенесены в global "home"${force ? ' с перезаписью' : ''}.`,
  )
}

void run()
