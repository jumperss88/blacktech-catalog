import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { normalizeMediaImage } from '@/hooks/normalizeMediaImage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  admin: {
    group: 'Контент',
    useAsTitle: 'filename',
  },
  slug: 'media',
  labels: {
    singular: 'Медиафайл',
    plural: 'Медиафайлы',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data || typeof data !== 'object') return data

        const currentAlt = typeof data.alt === 'string' ? data.alt.trim() : ''
        if (currentAlt) return data

        const reqFile = req.file as
          | { filename?: string; name?: string; originalname?: string }
          | undefined
        const sourceName =
          typeof data.filename === 'string'
            ? data.filename
            : typeof reqFile?.filename === 'string'
              ? reqFile.filename
              : typeof reqFile?.originalname === 'string'
                ? reqFile.originalname
              : typeof reqFile?.name === 'string'
                ? reqFile.name
              : ''

        if (!sourceName) return data

        const fileNameWithoutExt = sourceName.replace(/\.[^/.]+$/, '').trim()
        if (!fileNameWithoutExt) return data

        data.alt = fileNameWithoutExt
        return data
      },
    ],
    afterChange: [normalizeMediaImage],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt-текст',
      required: false,
    },
    {
      name: 'caption',
      type: 'richText',
      label: 'Подпись',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
  },
}
