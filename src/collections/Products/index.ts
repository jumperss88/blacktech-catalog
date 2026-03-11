import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { slugField } from 'payload'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { slugifyRussian } from '@/utilities/slugifyRussian'
import {
  classifySingleSpecification,
  detectSpecificationSectionHint,
  SPEC_SECTION_OPTIONS,
  type SpecSectionKey,
} from '@/utilities/specGrouping'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  AlignFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  ParagraphFeature,
  TextStateFeature,
  buildEditorState,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { Field, PayloadRequest } from 'payload'

type SpecificationRow = {
  name: string
  value: string
  group?: string
}

type GalleryItem = string | number | { id?: string | number | null } | null | undefined

const isAdminPreviewEnabled =
  process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_ENABLE_ADMIN_PREVIEW === 'true'

const rubCurrencyForAdmin = {
  code: 'USD',
  decimals: 2,
  label: 'Russian Ruble',
  symbol: '₽',
}

const rubCurrenciesConfigForAdmin = {
  defaultCurrency: 'USD',
  supportedCurrencies: [rubCurrencyForAdmin],
}

const localizePriceFields = (fields: Field[]): Field[] => {
  return fields.map((field) => {
    const nextField = { ...field } as Field & Record<string, unknown>

    if (nextField.name === 'priceInUSDEnabled') {
      nextField.label = 'Цена руб.'
    }

    if (nextField.name === 'priceInUSD') {
      nextField.label = 'Цена руб.'
      const currentAdmin =
        typeof nextField.admin === 'object' && nextField.admin
          ? (nextField.admin as Record<string, unknown>)
          : {}
      const currentComponents =
        typeof currentAdmin.components === 'object' && currentAdmin.components
          ? (currentAdmin.components as Record<string, unknown>)
          : {}

      nextField.admin = {
        ...currentAdmin,
        components: {
          ...currentComponents,
          Field: {
            path: '@payloadcms/plugin-ecommerce/rsc#PriceInput',
            clientProps: {
              currenciesConfig: rubCurrenciesConfigForAdmin,
              currency: rubCurrencyForAdmin,
            },
          },
        },
      } as Field['admin']
    }

    if (Array.isArray(nextField.fields)) {
      nextField.fields = localizePriceFields(nextField.fields)
    }

    if (Array.isArray(nextField.tabs)) {
      nextField.tabs = nextField.tabs.map((tab) => {
        const nextTab = { ...tab } as Record<string, unknown>
        if (Array.isArray(nextTab.fields)) {
          nextTab.fields = localizePriceFields(nextTab.fields as Field[])
        }

        return nextTab as unknown as (typeof tab)
      })
    }

    return nextField as Field
  })
}

const splitByFirstMatch = (line: string, pattern: RegExp): [string, string] | null => {
  const match = line.match(pattern)
  if (!match || match.index === undefined) return null

  const left = line.slice(0, match.index).trim()
  const right = line.slice(match.index + match[0].length).trim()

  if (!left || !right) return null
  return [left, right]
}

const splitByFirstDelimiter = (line: string): [string, string] | null => {
  const cleaned = line.replace(/^•+\s*/, '').trim()
  if (!cleaned) return null

  const match = cleaned.match(/^(.{2,160}?)(?:\s*[:：]\s+|\s+[-–—]\s+)(.+)$/)
  if (!match) return null

  const left = match[1].trim()
  const right = match[2].trim()
  if (!left || !right) return null
  return [left, right]
}

