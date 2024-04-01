import mongoose, { ObjectId, Schema } from "mongoose";

interface MessageContent {
    text: string;
    image?: string[];
}

interface IGroupMessage {
    sender: string | ObjectId;
    content: MessageContent;
    date: Date;
    groupId: string | ObjectId;
}

const groupMessageSchema: Schema<IGroupMessage> = new Schema<IGroupMessage>({
    sender: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    content: {
        type: {
            text: {
                type: String,
                required: true,
            },
            image: {
                type: [String],
                default: [],
            },
        },
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    groupId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
});

const groupMessage = mongoose.model<IGroupMessage>("GroupMessage", groupMessageSchema);

export { groupMessage };