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
    users: (d: string) => void;
    user_connected: (d: {
        userid: string,
        username: string,
        avatar: string
    }) => void;
    private_message: (d: { content: string, from: string }) => void
}

interface ClientToServerEvents {
    hello: (d: string) => void;
    message: (d: string, Response: ServerResponse) => void;
    private_message: (d: { content: string, to: string }) => void
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    userid: string,
    avatar: string,
    username: string,
}

const userMap = new Map<string, {
    avatar: string,
    username: string
}>();

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
            cors: {
                origin: '*',
            }
        });
    //use middle ware
    io.use((socket, next) => {
        const username = socket.handshake.auth.username;
        if (!username) {
            throw new Error('invalid username');
        }
        // add username property for socket
        (socket as any).username = username;
        next();
    })
    // event listeners here, import events only
    io.on('connection', (Socket) => {
        // send all active user to Socket
        userMap.set(Socket.data.userid,
            {
                avatar: Socket.data.avatar,
                username: Socket.data.username
            });
        Socket.emit('users', JSON.stringify(Array.from(userMap)));

        // tell rest sockets new user connected
        Socket.broadcast.emit('user_connected', {
            userid: Socket.data.userid,
            avatar: Socket.data.avatar,
            username: Socket.data.username
        })

        // handle the private message and redirect it to right recipient
        Socket.on('private_message', (data: { content: string, to: string }) => {
            const { content, to } = data;
            Socket.to(to).emit('private_message', {
                content,
                from: Socket.id
            })
        })

        Socket.on('message', (data) => {
            receiveMessage(Socket, data);
        })
    });
    return io;
}

export { createSocket }