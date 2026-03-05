import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'
import { slugifyRussian } from '@/utilities/slugifyRussian'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Категория',
    plural: 'Категории',
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Контент',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название',
      required: true,
    },
    {
      name: 'parentCategory',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      label: 'Родительская категория',
      admin: {
        description:
          'Выберите категорию-родителя. Если поле пустое — это категория верхнего уровня.',
        position: 'sidebar',
      },
    },
    {
      name: 'dropdownImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото для дропдауна в шапке',
      admin: {
        description:
          'Небольшая иконка/превью для выпадающего списка "Каталог" в хедере.',
      },
    },
    {
      name: 'catalogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото для страницы категорий',
      admin: {
        description: 'Главное изображение карточки категории на странице /catalog.',
      },
    },
    slugField({
      position: undefined,
      slugify: ({ data, valueToSlugify }) => {
        const source = valueToSlugify || data?.title
        if (!source || typeof source !== 'string') return undefined
        return slugifyRussian(source)
      },
    }),
  ],
}