const parseSpecificationsBulk = (raw: string): SpecificationRow[] => {
  const rows: SpecificationRow[] = []
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  let activeHint: SpecSectionKey | null = null
  let activeHintRowsLeft = 0

  for (const line of lines) {
    const hintKey = detectSpecificationSectionHint(line)
    const looksLikeHeading =
      Boolean(hintKey) &&
      !line.includes('\t') &&
      !line.includes('|') &&
      !line.includes(';') &&
      !line.includes(':') &&
      !line.includes(' - ') &&
      line.length <= 80

    if (looksLikeHeading && hintKey) {
      activeHint = hintKey
      activeHintRowsLeft = 12
      continue
    }

    let parsed: [string, string] | null = null

    if (line.includes('\t')) {
      const parts = line.split('\t').map((part) => part.trim()).filter(Boolean)
      if (parts.length >= 2) {
        parsed = [parts[0], parts.slice(1).join(' ')]
      }
    }

    if (!parsed) {
      const pipeParts = line.split('|').map((part) => part.trim()).filter(Boolean)
      if (pipeParts.length >= 2) {
        parsed = [pipeParts[0], pipeParts.slice(1).join(' ')]
      }
    }

    if (!parsed) {
      const semicolonParts = line.split(';').map((part) => part.trim()).filter(Boolean)
      if (semicolonParts.length >= 2) {
        parsed = [semicolonParts[0], semicolonParts.slice(1).join(' ')]
      }
    }

    if (!parsed) {
      parsed = splitByFirstMatch(line, /\s[-–—]\s/)
    }

    if (!parsed) {
      parsed = splitByFirstDelimiter(line)
    }

    if (!parsed) {
      continue
    }

    const [name, value] = parsed
    const group =
      activeHint && activeHintRowsLeft > 0
        ? activeHint
        : classifySingleSpecification({
            label: name,
            value,
          })

    rows.push({
      name,
      value,
      group,
    })

    if (activeHint && activeHintRowsLeft > 0) {
      activeHintRowsLeft -= 1
      if (activeHintRowsLeft <= 0) {
        activeHint = null
      }
    }
  }

  return rows
}

const getGalleryItemId = (item: GalleryItem): string | null => {
  if (typeof item === 'string' || typeof item === 'number') {
    return String(item)
  }

  if (item && typeof item === 'object' && 'id' in item) {
    const value = item.id
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value)
    }
  }

  return null
}

const dedupeGallery = (gallery: unknown): unknown => {
  if (!Array.isArray(gallery)) return gallery

  const seen = new Set<string>()
  const result: GalleryItem[] = []

  for (const item of gallery as GalleryItem[]) {
    const id = getGalleryItemId(item)

    if (!id) {
      continue
    }

    if (seen.has(id)) {
      continue
    }

    seen.add(id)
    result.push(item)
  }

  return result
}

