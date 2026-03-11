import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const defaultHeroRichText: any = {
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        tag: 'h1',
        children: [
          {
            type: 'text',
            text: 'Поставки сценического светового оборудования под проекты и закупки',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Подбираем решения под задачу, готовим КП и сопровождаем поставки для B2B, интеграторов и закупок по 44-ФЗ/223-ФЗ.',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
}

const defaultHeroLinks: any = [
  {
    link: {
      type: 'custom' as const,
      appearance: 'default' as const,
      label: 'Получить подбор',
      url: '/catalog',
    },
  },
  {
    link: {
      type: 'custom' as const,
      appearance: 'outline' as const,
      label: 'Запросить КП',
      url: '/kontakty',
    },
  },
]

const defaultB2BBlock = {
  blockType: 'homeB2B' as const,
  eyebrow: 'B2B / ГОСЗАКУПКИ / ПАРТНЕРСТВО',
  title: 'Поставки под проект, закупку и дилерские задачи',
  description:
    'Помогаем пройти путь от запроса до поставки: уточняем задачу, подбираем оборудование, готовим коммерческое предложение и сопровождаем закупку.',
  points: [
    {
      title: '44-ФЗ / 223-ФЗ',
      description: 'Подготовка под закупочные процедуры',
      icon: 'tender' as const,
    },
    {
      title: 'Партнерские условия',
      description: 'Для дилеров, интеграторов и проката',
      icon: 'partner' as const,
    },
    {
      title: 'Проектный подход',
      description: 'Подбор под ТЗ, бюджет и сроки',
      icon: 'project' as const,
    },
  ],
  buttonLabel: 'Обсудить задачу и получить КП',
  buttonUrl: '/kontakty',
}

const hasMeaningfulText = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false
  const serialized = JSON.stringify(value)
  return /"text":"[^"]*[^\s"]+[^"]*"/.test(serialized)
}

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0
  return true
}

const run = async () => {
  const payload = await getPayload({ config: configPromise })
  const legacyHomeResult = await payload.find({
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
  const legacyHome = legacyHomeResult.docs[0]
  const home = await payload.findGlobal({
    slug: 'home',
    depth: 0,
    overrideAccess: false,
  })

  const currentHero = home.hero || {}
  const currentLayout = Array.isArray(home.layout) ? home.layout : []
  const sourceHero = legacyHome?.hero && hasMeaningfulValue(legacyHome.hero) ? legacyHome.hero : currentHero
  const sourceLayout =
    Array.isArray(legacyHome?.layout) && legacyHome.layout.length > 0 ? legacyHome.layout : currentLayout
  const sourceMeta = legacyHome?.meta && hasMeaningfulValue(legacyHome.meta) ? legacyHome.meta : home.meta

  const hasHeroText = hasMeaningfulText((sourceHero as any)?.richText)
  const hasHeroLinks = Array.isArray((sourceHero as any)?.links) && (sourceHero as any).links.length > 0
  const hasB2BBlock = sourceLayout.some((block) => block?.blockType === 'homeB2B')

  const nextLayout = hasB2BBlock ? sourceLayout : [...sourceLayout, { blockName: 'B2B / Тендеры', ...defaultB2BBlock }]

  await payload.updateGlobal({
    slug: 'home',
    context: { disableRevalidate: true },
    data: {
      title: legacyHome?.title || home.title || 'Главная',
      hero: {
        ...(sourceHero as Record<string, unknown>),
        type: (sourceHero as any)?.type || 'mediumImpact',
        ...(hasHeroText ? {} : { richText: defaultHeroRichText }),
        ...(hasHeroLinks ? {} : { links: defaultHeroLinks }),
      } as any,
      layout: nextLayout,
      ...(sourceMeta ? { meta: sourceMeta } : {}),
    },
  })

  if (legacyHome) {
    console.log(
      `Готово: global "home" восстановлен из pages/home (id=${legacyHome.id})${hasB2BBlock ? '' : ', B2B-блок добавлен'}.`,
    )
    return
  }

  console.log(
    `pages/home не найдена. Применен безопасный fallback: ${hasHeroText ? 'hero-текст уже был' : 'hero-текст заполнен'}, ${hasB2BBlock ? 'B2B-блок уже был' : 'B2B-блок добавлен'}.`,
  )
}

void run()
