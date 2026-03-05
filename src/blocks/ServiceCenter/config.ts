import type { Block } from 'payload'

export const ServiceCenter: Block = {
  slug: 'serviceCenter',
  interfaceName: 'ServiceCenterBlock',
  labels: {
    singular: 'Сервисный центр (длинная форма)',
    plural: 'Сервисный центр (длинная форма)',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Hero',
      fields: [
        { name: 'eyebrow', type: 'text', label: 'Eyebrow', required: true },
        { name: 'title', type: 'text', label: 'Заголовок', required: true },
        {
          name: 'paragraphs',
          type: 'array',
          label: 'Абзацы',
          minRows: 1,
          maxRows: 4,
          fields: [{ name: 'text', type: 'textarea', label: 'Текст', required: true }],
        },
        { name: 'buttonLabel', type: 'text', label: 'Кнопка: текст', required: true },
        { name: 'buttonUrl', type: 'text', label: 'Кнопка: URL', required: true },
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
          fields: [{ name: 'label', type: 'text', label: 'Подпись', required: true }],
        },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Карточки',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', label: 'Заголовок', required: true },
        { name: 'description', type: 'textarea', label: 'Описание', required: true },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Текстовые секции',
      minRows: 1,
      maxRows: 5,
      fields: [
        { name: 'heading', type: 'text', label: 'Заголовок', required: true },
        {
          name: 'paragraphs',
          type: 'array',
          label: 'Абзацы',
          minRows: 1,
          maxRows: 4,
          fields: [{ name: 'text', type: 'textarea', label: 'Текст', required: true }],
        },
      ],
    },
    {
      name: 'serviceRequest',
      type: 'group',
      label: 'Как обратиться',
      fields: [
        { name: 'heading', type: 'text', label: 'Заголовок', required: true },
        { name: 'description', type: 'textarea', label: 'Текст', required: true },
        {
          name: 'steps',
          type: 'array',
          label: 'Шаги/карточки',
          minRows: 1,
          maxRows: 6,
          fields: [{ name: 'label', type: 'text', label: 'Текст', required: true }],
        },
      ],
    },
    {
      name: 'final',
      type: 'group',
      label: 'Финальный CTA',
      fields: [
        { name: 'heading', type: 'text', label: 'Заголовок', required: true },
        { name: 'description', type: 'textarea', label: 'Текст', required: true },
        { name: 'buttonLabel', type: 'text', label: 'Кнопка: текст', required: true },
        { name: 'buttonUrl', type: 'text', label: 'Кнопка: URL', required: true },
      ],
    },
  ],
}
