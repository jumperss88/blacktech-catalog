import { adminOnly } from '@/access/adminOnly'
import type { CollectionConfig } from 'payload'

export const Requests: CollectionConfig = {
  slug: 'requests',
  labels: {
    singular: 'Заявка',
    plural: 'Заявки',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'Продажи',
    defaultColumns: ['createdAt', 'status', 'name', 'company', 'phone', 'email'],
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'new',
      options: [
        { label: 'Новая', value: 'new' },
        { label: 'В работе', value: 'inProgress' },
        { label: 'Завершена', value: 'closed' },
      ],
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      label: 'Имя',
    },
    {
      name: 'company',
      type: 'text',
      label: 'Компания',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Телефон',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
    },
    {
      name: 'comment',
      type: 'textarea',
      label: 'Комментарий',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Позиции заявки',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          label: 'Товар',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Название',
          required: true,
        },
        {
          name: 'variant',
          type: 'relationship',
          label: 'Вариант',
          relationTo: 'variants',
        },
        {
          name: 'variantLabel',
          type: 'text',
          label: 'Опции варианта',
        },
        {
          name: 'quantity',
          type: 'number',
          label: 'Количество',
          min: 1,
          required: true,
        },
        {
          name: 'priceInUSD',
          type: 'number',
          label: 'Цена (информативно)',
        },
      ],
    },
    {
      name: 'subtotal',
      type: 'number',
      label: 'Сумма (информативно)',
    },
    {
      name: 'customer',
      type: 'relationship',
      label: 'Пользователь',
      relationTo: 'users',
    },
  ],
}
