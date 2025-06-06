import { accountSchema } from '@zodiac/db/schema'
import { api, type FetchOptions } from './api'

export const findRemoteActiveAccount = ({ signal }: FetchOptions) =>
  api('/extension/active-account', { signal, schema: accountSchema.nullable() })
