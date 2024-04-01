import mongoose, { Schema, Types } from "mongoose"
import { IUser, userSchema } from "../user"
const defaultAvatar = 'http://imagebucket-1322308688.cos.ap-tokyo.myqcloud.com/chat/group/test.png';
interface IGroup {
    groupName: string,
    members: Schema.Types.ObjectId[],
    founder: Schema.Types.ObjectId,
    groupAvatar: string | Schema.Types.String
}

const groupSchema: Schema<IGroup> = new Schema<IGroup>({
    groupName: {
        type: String,
        required: true
    },
    groupAvatar: {
        type: Schema.Types.String,
        default: defaultAvatar
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    founder: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Group = mongoose.model<IGroup>('Group', groupSchema);

export { IGroup, Group, groupSchema }