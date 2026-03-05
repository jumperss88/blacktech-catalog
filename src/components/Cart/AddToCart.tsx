'use client'

import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { MinusIcon, PlusIcon, ShoppingCart } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
type Props = {
  product: Product
  iconOnly?: boolean
  className?: string
}

export function AddToCart({ product, iconOnly = false, className }: Props) {
  const { addItem, cart, decrementItem, incrementItem, isLoading } = useCart()
  const searchParams = useSearchParams()

  const variants = product.variants?.docs || []

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')

      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [product.enableVariants, searchParams, variants])

  const addToCart = useCallback(
    (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      addItem({
        product: product.id,
        variant: selectedVariant?.id ?? undefined,
      }).then(() => {
        toast.success('Позиция добавлена в заявку.')
      })
    },
    [addItem, product, selectedVariant],
  )

  const existingItem = useMemo(() => {
    return cart?.items?.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant?.id
          : item.variant
        : undefined

      if (productID === product.id) {
        if (product.enableVariants) {
          return variantID === selectedVariant?.id
        }
        return true
      }
    })
  }, [selectedVariant, cart?.items, product])

  const existingQuantity = existingItem?.quantity || 0
  const [typedQuantity, setTypedQuantity] = useState('')

  const disabled = useMemo<boolean>(() => {
    if (existingItem) {
      const existingQuantity = existingItem.quantity

      if (product.enableVariants) {
        return existingQuantity >= (selectedVariant?.inventory || 0)
      }
      return existingQuantity >= (product.inventory || 0)
    }

    if (product.enableVariants) {
      if (!selectedVariant) {
        return true
      }

      if (selectedVariant.inventory === 0) {
        return true
      }
    } else {
      if (product.inventory === 0) {
        return true
      }
    }

    return false
  }, [selectedVariant, existingItem, product])

  const maxQuantity = useMemo(() => {
    if (product.enableVariants) {
      if (!selectedVariant || typeof selectedVariant.inventory !== 'number') return undefined
      return selectedVariant.inventory
    }

    if (typeof product.inventory !== 'number') return undefined
    return product.inventory
  }, [product.enableVariants, product.inventory, selectedVariant])

  const canIncrease =
    Boolean(existingItem?.id) &&
    !isLoading &&
    (typeof maxQuantity !== 'number' || existingQuantity < maxQuantity)

  const canDecrease = Boolean(existingItem?.id) && !isLoading

  useEffect(() => {
    if (existingQuantity > 0) {
      setTypedQuantity(String(existingQuantity))
    } else {
      setTypedQuantity('')
    }
  }, [existingQuantity])

  const applyTypedQuantity = useCallback(async () => {
    if (!existingItem?.id || existingQuantity <= 0) return

    const parsed = Number.parseInt(typedQuantity, 10)
    if (Number.isNaN(parsed)) {
      setTypedQuantity(String(existingQuantity))
      return
    }

    let target = parsed
    if (target < 1) target = 1
    if (typeof maxQuantity === 'number') {
      target = Math.min(target, maxQuantity)
    }

    if (target === existingQuantity) {
      setTypedQuantity(String(target))
      return
    }

    const itemID = String(existingItem.id)
    const diff = target - existingQuantity

    if (diff > 0) {
      for (let i = 0; i < diff; i += 1) {
        await Promise.resolve(incrementItem(itemID))
      }
    } else {
      for (let i = 0; i < Math.abs(diff); i += 1) {
        await Promise.resolve(decrementItem(itemID))
      }
    }

    setTypedQuantity(String(target))
  }, [
    decrementItem,
    existingItem?.id,
    existingQuantity,
    incrementItem,
    maxQuantity,
    typedQuantity,
  ])

  if (existingQuantity > 0 && existingItem?.id) {
    return (
      <div
        className={clsx(
          'inline-flex items-center',
          iconOnly ? 'gap-2' : 'w-[220px] justify-between gap-0',
          className,
        )}
      >
        {!iconOnly && <span className="text-lg font-semibold text-muted-foreground">В заявке</span>}

        <div
          className={clsx(
            'inline-flex items-center rounded-[16px] border bg-background',
            iconOnly
              ? 'h-9 w-[96px] justify-between px-1'
              : 'h-9 w-[128px] justify-between px-1',
          )}
        >
          <button
            aria-label="Уменьшить количество"
            className={clsx(
              'flex items-center justify-center rounded-md transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50',
              iconOnly ? 'h-6 w-6' : 'h-6 w-6',
            )}
            disabled={!canDecrease}
            onClick={() => decrementItem(String(existingItem.id))}
            type="button"
          >
            <MinusIcon className={iconOnly ? 'h-3 w-3' : 'h-3 w-3'} />
          </button>

          <input
            aria-label="Количество"
            className={clsx(
              'min-w-0 border-0 bg-transparent p-0 text-center font-medium leading-none outline-none',
              iconOnly ? 'w-7 text-base' : 'w-8 text-lg',
            )}
            inputMode="numeric"
            onBlur={() => void applyTypedQuantity()}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, '')
              setTypedQuantity(value)
            }}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void applyTypedQuantity()
              }
            }}
            pattern="[0-9]*"
            type="text"
            value={typedQuantity}
          />

          <button
            aria-label="Увеличить количество"
            className={clsx(
              'flex items-center justify-center rounded-md transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50',
              iconOnly ? 'h-6 w-6' : 'h-6 w-6',
            )}
            disabled={!canIncrease}
            onClick={() => incrementItem(String(existingItem.id))}
            type="button"
          >
            <PlusIcon className={iconOnly ? 'h-3 w-3' : 'h-3 w-3'} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <Button
      aria-label="Добавить в заявку"
      variant={'outline'}
      className={clsx(
        {
          'hover:opacity-90': true,
          'add-to-cart-icon-only': iconOnly,
          'h-9 w-[220px] gap-2 px-3 text-base font-semibold': !iconOnly,
        },
        className,
      )}
      disabled={disabled || isLoading}
      onClick={addToCart}
      type="submit"
    >
      {iconOnly ? <ShoppingCart className="h-4 w-4" /> : null}
      {!iconOnly ? <span className="leading-none">Добавить в заявку</span> : null}
    </Button>
  )
}
