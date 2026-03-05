import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { context, payload } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating footer global tag: global_footer')
    revalidateTag('global_footer')
  }

  return doc
}
