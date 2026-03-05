import type { Footer as FooterType } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React, { Suspense } from 'react'

const defaultNavItems = [
  { id: 'catalog', link: { type: 'custom' as const, label: 'Каталог', url: '/catalog' } },
  { id: 'about', link: { type: 'custom' as const, label: 'О нас', url: '/o-nas' } },
  {
    id: 'service',
    link: { type: 'custom' as const, label: 'Сервисный центр', url: '/servisnyy-centr' },
  },
  {
    id: 'contacts',
    link: { type: 'custom' as const, label: 'Контакты', url: '/goszakupki-44-fz-223-fz' },
  },
]

const defaultAboutDescription =
  'Профессиональное сценическое световое оборудование, поставки под проекты, закупки, дилерское сотрудничество и сервисная поддержка.'

export async function Footer() {
  const footer: FooterType = await getCachedGlobal('footer', 1)()
  const menu = footer.navItems?.length ? footer.navItems : defaultNavItems
  const skeleton = 'h-5 w-full animate-pulse rounded bg-muted'

  const aboutDescription = footer.aboutDescription || defaultAboutDescription

  const phone = footer.contactPhone?.trim() || ''
  const email = footer.contactEmail?.trim() || ''

  return (
    <footer className="mt-6 border-t border-border/80 bg-card/40 text-sm md:mt-8">
      <div className="container py-8 md:py-10">
        <div className="grid gap-8 border border-border/70 bg-background/75 p-6 md:gap-10 md:rounded-2xl md:p-8 xl:grid-cols-12">
          <div className="space-y-4 xl:col-span-6">
            <Link className="inline-flex items-center" href="/">
              <img src="/blacklogo.svg" alt="Black Tech" className="h-auto w-32 dark:invert" />
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-foreground/75">{aboutDescription}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={footer.primaryCTA?.url || '/catalog'}
                className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:border-[color:var(--site-accent)] hover:text-[color:var(--site-accent-hover)]"
              >
                {footer.primaryCTA?.label || 'Каталог'}
              </Link>
              <Link
                href={footer.secondaryCTA?.url || '/checkout'}
                className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:border-[color:var(--site-accent)] hover:text-[color:var(--site-accent-hover)]"
              >
                {footer.secondaryCTA?.label || 'Оставить заявку'}
              </Link>
            </div>
          </div>

          <div className="space-y-3 xl:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/55">Навигация</p>
            <Suspense
              fallback={
                <div className="flex w-full max-w-[220px] flex-col gap-2">
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                </div>
              }
            >
              <FooterMenu menu={menu} />
            </Suspense>
          </div>

          <div className="space-y-3 xl:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/55">Контакты</p>
            <div className="space-y-1 text-sm text-foreground/85">
              {phone ? (
                <a
                  className="block transition-colors hover:text-[color:var(--site-accent-hover)]"
                  href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                >
                  {phone}
                </a>
              ) : null}
              {email ? (
                <a
                  className="block transition-colors hover:text-[color:var(--site-accent-hover)]"
                  href={`mailto:${email}`}
                >
                  {email}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/80 py-4">
        <div className="container flex w-full flex-col gap-2 text-xs text-foreground/65 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>&copy; 2026 Black Tech</p>
            <p>Информация на сайте носит справочный характер и не является публичной офертой.</p>
          </div>
          <div className="w-fit">
            <ThemeSelector />
          </div>
        </div>
      </div>
    </footer>
  )
}
