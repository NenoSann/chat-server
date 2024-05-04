import { ObjectId, Schema } from "mongoose"
import { IFriend, IUser } from "../../mongodb/user"
import { GroupResponse } from "../../mongodb/group"

interface BaseResponse {
    status: 'success' | 'client_fail' | 'server_fail',
    message?: string
}
interface ResponseWithOffset extends BaseResponse {
    href?: string | URL
    offset: number,
    limit: number,
    previous?: string | URL | null,
    next?: string | URL | null,
    total: number,
}

interface UserResponse extends BaseResponse {
    data: {
        name: string,
        email: string,
        _id: string | ObjectId,
        avatar?: string,
        groups: Array<GroupResponse>,
        friends: Array<IFriend>,
        online: boolean | Schema.Types.Boolean
    }
}


interface FriendsResponse extends BaseResponse {
    id: string, // the id of user being requested
    items: IFriend[], // over all items
    total: number,
}

export interface MessagesResponse extends ResponseWithOffset {
    data: {
        type: 'from' | 'to' | string
        sendBy: string | ObjectId,
        sendTo: string | ObjectId,
        text: string,
        image?: string[],
        date: number | string,
    }[],
    info: {
        id: string,
        avatar: string,
        name: string
    }
}

interface ItemsResponse<ObjectType> extends ResponseWithOffset {
    items: ObjectType[]
}

export { UserResponse, ItemsResponse, ResponseWithOffset, FriendsResponse, BaseResponse }