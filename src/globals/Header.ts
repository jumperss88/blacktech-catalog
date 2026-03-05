import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Шапка сайта',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Пункты меню',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
    {
      name: 'catalogCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Категории в выпадающем каталоге',
      admin: {
        description:
          'Выберите категории, которые должны показываться в кнопке "Каталог" в шапке.',
      },
    },
  ],
}
