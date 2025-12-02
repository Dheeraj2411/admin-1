import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings'
import { PartialDeep } from 'type-fest'

/**
 * The type definition for a user object.
 */
export type User = {
  id: string
  role: string[] | string | null
  name: string
  profileImage?: string
  email?: string
  shortcuts?: string[]
  settings?: PartialDeep<FuseSettingsConfigType>
  loginRedirectUrl?: string // The URL to redirect to after login.
}
