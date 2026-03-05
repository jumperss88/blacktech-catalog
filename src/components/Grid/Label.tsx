import clsx from 'clsx'
import React from 'react'

import { Price } from '@/components/Price'

type Props = {
  amount: number
  position?: 'bottom' | 'center'
  title: string
}

export const Label: React.FC<Props> = ({ amount, position = 'bottom', title }) => {
  return (
    <div
      className={clsx('absolute bottom-0 left-0 flex w-full px-2 pb-2 sm:px-4 sm:pb-4 @container/label', {
        '': position === 'center',
      })}
    >
      <div className="flex items-end justify-between text-sm grow font-semibold">
        <h3 className="tile-label-title mr-2 sm:mr-4 font-mono line-clamp-2 border px-3 py-1.5 sm:p-2 sm:px-3 leading-none tracking-tight rounded-full bg-white/70 text-black backdrop-blur-md dark:border-neutral-800 dark:bg-black/70 dark:text-white">
          {title}
        </h3>

        <Price
          amount={amount}
          className="tile-label-price tile-price-accent flex-none rounded-full px-3 py-1.5 sm:p-2 text-white"
          currencyCodeClassName="hidden @[275px]/label:inline"
        />
      </div>
    </div>
  )
}