const normalizeRichTextInput = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return undefined
  }

  try {
    const parsed = JSON.parse(trimmed)

    if (parsed && typeof parsed === 'object' && 'root' in parsed) {
      return parsed
    }
  } catch {
    // Fall through to plain-text conversion for API clients that send raw strings.
  }

  return buildEditorState({ text: value })
}

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  labels: {
    singular: 'Товар',
    plural: 'Товары',
  },
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ['brand', 'model', 'enableVariants', '_status'],
    ...(isAdminPreviewEnabled
      ? {
          livePreview: {
            url: ({ data, req }) =>
              generatePreviewPath({
                slug: data?.slug,
                collection: 'products',
                req,
              }),
          },
          preview: (data: { slug?: string }, { req }: { req: PayloadRequest }) =>
            generatePreviewPath({
              slug: data?.slug as string,
              collection: 'products',
              req,
            }),
        }
      : {}),
    useAsTitle: 'title',
  },
  hooks: {
    ...defaultCollection.hooks,
    beforeValidate: [
      ...(defaultCollection.hooks?.beforeValidate || []),
      ({ data }) => {
        if (!data || typeof data !== 'object') return data

        const bulk = data.specificationsBulkPaste
        if (typeof bulk !== 'string' || !bulk.trim()) return data

        const parsed = parseSpecificationsBulk(bulk)
        if (parsed.length > 0) {
          data.specifications = parsed
        }

        return data
      },
      ({ data }) => {
        if (!data || typeof data !== 'object' || !Array.isArray(data.specifications)) {
          return data
        }

        data.specifications = data.specifications.map((row: SpecificationRow) => {
          if (!row || typeof row !== 'object') return row

          const name = typeof row.name === 'string' ? row.name.trim() : ''
          const group = typeof row.group === 'string' && row.group.trim() ? row.group : undefined

          return {
            ...row,
            group:
              group ||
              classifySingleSpecification({
                label: name,
                value: typeof row.value === 'string' ? row.value : '',
              }),
          }
        })

        return data
      },
      ({ data }) => {
        if (!data || typeof data !== 'object') return data

        const nextDescription = normalizeRichTextInput(data.description)
        if (nextDescription !== undefined || typeof data.description === 'string') {
          data.description = nextDescription
        }

        const nextExtraDescription = normalizeRichTextInput(data.extraDescription)
        if (nextExtraDescription !== undefined || typeof data.extraDescription === 'string') {
          data.extraDescription = nextExtraDescription
        }

        return data
      },
      ({ data }) => {
        if (!data || typeof data !== 'object') return data

        if (
          data.descriptionMode === 'html' &&
          (!data.descriptionHTML || !String(data.descriptionHTML).trim()) &&
          data.extraDescription &&
          typeof data.extraDescription === 'object' &&
          data.extraDescription.root
        ) {
          data.descriptionHTML = convertLexicalToHTML({
            data: data.extraDescription,
          })
        }

        return data
      },
      ({ data }) => {
        if (!data || typeof data !== 'object') return data

        const brand = typeof data.brand === 'string' ? data.brand.trim() : ''
        const model = typeof data.model === 'string' ? data.model.trim() : ''
        const fullTitle = [brand, model].filter(Boolean).join(' ').trim()

        data.title = fullTitle || brand || model || ''

        return data
      },
    ],
    beforeChange: [
      ...(defaultCollection.hooks?.beforeChange || []),
      ({ data }) => {
        if (!data || typeof data !== 'object') return data

        const nextGallery = dedupeGallery(data.gallery)
        if (nextGallery === data.gallery) {
          return data
        }

        data.gallery = nextGallery
        return data
      },
    ],
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    brand: true,
    model: true,
    title: true,
    slug: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    priceInUSD: true,
    inventory: true,
    meta: true,
  },
  fields: [
    {
      name: 'brand',
      type: 'text',
      label: 'Марка',
      required: false,
    },
    {
      name: 'model',
      type: 'text',
      label: 'Модель',
      required: false,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Полное название (авто)',
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'descriptionMode',
              type: 'select',
              label: 'Режим доп. описания',
              defaultValue: 'visual',
              options: [
                {
                  label: 'Визуальный редактор',
                  value: 'visual',
                },
                {
                  label: 'HTML',
                  value: 'html',
                },
              ],
              admin: {
                hidden: true,
              },
            },
            {
              name: 'extraDescriptionModeUI',
              type: 'ui',
              label: '',
              admin: {
                components: {
                  Field:
                    '@/components/admin/ProductExtraDescriptionMode#ProductExtraDescriptionMode',
                },
              },
            },
            {
              name: 'description',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    ParagraphFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    AlignFeature(),
                    TextStateFeature({
                      state: {
                        fontSize: {
                          sm: { label: 'Размер: S', css: { 'font-size': '14px' } },
                          md: { label: 'Размер: M', css: { 'font-size': '16px' } },
                          lg: { label: 'Размер: L', css: { 'font-size': '20px' } },
                          xl: { label: 'Размер: XL', css: { 'font-size': '28px' } },
                        },
                        fontFamily: {
                          sans: {
                            label: 'Шрифт: Sans',
                            css: { 'font-family': 'var(--font-sans, sans-serif)' },
                          },
                          mono: {
                            label: 'Шрифт: Mono',
                            css: { 'font-family': 'var(--font-mono, monospace)' },
                          },
                        },
                      },
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: false,
            },
            {
              name: 'extraDescription',
              type: 'richText',
              label: 'Дополнительное описание (визуальный редактор)',
              required: false,
              admin: {
                condition: (_, siblingData) => siblingData?.descriptionMode !== 'html',
              },
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    ParagraphFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    AlignFeature(),
                    TextStateFeature({
                      state: {
                        fontSize: {
                          sm: { label: 'Размер: S', css: { 'font-size': '14px' } },
                          md: { label: 'Размер: M', css: { 'font-size': '16px' } },
                          lg: { label: 'Размер: L', css: { 'font-size': '20px' } },
                          xl: { label: 'Размер: XL', css: { 'font-size': '28px' } },
                        },
                        fontFamily: {
                          sans: {
                            label: 'Шрифт: Sans',
                            css: { 'font-family': 'var(--font-sans, sans-serif)' },
                          },
                          mono: {
                            label: 'Шрифт: Mono',
                            css: { 'font-family': 'var(--font-mono, monospace)' },
                          },
                        },
                      },
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
            },
            {
              name: 'descriptionHTML',
              type: 'textarea',
              label: 'Дополнительное описание (HTML)',
              required: false,
              admin: {
                condition: (_, siblingData) => siblingData?.descriptionMode === 'html',
                description:
                  'Можно вставлять HTML-код напрямую для отдельного дополнительного блока на странице товара. Поле не скрывается при смене режима, чтобы контент не терялся визуально.',
              },
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Галерея товара',
              admin: {
                description:
                  'Перетаскивайте сразу несколько фото в это поле. Порядок можно менять drag-and-drop прямо в списке.',
              },
            },

            {
              name: 'layout',
              type: 'blocks',
              label: 'Макет страницы',
              blocks: [CallToAction, Content, MediaBlock],
            },
          ],
          label: 'Контент',
        },
        {
          fields: [
            ...localizePriceFields(defaultCollection.fields),
            {
              name: 'relatedProducts',
              type: 'relationship',
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  }
                }

                // ID comes back as undefined during seeding so we need to handle that case
                return {
                  id: {
                    exists: true,
                  },
                }
              },
              hasMany: true,
              relationTo: 'products',
            },
            {
              name: 'specificationsTitle',
              type: 'text',
              label: 'Заголовок таблицы характеристик',
              defaultValue: 'Характеристики',
            },
            {
              name: 'specificationsView',
              type: 'select',
              label: 'Вид характеристик на сайте',
              defaultValue: 'grouped',
              options: [
                { label: 'Авто-блоки (рекомендуется)', value: 'grouped' },
                { label: 'Таблица (классический)', value: 'table' },
              ],
            },
            {
              name: 'specificationsBulkPaste',
              type: 'textarea',
              virtual: true,
              label: 'Быстрая вставка характеристик',
              admin: {
                description:
                  'Вставьте таблицу из 2 столбцов (например, из Excel/сайта). После сохранения строки автоматически разложатся в таблицу ниже.',
              },
            },
            {
              name: 'specifications',
              type: 'array',
              label: 'Таблица характеристик',
              labels: {
                singular: 'Строка характеристики',
                plural: 'Строки характеристик',
              },
              defaultValue: [{ name: '', value: '' }],
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: 'Параметр',
                },
                {
                  name: 'value',
                  type: 'text',
                  label: 'Значение',
                },
                {
                  name: 'group',
                  type: 'select',
                  label: 'Блок',
                  options: SPEC_SECTION_OPTIONS.map((option) => ({
                    label: option.label,
                    value: option.value,
                  })),
                  admin: {
                    description:
                      'Можно оставить пустым: при сохранении группа подставится автоматически.',
                  },
                },
              ],
            },
          ],
          label: 'Детали товара',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: process.env.NODE_ENV !== 'development',
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: process.env.NODE_ENV !== 'development',

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      label: 'Категории',
      admin: {
        position: 'sidebar',
        sortOptions: 'title',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    slugField({
      slugify: ({ data, valueToSlugify }) => {
        const source = valueToSlugify || data?.title
        if (!source || typeof source !== 'string') return undefined
        return slugifyRussian(source)
      },
    }),
  ],
})
