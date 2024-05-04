import mongoose, { Schema } from "mongoose"

interface IMessage {
    _id: Schema.Types.ObjectId | string,
    sender: Schema.Types.ObjectId | string,
    receiver: Schema.Types.ObjectId | string,
    content: any,
    time: Schema.Types.Date | number | Date,
    image: Schema.Types.String | string | string[]
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