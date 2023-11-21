import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { receiveMessage } from "./Event/receive";
import { ServerResponse } from "./lib/ResponseClass";

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    hello: (d: string, callback: (e: string) => void) => void;
    message: (d: string, Response: ServerResponse, callback: (e: string) => void) => void;
}

interface ClientToServerEvents {
    hello: (d: string) => void;
    message: (d: string, Response: ServerResponse) => void;
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    name: string;
    age: number;
}

/**
 * @description passin HttpServer, return the socket server
 * @param HttpServer 
 * @returns {Server}
 */
const createSocket = function (HttpServer: HttpServer): Server {
    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData>(HttpServer, {
        });
    // event listeners here, import events only
    io.on('connection', (Socket) => {
        Socket.on('hello', (d) => {
            console.log(`hello message ${d}`);
        })
        Socket.on('message', (data) => {
            receiveMessage(Socket, data);
        })
    });
    return io;
}

export { createSocket }