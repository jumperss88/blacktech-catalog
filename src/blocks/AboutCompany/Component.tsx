import Link from 'next/link'
import React from 'react'

import { Media as MediaComponent } from '@/components/Media'
import type { AboutCompanyBlock as AboutCompanyBlockType, Media } from '@/payload-types'

const defaultHeroTags = ['Stage', 'Backstage', 'Technical Flow']

const mapParagraphs = (items: { text?: string | null }[] | null | undefined) =>
  (items || []).map((item) => item.text?.trim()).filter((text): text is string => Boolean(text))

const mapLabels = (items: { label?: string | null }[] | null | undefined) =>
  (items || []).map((item) => item.label?.trim()).filter((text): text is string => Boolean(text))

const mapFacts = (
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

export const AboutCompanyBlock: React.FC<AboutCompanyBlockType> = (props) => {
  const heroParagraphs = mapParagraphs(props.hero?.paragraphs)
  const heroTags = mapLabels(props.hero?.visualTags)
  const facts = mapFacts(props.facts)
  const sections = props.sections || []
  const partnersParagraphs = mapParagraphs(props.partners?.paragraphs)
  const partnerPoints = mapLabels(props.partners?.points)
  const finalParagraphs = mapParagraphs(props.final?.paragraphs)

  return (
    <div className="about-page-wrap">
      <section className="container about-hero">
        <div className="about-hero-main">
          <p className="about-eyebrow">{props.hero?.eyebrow}</p>
          <h1 className="about-hero-title">{props.hero?.title}</h1>
          <div className="about-hero-copy">
            {heroParagraphs.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
          <div className="about-hero-actions">
            <Link className="about-btn about-btn-dark" href={props.hero?.primaryButtonUrl || '/kontakty'}>
              {props.hero?.primaryButtonLabel}
            </Link>
            <Link className="about-btn about-btn-light" href={props.hero?.secondaryButtonUrl || '/catalog'}>
              {props.hero?.secondaryButtonLabel}
            </Link>
          </div>
        </div>

        <div className="about-hero-visual" aria-hidden="true">
          {typeof props.hero?.heroImage === 'object' && props.hero.heroImage ? (
            <MediaComponent
              className="about-hero-media"
              fill
              imgClassName="about-hero-visual-image"
              resource={props.hero.heroImage as Media}
            />
          ) : null}
          <div className="about-hero-center-logo">
            <img alt="" src="/brand/about-logo.svg" />
          </div>
          <div className="about-hero-visual-panel">
            {(heroTags.length ? heroTags : defaultHeroTags).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="container about-facts" aria-label="Ключевые факты">
        {facts.map((fact) => (
          <article className="about-fact-card" key={fact.title}>
            <h2>{fact.title}</h2>
            <p>{fact.description}</p>
          </article>
        ))}
      </section>

      {sections.map((section, index) => {
        const paragraphs = mapParagraphs(section.paragraphs)
        if (!section.heading || !paragraphs.length) return null

        return (
          <section
            className={section.surfaceStyle ? 'container about-surface-block' : 'container about-text-block'}
            key={`${section.heading}-${index}`}
          >
            <h2>{section.heading}</h2>
            {paragraphs.map((text, paragraphIndex) => (
              <p key={paragraphIndex}>{text}</p>
            ))}
          </section>
        )
      })}

      <section className="container about-partners">
        <div className="about-partners-main">
          <h2>{props.partners?.heading}</h2>
          {partnersParagraphs.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>

        <aside className="about-partners-side" aria-label="Партнёрские акценты">
          <ul>
            {partnerPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <Link className="about-btn about-btn-dark" href={props.partners?.buttonUrl || '/kontakty'}>
            {props.partners?.buttonLabel}
          </Link>
        </aside>
      </section>

      <section className="container about-final-cta">
        <h2>{props.final?.heading}</h2>
        {finalParagraphs.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
        <Link className="about-btn about-btn-dark" href={props.final?.buttonUrl || '/kontakty'}>
          {props.final?.buttonLabel}
        </Link>
      </section>
    </div>
  )
}
