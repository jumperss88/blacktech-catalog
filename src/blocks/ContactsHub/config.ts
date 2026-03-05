import type { Block } from 'payload'

export const ContactsHub: Block = {
  slug: 'contactsHub',
  interfaceName: 'ContactsHubBlock',
  labels: {
    singular: 'Контакты (длинная форма)',
    plural: 'Контакты (длинная форма)',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Hero',
      fields: [
        { name: 'eyebrow', type: 'text', label: 'Eyebrow', required: true },
        { name: 'title', type: 'text', label: 'Заголовок', required: true },
        { name: 'description', type: 'textarea', label: 'Текст', required: true },
        { name: 'buttonLabel', type: 'text', label: 'Кнопка: текст', required: true },
        { name: 'buttonUrl', type: 'text', label: 'Кнопка: URL', required: true },
      ],
    },
    {
      name: 'heroContacts',
      type: 'group',
      label: 'Карточка контактов в hero',
      fields: [
        { name: 'phoneLabel', type: 'text', label: 'Подпись телефона', required: true },
        { name: 'phone', type: 'text', label: 'Телефон', required: true },
        { name: 'emailLabel', type: 'text', label: 'Подпись email', required: true },
        { name: 'email', type: 'text', label: 'Email', required: true },
      ],
    },
    {
      name: 'directions',
      type: 'array',
      label: 'Карточки направлений',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', label: 'Заголовок', required: true },
        { name: 'description', type: 'textarea', label: 'Описание', required: true },
      ],
    },
    {
      name: 'mainContacts',
      type: 'group',
      label: 'Основные контакты',
      fields: [
        { name: 'heading', type: 'text', label: 'Заголовок', required: true },
        { name: 'description', type: 'textarea', label: 'Текст', required: true },
        { name: 'phoneLabel', type: 'text', label: 'Подпись телефона', required: true },
        { name: 'phone', type: 'text', label: 'Телефон', required: true },
        { name: 'emailLabel', type: 'text', label: 'Подпись email', required: true },
        { name: 'email', type: 'text', label: 'Email', required: true },
      ],
    },
    {
      name: 'requisites',
      type: 'group',
      label: 'Реквизиты',
      fields: [
        { name: 'heading', type: 'text', label: 'Заголовок', required: true },
        { name: 'nameLabel', type: 'text', label: 'Подпись наименования', required: true },
        { name: 'name', type: 'text', label: 'Наименование', required: true },
        { name: 'innLabel', type: 'text', label: 'Подпись ИНН', required: true },
        { name: 'inn', type: 'text', label: 'ИНН', required: true },
        { name: 'ogrnLabel', type: 'text', label: 'Подпись ОГРН/ОГРНИП', required: true },
        { name: 'ogrn', type: 'text', label: 'ОГРН/ОГРНИП', required: true },
        { name: 'emailLabel', type: 'text', label: 'Подпись email', required: true },
        { name: 'email', type: 'text', label: 'Email', required: true },
        { name: 'phoneLabel', type: 'text', label: 'Подпись телефона', required: true },
        { name: 'phone', type: 'text', label: 'Телефон', required: true },
      ],
    },
    {
      name: 'form',
      type: 'group',
      label: 'Форма',
      fields: [
        { name: 'heading', type: 'text', label: 'Заголовок', required: true },
        { name: 'description', type: 'textarea', label: 'Текст', required: true },
        { name: 'buttonLabel', type: 'text', label: 'Кнопка: текст', required: true },
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
