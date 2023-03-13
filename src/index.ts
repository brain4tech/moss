import Elysia, {t} from 'elysia'
import {websocket} from '@elysiajs/websocket'
import {MessageHandler} from './messagehandler'

const messageHandler = new MessageHandler()

const app = new Elysia()
    .use(websocket())
    .ws('/', {

        schema: {
            // validate incoming message
            body: t.Object({
                type: t.String(),
                payload: t.Any(),
                id: t.Optional(t.String())
            }),

            response: t.Object({
                type: t.String(),
                payload: t.Any(),
                id: t.Optional(t.String())
            })
        },

        message(ws, message) {
            messageHandler.handleMessage(ws, ws.data.id, message)
        },

        close(ws) {
            messageHandler.handleDisconnect(ws.data.id)
        }
    })

app.listen(3000)
console.log(`🟢 moss running on ${app.server?.hostname}:${app.server?.port}`)
