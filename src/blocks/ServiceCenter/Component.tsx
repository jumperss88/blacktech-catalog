import Link from 'next/link'
import React from 'react'

import { Media as MediaComponent } from '@/components/Media'
import type { Media, ServiceCenterBlock as ServiceCenterBlockType } from '@/payload-types'

const defaultServiceTags = ['Diagnostics', 'Support', 'Warranty']

const mapParagraphs = (items: { text?: string | null }[] | null | undefined) =>
  (items || []).map((item) => item.text?.trim()).filter((text): text is string => Boolean(text))

const mapLabels = (items: { label?: string | null }[] | null | undefined) =>
  (items || []).map((item) => item.label?.trim()).filter((text): text is string => Boolean(text))

const mapCards = (
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

export const ServiceCenterBlock: React.FC<ServiceCenterBlockType> = (props) => {
  const heroParagraphs = mapParagraphs(props.hero?.paragraphs)
  const heroTags = mapLabels(props.hero?.visualTags)
  const cards = mapCards(props.cards)
  const sections = props.sections || []
  const requestSteps = mapLabels(props.serviceRequest?.steps)

  return (
    <div className="service-page-wrap">
      <section className="container service-hero">
        <div className="service-hero-main">
          <p className="service-eyebrow">{props.hero?.eyebrow}</p>
          <h1 className="service-hero-title">{props.hero?.title}</h1>
          <div className="service-hero-copy">
            {heroParagraphs.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
          <div className="service-hero-actions">
            <Link className="service-btn service-btn-dark" href={props.hero?.buttonUrl || '/kontakty'}>
              {props.hero?.buttonLabel}
            </Link>
          </div>
        </div>

        <div className="service-hero-visual" aria-hidden="true">
          {typeof props.hero?.heroImage === 'object' && props.hero.heroImage ? (
            <MediaComponent
              className="service-hero-media"
              fill
              imgClassName="service-hero-visual-image"
              resource={props.hero.heroImage as Media}
            />
          ) : null}
          <div className="service-hero-visual-panel">
            {(heroTags.length ? heroTags : defaultServiceTags).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="container service-cards" aria-label="Сервисные направления">
        {cards.map((card) => (
          <article className="service-card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      {sections.map((section, index) => {
        const paragraphs = mapParagraphs(section.paragraphs)
        if (!section.heading || !paragraphs.length) return null

        return (
          <section className="container service-text-block" key={`${section.heading}-${index}`}>
            <h2>{section.heading}</h2>
            {paragraphs.map((text, paragraphIndex) => (
              <p key={paragraphIndex}>{text}</p>
            ))}
          </section>
        )
      })}

      <section className="container service-howto">
        <h2>{props.serviceRequest?.heading}</h2>
        <p>{props.serviceRequest?.description}</p>
        <div className="service-howto-grid">
          {requestSteps.map((step) => (
            <article className="service-howto-item" key={step}>
              <span>{step}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="container service-final-cta">
        <h2>{props.final?.heading}</h2>
        <p>{props.final?.description}</p>
        <Link className="service-btn service-btn-dark" href={props.final?.buttonUrl || '/kontakty'}>
          {props.final?.buttonLabel}
        </Link>
      </section>
    </div>
  )
}
