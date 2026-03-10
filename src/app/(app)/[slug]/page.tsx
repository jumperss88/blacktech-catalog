import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React from 'react'

import type { Page } from '@/payload-types'
import { notFound, permanentRedirect } from 'next/navigation'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params }: Args) {
  const { slug = 'home' } = await params

  if (slug === '-') {
    permanentRedirect('/o-nas')
  }

  if (isAssetLikeSlug(slug)) {
    return notFound()
  }

  const page = slug === 'home' ? await queryHomePage() : await queryPageBySlug({ slug })

  // Remove this code once your website is seeded
  if (!page) {
    return notFound()
  }

  const { hero, layout } = page

  return (
    <article className="pt-8 pb-16">
      {slug === 'o-nas' || slug === 'servisnii-tsentr' || slug === 'kontakty' ? null : <RenderHero {...hero} />}
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params

  if (isAssetLikeSlug(slug)) {
    return {}
  }

  const page = slug === 'home' ? await queryHomePage() : await queryPageBySlug({ slug })

  return generateMeta({ doc: page })
}

const isAssetLikeSlug = (slug: string) => slug.includes('.')

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0
  return true
}

const hasHomeContent = (page: Partial<Page> | null): page is Page => {
  if (!page) return false

  return (
    hasMeaningfulValue(page.hero) ||
    hasMeaningfulValue(page.layout) ||
    hasMeaningfulValue(page.meta)
  )
}

const queryPageBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}

const queryHomePage = async () => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const home = await payload.findGlobal({
    slug: 'home',
    draft,
    overrideAccess: false,
  })

  if (hasHomeContent(home as Partial<Page>)) {
    return {
      ...home,
      slug: 'home',
    } as Page
  }

  const legacyHomePage = await queryPageBySlug({ slug: 'home' })

  if (legacyHomePage) {
    return legacyHomePage
  }

  return {
    ...home,
    slug: 'home',
  } as Page
}
