import { Socket } from "socket.io";
import { ServerResponse } from "../lib/ResponseClass";

const onConnection = function (socket: Socket) {
    console.log('Socket connected!');
    socket.send('Socket connected')
    socket.send(new ServerResponse('Connection Establised'));
}

export { onConnection }