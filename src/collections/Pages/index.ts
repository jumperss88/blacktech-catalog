import type { CollectionConfig } from 'payload'

import { AboutCompany } from '@/blocks/AboutCompany/config'
import { Banner } from '@/blocks/Banner/config'
import { Carousel } from '@/blocks/Carousel/config'
import { ContactsHub } from '@/blocks/ContactsHub/config'
import { ServiceCenter } from '@/blocks/ServiceCenter/config'
import { ThreeItemGrid } from '@/blocks/ThreeItemGrid/config'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { adminOnly } from '@/access/adminOnly'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { hero } from '@/fields/hero'
import { slugField } from 'payload'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { slugifyRussian } from '@/utilities/slugifyRussian'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { revalidatePage, revalidateDelete } from './hooks/revalidatePage'

const isAdminPreviewEnabled =
  process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_ENABLE_ADMIN_PREVIEW === 'true'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Страница',
    plural: 'Страницы',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  admin: {
    group: 'Контент',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    ...(isAdminPreviewEnabled
      ? {
          livePreview: {
            url: ({ data, req }) =>
              generatePreviewPath({
                slug: data?.slug,
                collection: 'pages',
                req,
              }),
          },
          preview: (data: { slug?: string }, { req }) =>
            generatePreviewPath({
              slug: data?.slug as string,
              collection: 'pages',
              req,
            }),
        }
      : {}),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Заголовок',
      required: true,
    },
    {
      name: 'publishedOn',
      type: 'date',
      label: 'Дата публикации',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Обложка',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Макет страницы',
              blocks: [
                AboutCompany,
                CallToAction,
                Content,
                ContactsHub,
                MediaBlock,
                Archive,
                Carousel,
                ServiceCenter,
                ThreeItemGrid,
                Banner,
                FormBlock,
              ],
              required: true,
            },
          ],
          label: 'Контент',
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
    slugField({
      slugify: ({ data, valueToSlugify }) => {
        const source = valueToSlugify || data?.title
        if (!source || typeof source !== 'string') return undefined
        return slugifyRussian(source)
      },
    }),
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  },
}
