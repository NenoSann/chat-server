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
        userInfo: {
            username: string,
            avatar: string,
            socketid: string,
            userid: string
        }
    }) => void;
    private_message: (d: { content: string, from: string, senderid: string, sendername: string, senderavatar: string }) => void,
    user_disconnect: (key: string) => void
}

interface ClientToServerEvents {
    hello: (d: string) => void;
    message: (d: string, Response: ServerResponse) => void;
    private_message: (d: { content: string, to: string, senderid: string, sendername: string, senderavatar: string }) => void
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
    username: string,
    socketid: string,
    userid: string
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
            console.log('invalid username');
        } else {
            // add username property for socket
            (socket as any).username = username;
            next();
        }
    })
    // event listeners here, import events only
    io.on('connection', (Socket) => {
        // get conected user info
        const userInfo = {
            avatar: Socket.handshake.headers['x-avatar'] as string,
            username: Socket.handshake.headers['x-username'] as string,
            socketid: Socket.id,
            userid: Socket.handshake.headers['x-id'] as string,
        }
        console.log('user connect', userInfo);
        // send all active user to Socket
        userMap.set(Socket.handshake.headers['x-id'] as string,
            userInfo);
        Socket.emit('users', JSON.stringify(Array.from(userMap)));
        // tell rest sockets new user connected
        Socket.broadcast.emit('user_connected', {
            userid: Socket.handshake.headers['x-id'] as string,
            userInfo
        })
        // handle the private message and redirect it to right recipient
        Socket.on('private_message', (data: { content: string, to: string, senderid: string, sendername: string, senderavatar: string }) => {
            const { content, to, senderid, senderavatar, sendername } = data;
            console.log('get private message', { content, to });
            Socket.to(to).emit('private_message', {
                content,
                from: Socket.id,
                senderid,
                sendername,
                senderavatar,
            })
        })

        Socket.on('message', (data) => {
            receiveMessage(Socket, data);
        })

        Socket.on('disconnect', () => {
            console.log('socket disconnect');
            const userid = Socket.handshake.headers['x-id'] as string;
            userMap.delete(userid)
            Socket.broadcast.emit('user_disconnect', userid);
        })
    });
    return io;
}

export { createSocket }