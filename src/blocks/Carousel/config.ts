import type { Block } from 'payload'

export const Carousel: Block = {
  slug: 'carousel',
  fields: [
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      label: 'Режим заполнения',
      options: [
        {
          label: 'По коллекции',
          value: 'collection',
        },
        {
          label: 'Ручной выбор',
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'products',
      label: 'Коллекция для вывода',
      options: [
        {
          label: 'Товары',
          value: 'products',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Категории для вывода',
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: 'Лимит',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: 'Выбранные документы',
      relationTo: ['products'],
    },
    {
      name: 'populatedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        description: 'Поле автоматически заполняется после чтения',
        disabled: true,
      },
      hasMany: true,
      label: 'Автозаполненные документы',
      relationTo: ['products'],
    },
    {
      name: 'populatedDocsTotal',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        description: 'Поле автоматически заполняется после чтения',
        disabled: true,
        step: 1,
      },
      label: 'Количество автозаполненных документов',
    },
  ],
  interfaceName: 'CarouselBlock',
  labels: {
    plural: 'Карусели',
    singular: 'Карусель',
  },
}
