import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from '@/globals/hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Подвал сайта',
  hooks: {
    afterChange: [revalidateFooter],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'aboutDescription',
      type: 'textarea',
      label: 'Описание компании',
      defaultValue:
        'Профессиональное сценическое световое оборудование, поставки под проекты, закупки, дилерское сотрудничество и сервисная поддержка.',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'contactPhone',
          type: 'text',
          label: 'Телефон',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'contactEmail',
          type: 'text',
          label: 'Email',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primaryCTA',
          type: 'group',
          label: 'Кнопка: Каталог',
          admin: {
            width: '50%',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Текст кнопки',
              defaultValue: 'Каталог',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              label: 'Ссылка',
              defaultValue: '/catalog',
              required: true,
            },
          ],
        },
        {
          name: 'secondaryCTA',
          type: 'group',
          label: 'Кнопка: Оставить заявку',
          admin: {
            width: '50%',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Текст кнопки',
              defaultValue: 'Оставить заявку',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              label: 'Ссылка',
              defaultValue: '/checkout',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Пункты меню',
      defaultValue: [
        { link: { type: 'custom', label: 'Каталог', url: '/catalog' } },
        { link: { type: 'custom', label: 'О нас', url: '/o-nas' } },
        { link: { type: 'custom', label: 'Сервисный центр', url: '/servisnyy-centr' } },
        { link: { type: 'custom', label: 'Контакты', url: '/goszakupki-44-fz-223-fz' } },
      ],
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 4,
    },
  ],
}
