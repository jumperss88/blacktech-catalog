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
        <div className="flex flex-col gap-2">
          <label
            className="mb-2 flex items-center gap-2 font-mono text-sm leading-none text-primary/50"
            htmlFor="email"
          >
            Email address
          </label>
          <input
            className="border-input bg-background flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs outline-none md:text-sm"
            defaultValue={initialEmail}
            id="email"
            name="email"
            required
            type="email"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="mb-2 flex items-center gap-2 font-mono text-sm leading-none text-primary/50"
            htmlFor="orderID"
          >
            Order ID
          </label>
          <input
            className="border-input bg-background flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs outline-none md:text-sm"
            id="orderID"
            name="orderID"
            required
            type="text"
          />
        </div>
        <button
          className="bg-primary text-primary-foreground self-start rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-[color,box-shadow]"
          type="submit"
        >
          Find my order
        </button>
      </form>
    </Fragment>
  )
}
