import { cn } from '@/utilities/cn'
import React from 'react'
import { RichText } from '@/components/RichText'
import type { DefaultDocumentIDType } from 'payload'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

const hasTextInNode = (node: unknown): boolean => {
  if (!node || typeof node !== 'object') return false
  const value = node as { text?: string; children?: unknown[] }

  if (typeof value.text === 'string' && value.text.trim().length > 0) return true
  if (Array.isArray(value.children)) return value.children.some((child) => hasTextInNode(child))

  return false
}

export const ContentBlock: React.FC<
  ContentBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  const visibleColumns =
    columns?.filter((col) => {
      const hasLink = Boolean(
        col.enableLink &&
          (col.link?.url || col.link?.label || (col.link?.reference && col.link.type === 'reference')),
      )
      const hasText = hasTextInNode(col.richText)
      return hasLink || hasText
    }) || []

  if (!visibleColumns.length) return null

  return (
    <div className="container my-4">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {visibleColumns.map((col, index) => {
          const { enableLink, link, richText, size } = col

          return (
            <div
              className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                'md:col-span-2': size !== 'full',
              })}
              key={index}
            >
              {richText && <RichText data={richText} enableGutter={false} />}

              {enableLink && <CMSLink {...link} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
