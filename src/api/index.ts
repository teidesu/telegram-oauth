import type { TelegramClient } from '@mtcute/node'
import { unknownToError } from '@fuman/utils'
import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { nanoid } from 'nanoid'
import { env } from '../env.ts'
import { authStore } from '../store.ts'
import { INIT_TEMPLATE } from './init.ts'
import { createAccessToken, createAuthCode, verifyAuthCode } from './jwt.ts'

export async function createApi(bot: TelegramClient) {
    const app = new Hono()

    const html = INIT_TEMPLATE
        .replace('%APP_NAME%', env.APP_NAME)
        .replace(/%BOT_USERNAME%/g, await bot.getMyUsername() ?? '')

    app.get('/', async (ctx) => {
        const {
            state: oauthState,
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: responseType,
        } = ctx.req.query()

        if (!oauthState) {
            return ctx.text('Missing state', 400)
        }

        if (clientId !== 'telegram') {
            return ctx.text('Invalid client id', 400)
        }

        if (responseType !== 'code') {
            return ctx.text('Invalid response type (only code is supported)', 400)
        }

        const id = nanoid()
        authStore.set(id, {
            oauthState,
            oauthRedirectUri: redirectUri,
        })

        return ctx.html(html.replace(/%SESSION%/g, id))
    })

    app.get('/api/continue', async (ctx) => {
        const {
            session,
        } = ctx.req.query()

        if (!session) {
            return ctx.text('Missing session', 400)
        }

        const state = authStore.get(session)

        if (!state || !state.user) {
            return ctx.text('Bad session', 400)
        }

        const code = await createAuthCode(session)

        return ctx.redirect(`${state.oauthRedirectUri}?state=${state.oauthState}&code=${code}`)
    })

    app.get('/api/check', async (ctx) => {
        const {
            session,
        } = ctx.req.query()

        if (!session) {
            return ctx.json({ status: 'forgot' })
        }

        const state = authStore.get(session)

        if (!state) {
            return ctx.json({ status: 'forgot' })
        }

        if (!state.user) {
            return ctx.json({ status: 'wait' })
        }

        return ctx.json({ status: 'done' })
    })

    app.post('/oauth/token', async (ctx) => {
        const body = await ctx.req.formData()
        if (!body.has('code')) {
            return ctx.json({ error: 'Missing code' }, 400)
        }
        if (body.get('client_id') !== 'telegram') {
            return ctx.json({ error: 'Invalid client id' }, 400)
        }
        if (body.get('grant_type') !== 'authorization_code') {
            return ctx.json({ error: 'Invalid grant type' }, 400)
        }
        if (body.get('redirect_uri') !== env.REDIRECT_URL) {
            return ctx.json({ error: 'Invalid redirect uri' }, 400)
        }

        try {
            const sessionId = await verifyAuthCode(body.get('code') as string)
            const session = authStore.get(sessionId)

            if (!session || !session.user) {
                return ctx.json({ error: 'Invalid code: session not found' })
            }

            authStore.delete(sessionId)

            return ctx.json({
                access_token: await createAccessToken(session.user),
                expires_in: 3600,
                token_type: 'bearer',
            })
        } catch (err) {
            return ctx.json({ error: `Invalid code: ${unknownToError(err).message}` })
        }
    })

    app.get('/oauth/user', async (ctx) => {
        const auth = ctx.req.header('Authorization')
        if (!auth) {
            return ctx.json({ error: 'Missing Authorization header' }, 400)
        }

        const [type, token] = auth.split(' ')
        if (type.toLowerCase() !== 'bearer') {
            return ctx.json({ error: 'Invalid Authorization header' }, 400)
        }

        try {
            const data = await verify(token, env.JWT_SECRET)

            return ctx.json(data.user_data as Record<string, unknown>)
        } catch {
            return ctx.json({ error: 'Invalid token' })
        }
    })

    return app
}
