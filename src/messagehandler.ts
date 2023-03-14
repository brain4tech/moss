import {ElysiaWS} from "@elysiajs/websocket"
import {MessageSchema} from "./definitions"
import {Env} from "./utils"

export {MessageHandler}

class MessageHandler {

    private smartphoneConnections: Map<string, ElysiaWS>
    private masterConnection: ElysiaWS | null
    private masterConnectionId: string | null
    private masterConnectionSDP: object | null

    constructor() {
        this.smartphoneConnections = new Map<string, ElysiaWS>()
        this.masterConnection = null
        this.masterConnectionId = null
        this.masterConnectionSDP = null

        Env.reevaluate()
    }

    handleMessage(ws: ElysiaWS, id: string, message: MessageSchema): void {
        console.log(`${id}:`, message)

        switch (message.type) {
            case 'ping':
                ws.send(this.response("pong"))
                break
            case 'login':
                this.smartphoneConnections.set(id, ws)
                if (!this.masterConnection || !this.masterConnectionId || !this.masterConnectionSDP) return

                // send connection offer with sdp from server
                ws.send(this.response(Env.connectionOfferType, this.masterConnectionSDP))
                break
            case 'set-master':
                // payload includes 'spd' and 'secret'
                if (!message.payload['sdp'] || !message.payload['secret']) return
                if (Env.connectionSecret !== message.payload.secret) return
                
                // prevent same endpoint to set master multiple times
                if (id === this.masterConnectionId) return

                this.masterConnection = ws
                this.masterConnectionId = id
                this.masterConnectionSDP = message.payload.sdp

                // notify all connections of new master sdp
                this.smartphoneConnections.forEach((ws, id) => {
                    ws.send(this.response(Env.connectionOfferType, this.masterConnectionSDP))
                })

                // confirm new master
                this.masterConnection.send(this.response('master-confirmation'))
                break
            default:
                if (!this.masterConnection || !this.masterConnectionId || !this.masterConnectionSDP) return

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

    handleDisconnect(id: string): void {
        const validConnection = this.smartphoneConnections.delete(id)
        if (validConnection) console.log(`${id} disconnected.`)
    }

    response(type: string, payload: any = "", id?: string): MessageSchema {

        let returnObject: MessageSchema = {
            type: type,
            payload: payload
        }

        if (id) returnObject.id = id

        return returnObject
    }

}
