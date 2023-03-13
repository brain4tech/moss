import { Elysia } from 'elysia'
import { websocket } from '@elysiajs/websocket'

const app = new Elysia()
    .use(websocket())
    .ws('/ws', {
        message(ws, message) {
            ws.send(message)
        }
    })
    .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
