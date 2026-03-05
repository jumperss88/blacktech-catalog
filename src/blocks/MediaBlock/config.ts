import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  labels: {
    singular: 'Медиа-блок',
    plural: 'Медиа-блоки',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      label: 'Медиафайл',
      relationTo: 'media',
      required: true,
    },
  ],
}
