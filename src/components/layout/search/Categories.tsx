import configPromise from '@payload-config'
import { getPayload } from 'payload'
import clsx from 'clsx'
import React, { Suspense } from 'react'
import type { Category } from '@/payload-types'

import { FilterList } from './filter'
import { CategoriesList } from './Categories.client'
import { buildCatalogCategoryViews } from '@/lib/catalog-categories'

async function CategoryList() {
  const payload = await getPayload({ config: configPromise })

  const categories = await payload.find({
    collection: 'categories',
    overrideAccess: false,
    sort: 'title',
  })
  const categoriesView = buildCatalogCategoryViews(categories.docs as Category[])

  return (
    <div>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Категории
      </h3>

      <CategoriesList categories={categoriesView} />
    </div>
  )
}

const skeleton = 'mb-3 h-4 w-5/6 animate-pulse rounded'
const activeAndTitles = 'bg-neutral-800 dark:bg-neutral-300'
const items = 'bg-neutral-400 dark:bg-neutral-700'

export function Categories() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
        </div>
      }
    >
      <CategoryList />
    </Suspense>
  )
}
