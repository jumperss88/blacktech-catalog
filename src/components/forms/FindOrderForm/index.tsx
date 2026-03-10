import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { Fragment } from 'react'

type Props = {
  initialEmail?: string
}

export const FindOrderForm: React.FC<Props> = ({ initialEmail }) => {
  return (
    <Fragment>
      <h1 className="text-xl mb-4">Find my order</h1>
      <div className="prose dark:prose-invert mb-8">
        <p>{`Please enter your email and order ID below.`}</p>
      </div>
      <form
        action="/find-order/submit"
        className="max-w-lg flex flex-col gap-8"
        method="GET"
      >
        <FormItem>
          <Label htmlFor="email" className="mb-2">
            Email address
          </Label>
          <Input
            defaultValue={initialEmail}
            id="email"
            name="email"
            required
            type="email"
          />
        </FormItem>
        <FormItem>
          <Label htmlFor="orderID" className="mb-2">
            Order ID
          </Label>
          <Input
            id="orderID"
            name="orderID"
            required
            type="text"
          />
        </FormItem>
        <Button type="submit" className="self-start" variant="default">
          Find my order
        </Button>
      </form>
    </Fragment>
  )
}
