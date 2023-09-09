import { Elysia, ws, t } from 'elysia'
import {MessageHandler} from './messagehandler'
import {Env} from './utils'

/**
 * Instantiate message handler class.
 */
const messageHandler = new MessageHandler()

/**
 * Define app behaviour.
 */
const app: Elysia = new Elysia()
    .use(ws())
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
            messageHandler.handleMessage(ws, String(ws.data.id), message)
        },

        close(ws) {
            messageHandler.handleDisconnect(String(ws.data.id))
        }
    })

/**
 * Start the application.
 */
app.listen({
    hostname: Env.getHostname(),
    port: Env.getPort()
})
console.log(`🟢 moss running on ${app.server?.hostname}:${app.server?.port}`)
