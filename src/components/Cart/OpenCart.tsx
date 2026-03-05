import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { ShoppingCart } from 'lucide-react'
import React from 'react'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <Button
      variant="nav"
      size="clear"
      className={clsx('headerCartButton relative hover:cursor-pointer', className)}
      {...rest}
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="sr-only">Заявка</span>

      {quantity ? (
        <span className="headerCartBadge">{quantity}</span>
      ) : null}
    </Button>
  )
}
