import Elysia, {t} from 'elysia'
import {websocket} from '@elysiajs/websocket'
import {MessageHandler} from './messagehandler'
import {Env} from './utils'

/**
 * Instantiate message handler class.
 */
const messageHandler = new MessageHandler()

/**
 * Define app behaviour.
 */
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


app.listen({
            hostname: Env.getHostname(),
            port: Env.getPort()
        })
console.log(`🟢 moss running on ${app.server?.hostname}:${app.server?.port}`)
