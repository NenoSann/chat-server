import { ObjectId } from "mongoose";
import { Message, IMessage } from "../../mongodb/message";
import { User } from "../../mongodb/user";
import { ItemsResponse } from "../interface/response";
import { MessageContent } from "../interface/socket";

/**
 * Appends a message to the sender and receiver's chat history and performs related operations.
 *
 * @param {string|ObjectId} senderId - The ID of the sender.
 * @param {string|ObjectId} receiverId - The ID of the receiver.
 * @param {MessageContent} content - The content of the message.
 * @param {string[]} [image] - Optional array of image URLs associated with the message.
 */
const appendMessage = async function (senderId: string | ObjectId,
    receiverId: string | ObjectId,
    content: MessageContent,
    image?: string[]
) {
    console.log(senderId, receiverId, content);
    return new Promise<Boolean>(async (resolve, reject) => {
        try {
            const sender = await User.findById(senderId);
            const receiver = await User.findById(receiverId);
            if (sender !== null && receiver !== null) {
                const newMessage = new Message({
                    sender: senderId,
                    receiver: receiverId,
                    time: Date.now(),
                    content,
                    image
                });
                await newMessage.save();
                // check if has chat before
                if (!sender.chats.has(receiverId as string)) {
                    sender.chats.set(receiverId as string, []);
                    sender.chats.get(receiverId)?.unshift(newMessage.id);
                }
                if (!receiver.chats.has(senderId as string)) {
                    receiver.chats.set(senderId as string, []);
                    receiver.chats.get(senderId)?.unshift(newMessage.id);
                }
                console.log('is sender and receiver online? ', sender.online, receiver.online);
                // if user is not oneline, then check the unread chats
                if (sender.online === false) {
                    console.log('sender is offline')
                    sender.unreadChats.has(receiverId) ? sender.unreadChats.set(receiverId, []) : undefined;
                    sender.unreadChats.get(receiverId)?.unshift(newMessage.id);
                }
                if (receiver.online === false) {
                    console.log('receiver is offline')
                    receiver.unreadChats.has(senderId) ? receiver.unreadChats.set(senderId, []) : undefined;
                    receiver.unreadChats.get(senderId)?.unshift(newMessage.id);
                }
                await receiver.save();
                await sender.save();
                resolve(true);
            }
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}

const queryMessage = async function (href: string | URL, userid: string | ObjectId,
    targetuserid: string | ObjectId,
    limit: number = 10,
    offset: number = 1,) {
    return new Promise<ItemsResponse<IMessage>>(async (resolve, reject) => {
        try {
            const user = await User.findById(userid);
            const targetUser = await User.findById(targetuserid);
            if (user !== null && targetUser !== null) {
                const messages = user.chats.get(targetuserid) || [];
                const total = user.chats.get(targetuserid)?.length || 0;
                const response = {
                    href,
                    offset,
                    limit,
                    total
                }
                if (limit >= total) {
                    // if item's total is lower than the limit
                    resolve({
                        status: 'success',
                        ...response,
                        items: messages,
                        previous: null,
                    })
                } else {
                    const startIndex = (offset - 1) * limit;
                    const endIndex = startIndex + limit;
                    const slicedMessages = messages.slice(startIndex, endIndex);
                    resolve({
                        ...response,
                        items: slicedMessages,
                        status: 'success'
                    })
                }
            }
        } catch (error) {
            reject({
                status: 'fail',
                message: 'fail at queryMessage'
            })
        }
    })
}


export { appendMessage, queryMessage }