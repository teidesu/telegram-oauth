import type { User } from '@mtcute/node'
import { sign, verify } from 'hono/jwt'
import { env } from '../env.ts'

export function createAuthCode(session: string) {
    return sign({
        auth_session_id: session,
        exp: Date.now() + 300_000, // 5 minutes
    }, env.JWT_SECRET)
}

export async function verifyAuthCode(code: string): Promise<string> {
    const { auth_session_id } = await verify(code, env.JWT_SECRET)
    if (typeof auth_session_id !== 'string') {
        throw new TypeError('Invalid code')
    }

    return auth_session_id
}

export async function createAccessToken(user: User) {
    return sign({
        user_data: {
            user_id: user.id,
            username: user.username,
            display_name: user.displayName,
        },
        exp: Date.now() + 3600_000, // 1 hour
    }, env.JWT_SECRET)
}
