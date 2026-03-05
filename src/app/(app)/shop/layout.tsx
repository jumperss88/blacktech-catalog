import { Categories } from '@/components/layout/search/Categories'
import { FilterList } from '@/components/layout/search/filter'
import { sorting } from '@/lib/constants'
import React, { Suspense } from 'react'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <div className="container my-8 flex flex-col gap-6 pb-4 md:my-10">
        <div className="flex flex-col items-start gap-8 md:flex-row md:gap-6">
          <aside className="shop-sidebar-sticky h-fit w-full flex-none basis-1/5 self-start md:max-w-[250px]">
            <div className="rounded-xl border bg-card p-3 md:p-4">
              <div className="flex flex-col gap-4 md:gap-5">
                <Categories />
                <FilterList list={sorting} title="Сортировка" />
              </div>
            </div>
          </aside>

          <div className="min-h-screen w-full">{children}</div>
        </div>
      </div>
    </Suspense>
  )
}
