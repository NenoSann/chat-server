import { ObjectId } from "mongoose";
import { Message, IMessage } from "../../mongodb/message";
import { User } from "../../mongodb/user";
import { ItemsResponse } from "../interface/response";

const appendMessage = async function (senderid: string | ObjectId,
    receiverId: string | ObjectId,
    content: string,
    image?: string[]
) {
    console.log(senderid, receiverId, content);
    return new Promise<Boolean>(async (resolve, reject) => {
        try {
            const sender = await User.findById(senderid);
            const receiver = await User.findById(receiverId);
            if (sender !== null && receiver !== null) {
                const newMessage = new Message({
                    sender: senderid,
                    receiver: receiverId,
                    time: Date.now(),
                    content,
                    image
                });
                await newMessage.save();
                // check if has chat before
                if (!sender.chats.has(receiverId as string)) {
                    sender.chats.set(receiverId as string, []);
                }
                if (!receiver.chats.has(senderid as string)) {
                    receiver.chats.set(senderid as string, []);
                }
                sender.chats.get(receiverId)?.unshift(newMessage.id);
                receiver.chats.get(senderid)?.unshift(newMessage.id);
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
                        ...response,
                        items: messages,
                        previous: null
                    })
                } else {
                    const startIndex = (offset - 1) * limit;
                    const endIndex = startIndex + limit;
                    const slicedMessages = messages.slice(startIndex, endIndex);
                    resolve({
                        ...response,
                        items: slicedMessages
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