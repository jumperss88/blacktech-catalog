'use client'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { cn } from '@/utilities/cn'
import React, { useMemo } from 'react'

type BaseProps = {
  className?: string
  currencyCodeClassName?: string
  as?: 'span' | 'p'
}

type PriceFixed = {
  amount: number
  currencyCode?: string
  highestAmount?: never
  lowestAmount?: never
}

type PriceRange = {
  amount?: never
  currencyCode?: string
  highestAmount: number
  lowestAmount: number
}

type Props = BaseProps & (PriceFixed | PriceRange)

export const Price = ({
  amount,
  className,
  currencyCodeClassName: _currencyCodeClassName,
  highestAmount,
  lowestAmount,
  currencyCode: currencyCodeFromProps,
  as = 'p',
  ...rest
}: Props & React.ComponentProps<'p'>) => {
  const { currency, supportedCurrencies } = useCurrency()

  const Element = as

  const currencyToUse = useMemo(() => {
    if (currencyCodeFromProps) {
      return supportedCurrencies.find((currency) => currency.code === currencyCodeFromProps)
    }
    return currency
  }, [currencyCodeFromProps, supportedCurrencies, currency])

  const formatRuble = (baseValue: number) => {
    const decimals = typeof currencyToUse?.decimals === 'number' ? currencyToUse.decimals : 2
    const rubles = Math.round(baseValue / 10 ** decimals)
    const sign = rubles < 0 ? '-' : ''
    const grouped = Math.abs(rubles)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009')

    return `${sign}${grouped}\u2009₽`
  }

  if (typeof amount === 'number') {
    return (
      <Element
        className={cn('price-format', className)}
        suppressHydrationWarning
        {...rest}
      >
        {formatRuble(amount)}
      </Element>
    )
  }

  if (highestAmount && highestAmount !== lowestAmount) {
    return (
      <Element
        className={cn('price-format', className)}
        suppressHydrationWarning
        {...rest}
      >
        {`${formatRuble(lowestAmount)} - ${formatRuble(highestAmount)}`}
      </Element>
    )
  }

  if (lowestAmount) {
    return (
      <Element
        className={cn('price-format', className)}
        suppressHydrationWarning
        {...rest}
      >
        {`${formatRuble(lowestAmount)}`}
      </Element>
    )
  }

  return null
}
