interface ResponseWithOffset {
    href?: string | URL
    offset: number,
    limit: number,
    previous?: string | URL | null,
    next?: string | URL | null,
    total: number,
}

interface ItemsResponse<ObjectType> extends ResponseWithOffset {
    items: ObjectType[]
}

export { ItemsResponse, ResponseWithOffset }