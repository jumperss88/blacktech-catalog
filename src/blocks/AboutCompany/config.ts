import type { Block } from 'payload'

export const AboutCompany: Block = {
  slug: 'aboutCompany',
  interfaceName: 'AboutCompanyBlock',
  labels: {
    singular: 'О компании (длинная форма)',
    plural: 'О компании (длинная форма)',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Hero',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          label: 'Eyebrow',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Заголовок',
          required: true,
        },
        {
          name: 'paragraphs',
          type: 'array',
          label: 'Абзацы',
          minRows: 1,
          maxRows: 4,
          fields: [
            {
              name: 'text',
              type: 'textarea',
              label: 'Текст',
              required: true,
            },
          ],
        },
        {
          name: 'primaryButtonLabel',
          type: 'text',
          label: 'Первая кнопка: текст',
          required: true,
        },
        {
          name: 'primaryButtonUrl',
          type: 'text',
          label: 'Первая кнопка: URL',
          required: true,
        },
        {
          name: 'secondaryButtonLabel',
          type: 'text',
          label: 'Вторая кнопка: текст',
          required: true,
        },
        {
          name: 'secondaryButtonUrl',
          type: 'text',
          label: 'Вторая кнопка: URL',
          required: true,
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Изображение hero (опционально)',
          required: false,
        },
        {
          name: 'visualTags',
          type: 'array',
          label: 'Подписи на визуальном блоке',
          minRows: 0,
          maxRows: 4,
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Подпись',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'facts',
      type: 'array',
      label: 'Карточки-факты',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Заголовок',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание',
          required: true,
        },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Основные текстовые секции',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Заголовок',
          required: true,
        },
        {
          name: 'surfaceStyle',
          type: 'checkbox',
          label: 'Выделить светлой плашкой',
          defaultValue: false,
        },
        {
          name: 'paragraphs',
          type: 'array',
          label: 'Абзацы',
          minRows: 1,
          maxRows: 5,
          fields: [
            {
              name: 'text',
              type: 'textarea',
              label: 'Текст',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'partners',
      type: 'group',
      label: 'Блок партнёрства',
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Заголовок',
          required: true,
        },
        {
          name: 'paragraphs',
          type: 'array',
          label: 'Абзацы',
          minRows: 1,
          maxRows: 5,
          fields: [
            {
              name: 'text',
              type: 'textarea',
              label: 'Текст',
              required: true,
            },
          ],
        },
        {
          name: 'points',
          type: 'array',
          label: 'Короткие акценты справа',
          minRows: 1,
          maxRows: 5,
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Текст',
              required: true,
            },
          ],
        },
        {
          name: 'buttonLabel',
          type: 'text',
          label: 'Кнопка: текст',
          required: true,
        },
        {
          name: 'buttonUrl',
          type: 'text',
          label: 'Кнопка: URL',
          required: true,
        },
      ],
    },
    {
      name: 'final',
      type: 'group',
      label: 'Финальный блок',
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Заголовок',
          required: true,
        },
        {
          name: 'paragraphs',
          type: 'array',
          label: 'Абзацы',
          minRows: 1,
          maxRows: 5,
          fields: [
            {
              name: 'text',
              type: 'textarea',
              label: 'Текст',
              required: true,
            },
          ],
        },
        {
          name: 'buttonLabel',
          type: 'text',
          label: 'Кнопка: текст',
          required: true,
        },
        {
          name: 'buttonUrl',
          type: 'text',
          label: 'Кнопка: URL',
          required: true,
        },
      ],
    },
  ],
}
