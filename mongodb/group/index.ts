import mongoose, { Schema } from "mongoose"
import { IUser, userSchema } from "../user"

interface IGroup {
    groupName: string,
    members: IUser[],
}

const groupSchema: Schema<IGroup> = new Schema<IGroup>({
    groupName: {
        type: String,
        required: true
    },
    members: {
        type: [userSchema],
        default: []
    },
})

const Group = mongoose.model<IGroup>('Group', groupSchema);

export { IGroup, Group, groupSchema }