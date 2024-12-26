import type { User } from '@mtcute/node'
import { LruMap } from '@fuman/utils'

export interface AuthState {
    oauthState: string
    oauthRedirectUri: string
    user?: User
}

export const authStore = new LruMap<string, AuthState>(100)
