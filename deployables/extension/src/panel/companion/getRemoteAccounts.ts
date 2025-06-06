import { accountSchema } from '@zodiac/db/schema'
import { api, type FetchOptions } from './api'

const schema = accountSchema.array()

export const getRemoteAccounts = ({ signal }: FetchOptions) =>
  api('/extension/accounts', { schema, signal })
