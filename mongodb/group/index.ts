import mongoose, { Schema } from "mongoose"
import { IUser, userSchema } from "../user"

interface IGroup {
    groupName: string,
    members: Schema.Types.ObjectId[],
}

const groupSchema: Schema<IGroup> = new Schema<IGroup>({
    groupName: {
        type: String,
        required: true
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
})

const Group = mongoose.model<IGroup>('Group', groupSchema);

export { IGroup, Group, groupSchema }