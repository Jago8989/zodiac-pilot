import { accountSchema } from '@zodiac/db/schema'
import { z } from 'zod'
import { api, type FetchOptions } from './api'
import type { PartialAccount } from './PartialAccount'

export const saveRemoteActiveAccount = async (
  account: PartialAccount | null,
  { signal }: FetchOptions,
) => {
  if (account == null) {
    await api('/extension/remove-active-account', {
      signal,
      schema: z.null(),
      method: 'POST',
    })
  } else {
    await api('/extension/active-account', {
      signal,
      schema: accountSchema.nullable(),
      body: { accountId: account.id },
    })
  }
}
