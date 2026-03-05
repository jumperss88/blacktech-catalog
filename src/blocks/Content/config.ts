import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'Одна треть',
        value: 'oneThird',
      },
      {
        label: 'Половина',
        value: 'half',
      },
      {
        label: 'Две трети',
        value: 'twoThirds',
      },
      {
        label: 'Полная ширина',
        value: 'full',
      },
    ],
    label: 'Ширина колонки',
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    label: 'Показывать ссылку',
  },
  link({
    overrides: {
      admin: {
        condition: (_: unknown, { enableLink }: { enableLink?: boolean }) => Boolean(enableLink),
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: {
    singular: 'Контент',
    plural: 'Контентные блоки',
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: 'Колонки',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
