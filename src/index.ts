import {Context, Elysia, t} from 'elysia'
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
    .ws('/', {

        schema: {
            // validate incoming message
            body: t.Object({
                type: t.String(),
                payload: t.Any(),
                id: t.Optional(t.String())
            }),

            // validate outgoing message
            response: t.Object({
                type: t.String(),
                payload: t.Any(),
                id: t.Optional(t.String())
            })
        },

        message(ws, message) {
            messageHandler.handleMessage(ws, message)
        },

        close(ws) {
            messageHandler.handleDisconnect(ws)
        }
    })

/**
 * Start the application.
 */
app.listen({
    hostname: Env.getHostname(),
    port: Env.getPort(),

    /*
    tls: {
        key: Bun.file("./certificate/localhost.key"),
        cert: Bun.file("./certificate/localhost.crt"),
    }
    */
})
console.log(`🟢 moss running on ${app.server?.hostname}:${app.server?.port}`)
