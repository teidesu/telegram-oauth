import { Dispatcher, filters } from '@mtcute/dispatcher'
import { env } from './env.ts'
import { authStore } from './store.ts'

export const dp = Dispatcher.child()

dp.onNewMessage(filters.deeplink(/^oauth_(.+)$/), async (ctx) => {
    const code = ctx.command[2]

    const state = authStore.get(code)

    if (!state) {
        await ctx.replyText('⚠️ Invalid code, please try again')
        return
    }

    if (ctx.sender.type !== 'user') {
        // should not happen
        return
    }

    const chatMember = await ctx.client.getChatMember({
        chatId: env.VERIFY_CHAT_ID,
        userId: ctx.sender.id,
    })

    if (!chatMember || !chatMember.isMember) {
        await ctx.replyText('🚨 You are not a member of the verification chat')
        return
    }

    authStore.set(code, {
        ...state,
        user: ctx.sender,
    })

    await ctx.replyText('🎉 Success! You can now return to the webpage.')
})
