import type { GlobalConfig } from 'payload'

import { AboutCompany } from '@/blocks/AboutCompany/config'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { Banner } from '@/blocks/Banner/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Carousel } from '@/blocks/Carousel/config'
import { ContactsHub } from '@/blocks/ContactsHub/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { HomeB2B } from '@/blocks/HomeB2B/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { ServiceCenter } from '@/blocks/ServiceCenter/config'
import { ThreeItemGrid } from '@/blocks/ThreeItemGrid/config'
import { adminOnly } from '@/access/adminOnly'
import { hero } from '@/fields/hero'
import { revalidateHome } from '@/globals/hooks/revalidateHome'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
} from '@payloadcms/plugin-seo/fields'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Главная',
  access: {
    read: () => true,
    update: adminOnly,
  },
  admin: {
    group: 'Глобальные',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Заголовок',
      required: true,
      defaultValue: 'Главная',
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
                HomeB2B,
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
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHome],
  },
  versions: {
    drafts: {
      autosave: true,
    },
    max: 50,
  },
}
