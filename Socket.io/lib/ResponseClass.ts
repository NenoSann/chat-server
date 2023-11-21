enum Status {
    Scueesss = 'Success',
    ClientFail = 'ClientFail',
    ServerFail = 'ServerFail'
}

class ServerResponse {
    status: Status = Status.Scueesss;
    message: String;
    constructor(message: string, status?: Status) {
        this.message = message;
        status ? this.status = status : undefined;
    }
}

export { ServerResponse }