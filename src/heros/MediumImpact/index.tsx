import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="container mb-6 md:mb-8">
      <div className="relative min-h-[440px] overflow-hidden rounded-[20px] border border-white/10 md:min-h-[620px]">
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

        <div className="absolute inset-0 bg-black/28" />
        <div className="absolute inset-0 bg-[linear-gradient(96deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.66)_31%,rgba(0,0,0,0.26)_57%,rgba(0,0,0,0.02)_84%)]" />
        <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_22%)] md:w-[52%]" />
        <div className="absolute inset-y-[10%] left-[50.5%] hidden w-px bg-white/14 md:block" />

        <div className="absolute inset-0 z-10 grid items-end md:items-center">
          <div className="w-full px-8 pb-9 pt-10 text-white md:max-w-[52%] md:px-14 md:pb-14 md:pt-14 lg:px-16">
            {richText && (
              <RichText
                className="mb-8 max-w-[640px] space-y-3 [&_*]:text-white [&_h1]:[font-family:var(--font-manrope)] [&_h1]:text-[clamp(2rem,3vw,3.45rem)] [&_h1]:leading-[1.01] [&_h1]:font-extrabold [&_h1]:tracking-[-0.021em] [&_h1]:max-w-[19ch] [&_h1]:[text-wrap:balance] [&_h1]:[text-shadow:0_6px_22px_rgba(0,0,0,0.42)] [&_p]:[font-family:var(--font-manrope)] [&_p]:text-[clamp(0.98rem,1.02vw,1.1rem)] [&_p]:leading-[1.42] [&_p]:font-medium [&_p]:max-w-[44ch] [&_p]:[text-wrap:pretty] [&_p]:text-white/86 [&_p:not(:first-of-type)]:hidden"
                data={richText}
                enableProse={false}
                enableGutter={false}
              />
            )}

            {Array.isArray(links) && links.length > 0 && (
              <ul className="flex flex-wrap gap-3.5">
                {links.map(({ link }, i) => {
                  const isPrimary = i === 0
                  const heroLinkClass = isPrimary
                    ? '!h-11 !rounded-full !border-white !bg-white !px-7 !text-[0.99rem] !font-semibold !text-black hover:!bg-white/90'
                    : '!h-11 !rounded-full !border-white/70 !bg-transparent !px-7 !text-[0.99rem] !font-semibold !text-white hover:!bg-white/12 hover:!text-white'
                  const heroLink = {
                    ...link,
                    appearance: isPrimary ? ('default' as const) : ('outline' as const),
                  }

                  return (
                    <li key={i}>
                      <CMSLink
                        {...heroLink}
                        className={heroLinkClass}
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
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
