export type PrivateMessage = {
    content: MessageContent,
    receiverid: string,
    senderid: string,
    sendername: string,
    senderavatar: string
}

export type MessageContent = {
    text: string,
    image?: Array<string>
}