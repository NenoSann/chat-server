import mongoose, { FlattenMaps, ObjectId, Schema } from "mongoose";
import { IGroup, groupSchema } from "../group";
import { IMessage, messageSchema } from "../message";
import { error } from "console";

interface IUser {
    name: string,
    password: string,
    email: string,
    _id?: Schema.Types.ObjectId | ObjectId | string,
    avatar?: string,
    groups: Schema.Types.ObjectId[],
    friends: Schema.Types.ObjectId[],
    chats: Map<string | ObjectId, IMessage[]>,
    unreadChats: Map<string | ObjectId, string[] | ObjectId[]>,
    online: Schema.Types.Boolean | boolean
}

interface IFriend {
    name: string,
    userid: string | ObjectId,
    avatar: string,
    online: boolean | Boolean | Schema.Types.Boolean
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
        type: [Schema.Types.ObjectId],
        ref: 'Group',
        default: [],
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    chats: {
        type: Map,
        of: [Schema.Types.ObjectId],
        ref: 'Message',
        default: new Map<string | ObjectId, IMessage[]>()
    },
    // newly added filed
    unreadChats: {
        type: Map,
        of: [Schema.Types.ObjectId],
        ref: 'Message',
        default: new Map<string | ObjectId, string[] | ObjectId[]>()
    },
    online: {
        type: Schema.Types.Boolean,
        default: false
    }
})

const User = mongoose.model('User', userSchema);

userSchema.methods.getAllMessagesWithUser = function getAllMessagesWithUser(otherUserID: string) {
    const map: Map<string, IMessage> = this.chats;
    return map.get(otherUserID);
}


export { User, userSchema, IUser, IFriend }