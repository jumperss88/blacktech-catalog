import type { Block } from 'payload'

export const HomeB2B: Block = {
  slug: 'homeB2B',
  interfaceName: 'HomeB2BBlock',
  labels: {
    singular: 'B2B / Тендеры',
    plural: 'B2B / Тендеры',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Надзаголовок',
      defaultValue: 'B2B / ГОСЗАКУПКИ / ПАРТНЕРСТВО',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Заголовок',
      defaultValue: 'Поставки под проект, закупку и дилерские задачи',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
      defaultValue:
        'Помогаем пройти путь от запроса до поставки: уточняем задачу, подбираем оборудование, готовим коммерческое предложение и сопровождаем закупку.',
      required: true,
    },
    {
      name: 'points',
      type: 'array',
      label: 'Преимущества',
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
          type: 'text',
          label: 'Описание',
          required: true,
        },
        {
          name: 'icon',
          type: 'select',
          label: 'Иконка',
          defaultValue: 'tender',
          options: [
            { label: 'Госзакупки', value: 'tender' },
            { label: 'Партнерство', value: 'partner' },
            { label: 'Проект', value: 'project' },
          ],
          required: true,
        },
      ],
      defaultValue: [
        {
          title: '44-ФЗ / 223-ФЗ',
          description: 'Подготовка под закупочные процедуры',
          icon: 'tender',
        },
        {
          title: 'Партнерские условия',
          description: 'Для дилеров, интеграторов и проката',
          icon: 'partner',
        },
        {
          title: 'Проектный подход',
          description: 'Подбор под ТЗ, бюджет и сроки',
          icon: 'project',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'buttonLabel',
          type: 'text',
          label: 'Кнопка: текст',
          defaultValue: 'Обсудить задачу и получить КП',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'buttonUrl',
          type: 'text',
          label: 'Кнопка: ссылка',
          defaultValue: '/kontakty',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
