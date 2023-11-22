import mongoose, { Schema } from "mongoose"

interface IMessage {
    _id: Schema.Types.ObjectId,
    sender: Schema.Types.ObjectId,
    receiver: Schema.Types.ObjectId,
    content: any,
    time: Schema.Types.Date
}
const messageSchema: Schema<IMessage> = new Schema<IMessage>({
    _id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    time: {
        type: Schema.Types.Date
    },
    content: {
        type: Schema.Types.Mixed,
        required: true
    }
})

const Message = mongoose.model('Message', messageSchema)
export { IMessage, Message, messageSchema }