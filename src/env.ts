import { z } from 'zod'

export const env = z.object({
    PORT: z.number().default(3000),
    APP_NAME: z.string().default('an appication'),

    // Telegram bot settings
    API_ID: z.coerce.number(),
    API_HASH: z.string(),
    BOT_TOKEN: z.string(),
    VERIFY_CHAT_ID: z.coerce.number(),

    // publicly accessible URL of telegram-oauth
    PUBLIC_URL: z.string(),
    // url to redirect to after login
    REDIRECT_URL: z.string(),
    // oauth client secret
    CLIENT_SECRET: z.string(),
    // jwt secret
    JWT_SECRET: z.string(),
}).parse(process.env)
