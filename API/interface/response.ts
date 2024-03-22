import { IFriend, IUser } from "../../mongodb/user"

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


interface FriendsResponse extends BaseResponse {
    id: string, // the id of user being requested
    items: IFriend[], // over all items
    total: number,
}

interface ItemsResponse<ObjectType> extends ResponseWithOffset {
    items: ObjectType[]
}

export { ItemsResponse, ResponseWithOffset, FriendsResponse, BaseResponse }