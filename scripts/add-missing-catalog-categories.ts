import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { slugifyRussian } from '../src/utilities/slugifyRussian'

const TARGET_TITLES = [
  'Вращающиеся головы',
  'Светодиодные прожекторы',
  'Театральный свет',
  'Прожекторы следящего света',
  'Блайндеры и стробоскопы',
  'Генераторы спецэффектов',
  'Пульты управления',
  'Распределение сигнала',
  'Кабель и разъемы',
  'Струбцины',
]

const run = async () => {
  const payload = await getPayload({ config: configPromise })

  const existing = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 200,
    overrideAccess: false,
    select: {
      title: true,
    },
  })

  const existingTitles = new Set(
    existing.docs
      .map((doc) => (typeof doc.title === 'string' ? doc.title.trim() : ''))
      .filter(Boolean),
  )

  const missing = TARGET_TITLES.filter((title) => !existingTitles.has(title))

  if (!missing.length) {
    console.log('Все целевые категории уже существуют, ничего не добавляю.')
    return
  }

  for (const title of missing) {
    await payload.create({
      collection: 'categories',
      data: { slug: slugifyRussian(title), title },
      draft: false,
    })
    console.log(`Добавлена категория: ${title}`)
  }

  console.log(`Готово. Добавлено категорий: ${missing.length}`)
}

void run()
