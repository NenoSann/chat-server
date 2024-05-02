import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { receiveMessage } from "./Event/receive";
import { ServerResponse } from "./lib/ResponseClass";
import { toggleUserOnline } from "../API/user";
import { appendMessage } from "../API/message";
import { MessageContent } from "../API/interface/socket";

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
    private_message: (d: { content: MessageContent, from: string, senderid: string, receiverid: string, receivername: string, receiveravatar: string, sendername: string, senderavatar: string, ObjectId: string }) => void,
    user_disconnect: (key: string) => void;

    // group events:
    user_join_group: (d: { userId: string, userName: string, userAvatar: string }) => void;
    user_group_message: (d: { content: MessageContent, from: string, senderid: string, sendername: string, senderavatar: string }) => void;
}

interface ClientToServerEvents {
    hello: (d: string) => void;
    message: (d: string, Response: ServerResponse) => void;
    private_message: (d: { content: MessageContent, to: string, senderid: string, receiverid: string, receivername: string, receiveravatar: string, sendername: string, senderavatar: string }, callback: Function) => void;
    join_group: (d: { groupIds: Array<string>, userId: string, userName: string, userAvatar: string }) => void;
    group_message: (d: { content: MessageContent, to: string, senderid: string, sendername: string, senderavatar: string }, callback: Function) => void;
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
            },
            maxHttpBufferSize: 1e8
        });
    //use middle ware
    io.use((socket, next) => {
        const username = socket.handshake.auth.username;
        if (!username) {
        } else {
            // add username property for socket
            (socket as any).username = username;
            next();
        }
    })
    // event listeners here, import events only
    io.on('connection', (Socket) => {
        // get conected user info
        const auth = Socket.handshake.auth;
        const userInfo = {
            avatar: auth['avatar'] as string,
            username: auth['username'] as string,
            socketid: Socket.id,
            userid: auth['_id'] as string,
        }
        console.log('user connect', userInfo);
        // send all active user to Socket
        userMap.set(auth['_id'] as string,
            userInfo);
        Socket.emit('users', JSON.stringify(Array.from(userMap)));
        // tell rest sockets new user connected
        Socket.broadcast.emit('user_connected', {
            userid: auth['_id'] as string,
            userInfo
        })
        // set connected user's online state to true
        toggleUserOnline(userInfo.userid, true);
        // handle the private message and redirect it to right recipient
        Socket.on('private_message', async (data, callback: Function) => {
            const { content, to, senderid, senderavatar, sendername, receiverid, receiveravatar, receivername } = data;
            console.log('got private message: ', { to, senderid, sendername, receiverid, receivername });
            let ObjectId: string = '';
            try {
                // not using await cause overload is massive
                ObjectId = await appendMessage(senderid, receiverid, content);
                console.log('message ObjectId:', ObjectId);
                callback(ObjectId);
            } catch (error) {
                console.log(error);
            }
            Object.defineProperty(content, 'ObjectId', {
                value: ObjectId,
                writable: true
            });
            Socket.to(to).emit('private_message', {
                content,
                from: Socket.id,
                senderid,
                sendername,
                senderavatar,
                receiverid,
                receiveravatar,
                receivername,
                ObjectId
            })
        })

        // connect the user socket to al group ids, and emit a event to all users
        // in target group
        Socket.on('join_group', (data) => {
            const { groupIds, userId, userName, userAvatar } = data;
            console.log('got join group emit');
            Socket.join(groupIds);
            Socket.broadcast.to(groupIds).emit('user_join_group', { userId, userName, userAvatar });
        })

        Socket.on('group_message', (data, callback) => {
            const { content, to, senderid, sendername, senderavatar } = data;
            console.log('got group message: \n', data);
            Socket.broadcast.to(to).emit('user_group_message', { content, from: to, senderid, senderavatar, sendername });
            callback(true);
        })

        Socket.on('message', (data) => {
            receiveMessage(Socket, data);
        })


        Socket.on('disconnect', () => {
            const userid = Socket.handshake.auth['_id'] as string;
            userMap.delete(userid)
            Socket.broadcast.emit('user_disconnect', userid);
            toggleUserOnline(userid, false);
        })
    });
    return io;
}

export { createSocket }
