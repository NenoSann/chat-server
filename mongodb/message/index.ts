import mongoose, { Schema } from "mongoose"

interface IMessage {
    _id: Schema.Types.ObjectId,
    sender: Schema.Types.ObjectId,
    receiver: Schema.Types.ObjectId,
    content: any,
    time: Schema.Types.Date,
    image: Schema.Types.String
}
const messageSchema: Schema<IMessage> = new Schema<IMessage>({
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
        type: Schema.Types.Date,
        default: Date.now()
    },
    content: {
        type: Schema.Types.Mixed,
        required: true
    },
    image: {
        type: [Schema.Types.String]
    }
})

const Message = mongoose.model('Message', messageSchema)
export { IMessage, Message, messageSchema }