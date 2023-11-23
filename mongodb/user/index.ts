import mongoose, { Schema } from "mongoose";
import { IGroup, groupSchema } from "../group";
import { IMessage, messageSchema } from "../message";
import { error } from "console";

interface IUser {
    name: string,
    password: string,
    email: string,
    _id: Schema.Types.ObjectId,
    avatar?: string,
    groups: IGroup[],
    friends: IUser[],
    chats: Map<string, IMessage[]>
}

const userSchema: Schema<IUser> = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: 'default'
    },
    groups: {
        type: [groupSchema],
        default: []
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    chats: {
        type: Map,
        of: [messageSchema],
    }
})

const User = mongoose.model('User', userSchema);

userSchema.methods.getAllMessagesWithUser = function getAllMessagesWithUser(otherUserID: string) {
    const map: Map<string, IMessage> = this.chats;
    return map.get(otherUserID);
}


export { User, userSchema, IUser }