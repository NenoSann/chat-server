import { ObjectId } from "mongoose";
import { User, IUser, IFriend } from "../../mongodb/user";

import bcrypt from 'bcrypt'
import { ItemsResponse } from "../interface/response";

/**
 * @NenoSann
 * @description using provided args to create user, return created user if success, throw error if 
 * something mess up.
 * @returns Promise contain created user or error
 */
const registerUser = function (name: string, email: string, password: string): Promise<IUser | Error> {
    return new Promise<IUser>(async (resolve, reject) => {
        if (name && email && password) {
            console.log(email, password)
            const hashedPassword = await bcrypt.hash(password, 8);
            console.log('hashedPassword: ', hashedPassword);
            const user = new User({
                name,
                email,
                password: hashedPassword
            });
            user.save()
                .then((savedUser) => resolve(savedUser))
                .catch((error) => {
                    console.log('Create user error');
                    console.error(error);
                    reject(error);
                });
        } else {
            reject(new Error('Invalid arguments in createUser'));
        }
    });
};

const getUser = async function (email: string, password: string): Promise<IUser> {
    return new Promise<IUser>(async (resolve, reject) => {
        try {
            console.log(email, password)
            const user = await User.findOne({ email: email }).exec();
            console.log(user);
            let passwordValid = false;
            if (user !== null) {
                passwordValid = await bcrypt.compare(password, user?.password as string);
            }
            if (user === null) {
                const error = new Error('User not found');
                (error as any).statusCode = 404;
                reject(error);
            } else if (!passwordValid) {
                const error = new Error('Wrong password');
                (error as any).statusCode = 401; // Custom property indicating the status code
                reject(error);
            } else {
                resolve(user as IUser);
            }
        } catch (error) {
            const dbError = new Error('Something wrong with MongoDB');
            (dbError as any).statusCode = 500; // Custom property indicating the status code
            reject(dbError);
        }
    })
}

const addFriends = async function (userId: string | ObjectId, targetUserId: string | ObjectId) {
    return new Promise<Boolean>(async (resolve, reject) => {
        try {
            const user = await User.findById(userId);
            if (user === null) {
                reject({
                    status: 'client_fail',
                    message: 'cannot find user'
                });
            }
            const targetUser = await User.findById(targetUserId);
            if (targetUser === null) {
                reject({
                    status: 'client_fail',
                    message: 'cannot find target user'
                });
            }
            if (!user!.friends.includes(targetUserId as ObjectId)) {
                user!.friends.push(targetUserId as ObjectId);
                await user!.save();
            } else {
                reject({
                    staus: 'client_fail',
                    message: 'targetuser is already your friend'
                })
            }
            // how to get the lean object of mongodb object?
            resolve(true);
        } catch (error) {
            reject({
                status: 'server_fail',
                message: 'fail at add friends'
            })
        }
    })
}

const deleteFriends = async function (userid: string | ObjectId, targetUserId: string | ObjectId): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve, reject) => {
        try {
            const user = await User.findById(userid);
            if (user === null) {
                reject({
                    status: 'fail',
                    message: 'cannot find the user'
                })
            } else if (user.friends.includes(targetUserId as ObjectId)) {
                // delete the targetuserid from user's friends list
                user.friends.splice(user.friends.indexOf(targetUserId as ObjectId), 1);
                await user.save();
                resolve(true);
            } else {
                reject({
                    status: 'fail',
                    message: 'targetUser not in user\'s friend list'
                })
            }
        } catch (error) {
            reject({
                status: 'fail',
                message: 'fail to deleteFriends'
            })
        }
    })
}


const queryFriends = async function (href: string, userid: string, offset: number = 0, limit: number = 10) {
    return new Promise<ItemsResponse<IFriend>>(async (resolve, reject) => {
        try {
            const url = new URL(href);
            const urlOffset = Number(url.searchParams.get('offset'));
            const user = await User.findById(userid).lean();
            const total = user?.friends.length as number;
            const friendIds = user?.friends.slice(offset * limit, (offset + 1) * limit);
            const friends: IFriend[] = [];
            if (friendIds !== undefined) {
                // query all the friends
                for (const userid of friendIds as Array<ObjectId>) {
                    const friend = await User.findById(userid).select('name avatar _id online').lean()
                    if (friend !== null) {
                        friends.push({
                            name: friend!.name,
                            avatar: friend!.avatar as string,
                            userid: friend!._id,
                            online: friend.online as unknown as boolean,
                        });
                    }
                }
            } else {
                throw new Error();
            }
            resolve({
                href,
                offset,
                limit,
                previous: urlOffset > 0 ? _createHref(url, 'prev') : undefined,
                next: (offset + 1) * limit < total ? _createHref(url, 'next') : undefined,
                total,
                status: 'success',
                items: friends,
            });
        } catch (error) {
            reject('fail to queryFriends');
        }
    });
};

function _createHref(href: URL, type: 'prev' | 'next'): string {
    const params = href.searchParams;
    const currentOffset = Number(params.get('offset'));
    if (type === 'prev') {
        params.set('offset', (currentOffset - 1).toString());
    } else if (type === 'next') {
        params.set('offset', (currentOffset + 1).toString());
    }
    return href.toString();
}

export { registerUser, getUser, addFriends, deleteFriends, queryFriends }