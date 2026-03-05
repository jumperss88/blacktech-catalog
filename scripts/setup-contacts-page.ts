import configPromise from '@payload-config'
import { getPayload } from 'payload'

const ensureContactsPage = async () => {
  const payload = await getPayload({ config: configPromise })

  const pageResult = await payload.find({
    collection: 'pages',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'kontakty' } },
  })

  let pageId: number

  const contactsLayoutBlock = {
    blockName: 'Контакты',
    blockType: 'contactsHub' as const,
    hero: {
      eyebrow: 'КОНТАКТЫ',
      title: 'Свяжитесь с нами',
      description:
        'Свяжитесь с нами по вопросам поставки оборудования, подбора решений, участия в закупках, дилерского сотрудничества, сервиса и гарантийной поддержки. Основной формат связи — по телефону и email.',
      buttonLabel: 'Отправить заявку',
      buttonUrl: '#contacts-form',
    },
    heroContacts: {
      phoneLabel: 'Телефон',
      phone: '+7 (900) 000-00-00',
      emailLabel: 'Email',
      email: 'info@blacktechlight.ru',
    },
    directions: [
      {
        title: 'Общие вопросы',
        description: 'Информация о компании, формате работы и общие обращения',
      },
      {
        title: 'Заявки и поставки',
        description: 'Подбор оборудования, коммерческие предложения и рабочие запросы',
      },
      {
        title: 'Тендеры и проекты',
        description: '44-ФЗ, 223-ФЗ, прямые контракты, спецификации и ТЗ',
      },
      {
        title: 'Сервис и гарантия',
        description: 'Гарантийные обращения, диагностика, ремонт и техническая поддержка',
      },
    ],
    mainContacts: {
      heading: 'Основные контакты',
      description:
        'По всем рабочим вопросам вы можете связаться с нами по телефону или email. Мы постараемся оперативно ответить и предложить подходящий формат дальнейшего взаимодействия.',
      phoneLabel: 'Телефон',
      phone: '+7 (900) 000-00-00',
      emailLabel: 'Email',
      email: 'info@blacktechlight.ru',
    },
    requisites: {
      heading: 'Реквизиты',
      nameLabel: 'Наименование',
      name: 'ООО «Black Tech Light»',
      innLabel: 'ИНН',
      inn: '0000000000',
      ogrnLabel: 'ОГРН',
      ogrn: '0000000000000',
      emailLabel: 'Email',
      email: 'info@blacktechlight.ru',
      phoneLabel: 'Телефон',
      phone: '+7 (900) 000-00-00',
    },
    form: {
      heading: 'Напишите нам',
      description:
        'Оставьте сообщение, и мы свяжемся с вами для уточнения деталей. Можно написать по поставке оборудования, проекту, закупке, дилерскому сотрудничеству или сервисному вопросу.',
      buttonLabel: 'Отправить сообщение',
    },
    final: {
      heading: 'Открыты к рабочим запросам и сотрудничеству',
      description:
        'Если вам нужна поставка оборудования, подбор решения, участие в закупке, сервисная поддержка или обсуждение партнёрства — свяжитесь с нами по телефону или email.',
      buttonLabel: 'Связаться с нами',
      buttonUrl: '/kontakty',
    },
  }

  if (pageResult.docs[0]) {
    pageId = pageResult.docs[0].id as number

    await payload.update({
      collection: 'pages',
      id: pageId,
      overrideAccess: true,
      draft: false,
      context: { disableRevalidate: true },
      data: {
        title: 'Контакты',
        slug: 'kontakty',
        layout: [contactsLayoutBlock],
      },
    })
  } else {
    const created = await payload.create({
      collection: 'pages',
      overrideAccess: true,
      draft: false,
      context: { disableRevalidate: true },
      data: {
        title: 'Контакты',
        slug: 'kontakty',
        _status: 'published',
        hero: {
          type: 'none',
        },
        layout: [contactsLayoutBlock],
      },
    })

    pageId = created.id as number
  }

  const header = await payload.findGlobal({ slug: 'header', depth: 2 })
  const navItems = header.navItems || []

  const hasContacts = navItems.some((item) => {
    if (item.link?.type === 'custom') return item.link.url === '/kontakty'

    if (
      item.link?.type === 'reference' &&
      typeof item.link.reference?.value === 'object' &&
      item.link.reference?.value?.slug
    ) {
      return item.link.reference.value.slug === 'kontakty'
    }

    return false
  })

  if (!hasContacts) {
    await payload.updateGlobal({
      slug: 'header',
      context: { disableRevalidate: true },
      data: {
        ...(header.catalogCategories ? { catalogCategories: header.catalogCategories } : {}),
        navItems: [
          ...navItems,
          {
            link: {
              type: 'reference',
              newTab: false,
              label: 'Контакты',
              reference: {
                relationTo: 'pages',
                value: pageId,
              },
            },
          },
        ],
      },
    })
  }

  console.log(`Готово: страница Контакты настроена (id=${pageId}) и добавлена в header.`)
}

void ensureContactsPage()
