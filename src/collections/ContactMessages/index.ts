import { adminOnly } from '@/access/adminOnly'
import type { CollectionConfig } from 'payload'

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: {
    singular: 'Сообщение контактов',
    plural: 'Сообщения контактов',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'Коммуникации',
    defaultColumns: ['createdAt', 'name', 'company', 'phone', 'email'],
    useAsTitle: 'email',
  },
  fields: [
    { name: 'name', type: 'text', label: 'Имя' },
    { name: 'company', type: 'text', label: 'Компания' },
    { name: 'phone', type: 'text', label: 'Телефон' },
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'message', type: 'textarea', label: 'Сообщение', required: true },
    { name: 'sourcePage', type: 'text', label: 'Источник', defaultValue: 'kontakty' },
  ],
}
