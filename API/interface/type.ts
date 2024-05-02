export type MessageListItem = {
    type: MessageType,
    info: User,
    content: MessageContent,
    date: number
}

export enum MessageType {
    Private = 'Private',
    Group = 'Group'
}

export type User = {
    id: string,
    name: string,
    avatar: string
}

export type MessageContent = {
    id: string,
    type: 'from' | 'to'
    sendBy: string,
    sendTo: string,
    text: string,
    image?: Array<string>,
    date?: number
}