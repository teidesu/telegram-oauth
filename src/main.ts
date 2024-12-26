import { serve } from '@hono/node-server'
import { TelegramClient } from '@mtcute/node'
import { createApi } from './api/index.ts'
import { dp } from './bot.ts'
import { env } from './env.ts'

const tg = new TelegramClient({
    apiId: env.API_ID,
    apiHash: env.API_HASH,
    storage: 'data/session',
})

dp.bindToClient(tg)

const self = await tg.start({
    botToken: env.BOT_TOKEN,
})

console.log(`Logged in as @${self.username}`)

serve({
    fetch: (await createApi(tg)).fetch,
    port: env.PORT,
}, (info) => {
    console.log(`🚀 Server started at http://${info.address}:${info.port}`)
})
