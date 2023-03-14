export {MessageSchema}

/**
 * General type expected to be received and send to clients.
 */
type MessageSchema = {
    type: string
    payload: object
    id?: string
}
