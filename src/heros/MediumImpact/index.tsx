import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="container mb-6 md:mb-8">
      <div className="relative overflow-hidden rounded-md min-h-[320px] md:min-h-[520px]">
        {media && typeof media === 'object' ? (
          <Media
            fill
            imgClassName="object-cover"
            priority
            resource={media}
          />
        ) : (
          <div className="h-full w-full bg-card" />
        )}

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute left-0 top-6 z-10 max-w-[780px] p-8 text-white md:top-10 md:p-12">
          <img
            src="/blacklogo.svg"
            alt=""
            aria-hidden="true"
            className="hero-logo-tunable pointer-events-none mb-4 h-auto select-none"
          />

          {richText && (
            <RichText
              className="mb-6 [&_*]:text-white [&_h1]:[font-family:var(--font-manrope)] [&_h1]:font-extrabold [&_p]:[font-family:var(--font-manrope)] [&_p]:font-normal"
              data={richText}
              enableGutter={false}
            />
          )}

          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {media && typeof media === 'object' && media?.caption && (
        <div className="mt-3">
          <RichText data={media.caption} enableGutter={false} />
        </div>
      )}
    </div>
  )
}
