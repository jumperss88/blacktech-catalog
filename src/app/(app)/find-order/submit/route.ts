import { NextRequest, NextResponse } from 'next/server'

export function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  const orderID = request.nextUrl.searchParams.get('orderID')

  if (!email || !orderID) {
    return NextResponse.redirect(new URL('/find-order', request.url))
  }

  return NextResponse.redirect(
    new URL(`/orders/${encodeURIComponent(orderID)}?email=${encodeURIComponent(email)}`, request.url),
  )
}
