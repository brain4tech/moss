import {MessageSchema} from "./definitions"
import {Env} from "./utils"
import {Context} from "elysia";
import {randomUUID} from "crypto";
import {ServerWebSocket} from "bun";

export {MessageHandler}

/**
 * Class to handle incoming websocket messages.
 */
class MessageHandler {

    /**
     * Mapping of connection ids to their corresponding websocket instances.
     */
    private smartphoneConnections: Map<string, ServerWebSocket>

    /**
     * Reference to master websocket instance.
     */
    private masterConnection: ServerWebSocket | null

    /**
     * If of master connection.
     */
    private masterConnectionId: string | null

    /**
     * Instantiates class.
     */
    constructor() {
        this.smartphoneConnections = new Map<string, ServerWebSocket>()
        this.masterConnection = null
        this.masterConnectionId = null

        Env.reevaluate()
    }

    /**
     * Handle an incoming message.
     * @param ws Websocket instance.
     * @param id Connection identifier.
     * @param message Send message by client.
     * @returns void
     */
    handleMessage(ws: ServerWebSocket<{ id: string; data: Context }>, message: MessageSchema): void {

        // give websocket custom id because the native stuff doesn't work SHIT
        ws.data.id = randomUUID()
        const id: string = ws.data.id

        console.log(`${id}:`, message)

        switch (message.type) {
            case 'moss-ping':
                ws.send(this.response("moss-pong", `Hello <${id}>, I'm moss.`))
                break

            case 'moss-login':
                this.smartphoneConnections.set(id, ws)
                if (!this.masterConnection || !this.masterConnectionId) return
                if (id === this.masterConnectionId) return

                // send connection offer with sdp from server
                ws.send(this.response(Env.connectionStartType))
                break

            case 'moss-set-master':
                if (Env.connectionSecret !== message.payload['secret']) return

                // prevent same endpoint to set master multiple times
                if (id === this.masterConnectionId) return

                this.masterConnection = ws
                this.masterConnectionId = id

                // notify all connections of new master sdp
                this.smartphoneConnections.forEach((ws) => {
                    ws.send(this.response(Env.connectionStartType))
                })

                // confirm new master
                this.masterConnection.send(this.response('moss-master-confirmation'))
                break
            
            default:
                if (!this.masterConnection || !this.masterConnectionId) return

                if (id === this.masterConnectionId) {

                    const receiverId = message.id
                    if (!receiverId) return

                    const receiverConnection = this.smartphoneConnections.get(receiverId)
                    if (!receiverConnection) return

                    receiverConnection.send(this.response(message.type, message.payload))
                    return
                }

                if (!this.smartphoneConnections.has(id)) return

                this.masterConnection.send(this.response(message.type, message.payload, id))
                break
        }

        return
    }

    /**
     * Handle a client disconnection.
     * @param ws Websocket instance.
     */
    handleDisconnect(ws: ServerWebSocket<{ id: string; data: Context }>): void {

        const id = ws.data.id

        if (id === this.masterConnectionId) {
            this.masterConnection = null
            this.masterConnectionId = null
            console.log("master connection closed.")
        }

        const validConnection = this.smartphoneConnections.delete(id)
        if (validConnection) console.log(`${id} disconnected.`)
    }

    /**
     * Generate a response object.
     * @param type Packet type.
     * @param payload Packet payload.
     * @param id Sender or recipient identifier.
     * @returns Object of type MessageSchema.
     */
    private response(type: string, payload: any = "", id?: string): MessageSchema {

        let returnObject: MessageSchema = {
            type: type,
            payload: payload
        }

        if (id) returnObject.id = id

        return returnObject
    }
}
