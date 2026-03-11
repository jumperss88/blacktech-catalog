'use client'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/providers/Auth'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { MinusIcon, PlusIcon, RotateCcwIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Cart, Variant } from '@/payload-types'
import { useEffect, useMemo, useState } from 'react'

type CartItem = NonNullable<Cart['items']>[number]
type VariantOptionValue = Variant['options'][number]

type RequestPayload = {
  contact: {
    name?: string
    company?: string
    phone?: string
    email?: string
    comment?: string
  }
  items: {
    productId: number
    quantity: number
    title: string
    variantId?: number
    variantLabel?: string
    priceInUSD?: number
  }[]
  subtotal?: number
}

const toFiniteNumber = (value: unknown): number | undefined => {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim().length > 0
        ? Number(value)
        : NaN

  return Number.isFinite(parsed) ? parsed : undefined
}

const isCartItemAvailable = (item: CartItem): boolean => {
  const product = item?.product
  if (!item || !product || typeof product !== 'object') return false
  const quantity = toFiniteNumber(item.quantity)
  if (!quantity || quantity < 1) return false

  const variant = item.variant && typeof item.variant === 'object' ? item.variant : undefined
  const inventory =
    toFiniteNumber(variant?.inventory) ?? toFiniteNumber(product.inventory)

  if (inventory !== undefined && inventory < 1) return false

  return true
}

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const { cart, clearCart, decrementItem, incrementItem, isLoading } = useCart()

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<null | string>(null)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [typedQuantities, setTypedQuantities] = useState<Record<string, string>>({})
  const [removedItemIDs, setRemovedItemIDs] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }

    if (user?.name) {
      setName(user.name)
    }
  }, [user?.email, user?.name])

  const activeCartItems = useMemo(() => {
    if (!cart?.items?.length) return []

    return cart.items.filter((item) => {
      const itemID = item.id ? String(item.id) : undefined
      if (itemID && removedItemIDs[itemID]) return false
      return isCartItemAvailable(item)
    })
  }, [cart?.items, removedItemIDs])

  const cartIsEmpty = activeCartItems.length === 0
  const hasContact = Boolean(phone.trim() || email.trim())

  const requestItems = useMemo<RequestPayload['items']>(() => {
    if (!activeCartItems.length) return []

    return activeCartItems
      .map((item) => {
        const product = item.product
        const quantity = item.quantity || 0
        const variant = item.variant && typeof item.variant === 'object' ? item.variant : undefined

        const variantLabel = Array.isArray(variant?.options)
          ? variant.options
              .map((option: VariantOptionValue) => {
                if (typeof option === 'object' && option?.label) return option.label
                return null
              })
              .filter((label: string | null): label is string => Boolean(label))
              .join(', ')
          : undefined

        if (!quantity) return null

        return {
          productId: product.id,
          quantity,
          title: product.title,
          variantId: variant?.id,
          variantLabel: variantLabel || undefined,
          priceInUSD:
            typeof (variant?.priceInUSD ?? product.priceInUSD) === 'number'
              ? (variant?.priceInUSD ?? product.priceInUSD)
              : undefined,
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
  }, [activeCartItems])

  const activeSubtotal = useMemo(() => {
    if (!activeCartItems.length) return 0

    return activeCartItems.reduce((sum, item) => {
      if (!item.quantity || typeof item.product !== 'object') return sum

      const variant = item.variant && typeof item.variant === 'object' ? item.variant : undefined
      const price = variant?.priceInUSD ?? item.product.priceInUSD
      if (typeof price !== 'number') return sum

      return sum + price * item.quantity
    }, 0)
  }, [activeCartItems])

  const submitRequest = async () => {
    if (!hasContact) {
      const message = 'Укажите телефон или email для связи.'
      setErrorMessage(message)
      toast.error(message)
      return
    }

    if (!requestItems.length) {
      const message = 'Ваша заявка пуста.'
      setErrorMessage(message)
      toast.error(message)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const body: RequestPayload = {
        contact: {
          ...(name.trim() ? { name: name.trim() } : {}),
          ...(company.trim() ? { company: company.trim() } : {}),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(comment.trim() ? { comment: comment.trim() } : {}),
        },
        items: requestItems,
        subtotal: typeof cart?.subtotal === 'number' ? cart.subtotal : undefined,
      }

      const response = await fetch('/api/requests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok) {
        const message =
          typeof result?.error === 'string' ? result.error : 'Не удалось отправить заявку.'
        throw new Error(message)
      }

      clearCart()

      setSuccessMessage(
        'Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время для уточнения деталей, стоимости и сроков поставки.',
      )

      setComment('')
      setCompany('')
      setPhone('')
      if (!user?.email) {
        setEmail('')
      }

      toast.success('Заявка успешно отправлена.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось отправить заявку.'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const applyTypedQuantity = async (item: CartItem, maxQuantity?: number) => {
    if (!item.id || !item.quantity) return

    const itemID = String(item.id)
    const rawValue = typedQuantities[itemID] ?? String(item.quantity)
    const parsed = Number.parseInt(rawValue, 10)

    if (Number.isNaN(parsed)) {
      setTypedQuantities((prev) => ({ ...prev, [itemID]: String(item.quantity) }))
      return
    }

    let target = parsed
    if (target < 1) target = 1
    if (typeof maxQuantity === 'number') {
      target = Math.min(target, maxQuantity)
    }

    if (target === item.quantity) {
      setTypedQuantities((prev) => ({ ...prev, [itemID]: String(target) }))
      return
    }

    const diff = target - item.quantity
    if (diff > 0) {
      for (let i = 0; i < diff; i += 1) {
        await Promise.resolve(incrementItem(itemID))
      }
    } else {
      for (let i = 0; i < Math.abs(diff); i += 1) {
        await Promise.resolve(decrementItem(itemID))
      }
    }

    setTypedQuantities((prev) => ({ ...prev, [itemID]: String(target) }))
  }

  const markItemAsRemoved = (itemID: string) => {
    setRemovedItemIDs((prev) => ({ ...prev, [itemID]: true }))
  }

  const restoreRemovedItem = (itemID: string) => {
    setRemovedItemIDs((prev) => {
      const next = { ...prev }
      delete next[itemID]
      return next
    })
  }

  if (successMessage) {
    return (
      <div className="py-12 w-full items-center">
        <h2 className="text-3xl font-medium mb-3">Заявка отправлена</h2>
        <p className="text-muted-foreground max-w-3xl">{successMessage}</p>
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="py-12 w-full items-center">
        <h2 className="text-3xl font-medium mb-3">Ваша заявка пуста</h2>
        <p className="text-muted-foreground max-w-2xl">
          Добавьте интересующие товары, и мы свяжемся с вами для уточнения деталей.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-8 md:flex-row grow gap-10 md:gap-6 lg:gap-8">
      <div className="basis-full lg:basis-2/3 flex flex-col gap-8 justify-stretch">
        <h2 className="font-medium text-3xl">Контактные данные</h2>

        <p className="text-muted-foreground">
          Оставьте телефон или email, и менеджер свяжется с вами для уточнения деталей заявки.
        </p>

        {successMessage ? (
          <div className="rounded-lg bg-primary/5 p-4 text-base">{successMessage}</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="request-name">Имя</Label>
              <Input
                id="request-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="request-company">Компания</Label>
              <Input
                id="request-company"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Название компании"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="request-phone">Телефон</Label>
              <Input
                id="request-phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="request-email">Email</Label>
              <Input
                id="request-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="request-comment">Комментарий</Label>
              <Textarea
                id="request-comment"
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Укажите важные детали по оборудованию и срокам"
              />
            </div>
          </div>
        )}

        {!successMessage && (
          <>
            <p className="text-sm text-muted-foreground">Для отправки заявки укажите телефон или email.</p>

            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <Button
              className="self-start"
              disabled={isSubmitting || !hasContact || requestItems.length === 0}
              onClick={(e) => {
                e.preventDefault()
                void submitRequest()
              }}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </>
        )}
      </div>

      <div className="basis-full lg:basis-1/3 lg:pl-8 p-8 border-none bg-primary/5 flex flex-col gap-8 rounded-lg">
        <h2 className="text-3xl font-medium">Ваша заявка</h2>

        {cart?.items?.map((item: CartItem, index) => {
          if (typeof item.product !== 'object' || !item.product) return null

          const {
            product,
            product: { meta, title, gallery },
            quantity,
            variant,
          } = item

          if (!quantity) return null

          const image = gallery?.[0] || meta?.image
          let price = product?.priceInUSD

          const isVariant = Boolean(variant) && typeof variant === 'object'
          const variantObject = variant && typeof variant === 'object' ? variant : undefined
          const maxQuantity =
            toFiniteNumber(variantObject?.inventory) ?? toFiniteNumber(product.inventory)
          const itemID = item.id ? String(item.id) : undefined
          const isRemoved = Boolean(itemID && removedItemIDs[itemID])
          const typedValue =
            itemID && typedQuantities[itemID] !== undefined
              ? typedQuantities[itemID]
              : String(quantity)

          if (isVariant) {
            price = variant?.priceInUSD
          }

          return (
            <div className={`flex items-start gap-4 ${isRemoved ? 'opacity-55' : ''}`} key={index}>
              <div className="relative flex items-stretch justify-stretch h-20 w-20 p-2 rounded-lg border">
                <div className="absolute -top-2 -right-2 z-10">
                  {itemID && !isRemoved ? (
                    <button
                      aria-label="Пометить как удалённый"
                      className="ease hover:cursor-pointer flex h-[17px] w-[17px] items-center justify-center rounded-full bg-neutral-500 transition-all duration-200 hover:opacity-80"
                      disabled={isLoading}
                      onClick={() => markItemAsRemoved(itemID)}
                      type="button"
                    >
                      <XIcon className="mx-px h-4 w-4 text-white" />
                    </button>
                  ) : null}
                </div>
                <div className="relative w-full h-full">
                  {image && typeof image !== 'string' && (
                    <Media className="" fill imgClassName="rounded-lg" resource={image} />
                  )}
                </div>
              </div>

              <div className="flex grow justify-between items-start gap-4">
                <div className="flex flex-col gap-1">
                  {product.slug ? (
                    <Link
                      className="font-medium text-lg leading-tight hover:underline"
                      href={`/products/${product.slug}`}
                    >
                      {title}
                    </Link>
                  ) : (
                    <p className="font-medium text-lg leading-tight">{title}</p>
                  )}
                  {variant && typeof variant === 'object' && Array.isArray(variant.options) && (
                    <p className="text-sm font-mono text-primary/50 tracking-widest">
                      {variant.options
                        .map((option: VariantOptionValue) => {
                          if (typeof option === 'object' && option?.label) return option.label
                          return null
                        })
                        .filter((label): label is string => Boolean(label))
                        .join(', ')}
                    </p>
                  )}

                  {isRemoved ? (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Удалено
                      </span>
                      {itemID && (
                        <button
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-background"
                          onClick={() => restoreRemovedItem(itemID)}
                          type="button"
                        >
                          <RotateCcwIcon className="h-3.5 w-3.5" />
                          Восстановить
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid h-10 w-[144px] grid-cols-[32px_1fr_32px] items-center rounded-lg border px-1">
                      <button
                        aria-label="Уменьшить количество"
                        className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!itemID || isLoading}
                        onClick={() => {
                          if (!itemID) return
                          if (quantity <= 1) {
                            markItemAsRemoved(itemID)
                            return
                          }
                          void decrementItem(itemID)
                        }}
                        type="button"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>

                      <input
                        aria-label="Количество"
                        className="w-full border-0 bg-transparent p-0 text-center text-lg font-medium leading-none outline-none"
                        inputMode="numeric"
                        onBlur={() => void applyTypedQuantity(item, maxQuantity)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '')
                          if (itemID) {
                            setTypedQuantities((prev) => ({ ...prev, [itemID]: value }))
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            void applyTypedQuantity(item, maxQuantity)
                          }
                        }}
                        pattern="[0-9]*"
                        type="text"
                        value={typedValue}
                      />

                      <button
                        aria-label="Увеличить количество"
                        className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={
                          !itemID ||
                          isLoading ||
                          (typeof maxQuantity === 'number' ? quantity >= maxQuantity : false)
                        }
                        onClick={() => {
                          if (itemID) void incrementItem(itemID)
                        }}
                        type="button"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {typeof price === 'number' && <Price amount={price} />}
              </div>
            </div>
          )
        })}

        <hr />

        <div className="flex justify-between items-center gap-2">
          <span className="uppercase">Итого</span>
          <Price className="text-3xl font-medium" amount={activeSubtotal} />
        </div>
      </div>
    </div>
  )
}
