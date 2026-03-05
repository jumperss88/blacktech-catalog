import Link from 'next/link'
import React from 'react'

import type { ContactsHubBlock as ContactsHubBlockType } from '@/payload-types'

import { ContactsHubForm } from './Form.client'

const phoneHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`

const mapDirections = (
  items: { description?: string | null; title?: string | null }[] | null | undefined,
): { description: string; title: string }[] =>
  (items || [])
    .map((item) => {
      const title = item.title?.trim()
      const description = item.description?.trim()
      if (!title || !description) return null
      return { description, title }
    })
    .filter((item): item is { description: string; title: string } => Boolean(item))

export const ContactsHubBlock: React.FC<ContactsHubBlockType> = (props) => {
  const directions = mapDirections(props.directions)

  return (
    <div className="contacts-page-wrap">
      <section className="container contacts-hero">
        <div className="contacts-hero-main">
          <p className="contacts-eyebrow">{props.hero?.eyebrow}</p>
          <h1 className="contacts-hero-title">{props.hero?.title}</h1>
          <p className="contacts-hero-copy">{props.hero?.description}</p>
          <Link className="contacts-btn contacts-btn-dark" href={props.hero?.buttonUrl || '#contacts-form'}>
            {props.hero?.buttonLabel}
          </Link>
        </div>

        <aside className="contacts-hero-card" aria-label="Основные каналы связи">
          <p>{props.heroContacts?.phoneLabel}</p>
          <a href={phoneHref(props.heroContacts?.phone || '')}>{props.heroContacts?.phone}</a>
          <p>{props.heroContacts?.emailLabel}</p>
          <a href={`mailto:${props.heroContacts?.email || ''}`}>{props.heroContacts?.email}</a>
        </aside>
      </section>

      <section className="container contacts-directions" aria-label="Направления обращений">
        {directions.map((direction) => (
          <article className="contacts-direction-card" key={direction.title}>
            <h2>{direction.title}</h2>
            <p>{direction.description}</p>
          </article>
        ))}
      </section>

      <section className="container contacts-main-block">
        <h2>{props.mainContacts?.heading}</h2>
        <p>{props.mainContacts?.description}</p>

        <div className="contacts-main-card">
          <div>
            <span>{props.mainContacts?.phoneLabel}</span>
            <a href={phoneHref(props.mainContacts?.phone || '')}>{props.mainContacts?.phone}</a>
          </div>
          <div>
            <span>{props.mainContacts?.emailLabel}</span>
            <a href={`mailto:${props.mainContacts?.email || ''}`}>{props.mainContacts?.email}</a>
          </div>
        </div>
      </section>

      <section className="container contacts-requisites">
        <h2>{props.requisites?.heading}</h2>
        <div className="contacts-requisites-card">
          <div>
            <span>{props.requisites?.nameLabel}</span>
            <p>{props.requisites?.name}</p>
          </div>
          <div>
            <span>{props.requisites?.innLabel}</span>
            <p>{props.requisites?.inn}</p>
          </div>
          <div>
            <span>{props.requisites?.ogrnLabel}</span>
            <p>{props.requisites?.ogrn}</p>
          </div>
          <div>
            <span>{props.requisites?.emailLabel}</span>
            <a href={`mailto:${props.requisites?.email || ''}`}>{props.requisites?.email}</a>
          </div>
          <div>
            <span>{props.requisites?.phoneLabel}</span>
            <a href={phoneHref(props.requisites?.phone || '')}>{props.requisites?.phone}</a>
          </div>
        </div>
      </section>

      <section className="container contacts-form-block" id="contacts-form">
        <h2>{props.form?.heading}</h2>
        <p>{props.form?.description}</p>
        <ContactsHubForm submitLabel={props.form?.buttonLabel || 'Отправить сообщение'} />
      </section>

      <section className="container contacts-final-cta">
        <h2>{props.final?.heading}</h2>
        <p>{props.final?.description}</p>
        <Link className="contacts-btn contacts-btn-dark" href={props.final?.buttonUrl || '/kontakty'}>
          {props.final?.buttonLabel}
        </Link>
      </section>
    </div>
  )
}
