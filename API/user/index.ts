import { ObjectId } from "mongoose";
import { User, IUser, IFriend } from "../../mongodb/user";
import { Group, GroupResponse } from "../../mongodb/group";
import bcrypt from 'bcrypt'
import { ItemsResponse, UserResponse } from "../interface/response";

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

/**
 * Retrieves a user based on the provided email and password.
 *
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 */
const getUser = async function (email: string, password: string): Promise<UserResponse> {
    return new Promise<UserResponse>(async (resolve, reject) => {
        try {
            console.log(email, password)
            const user = await User.findOne({ email: email },
                { name: 1, email: 1, avatar: 1, groups: 1, friends: 1, online: 1, _id: 1, password: 1 }
            ).lean().exec();
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
                const friends = await queryFriendInfo(user.friends);
                const groups = await queryGroups(user.groups) as Array<GroupResponse>;
                const { password, ...updatedUser } = user; // remove the password from user
                const response: UserResponse = {
                    data: {
                        ...updatedUser,
                        friends,
                        groups
                    },
                    status: 'success',
                    message: 'successfully get user'
                }
                resolve(response);
            }
        } catch (error) {
            const dbError = new Error('Something wrong with MongoDB');
            (dbError as any).statusCode = 500; // Custom property indicating the status code
            reject(dbError);
        }
    })
}

/**
 * Adds a friend for a given user.
 *
 * @param {string | ObjectId} userId - The ID of the user.
 * @param {string | ObjectId} targetUserId - The ID of the target user to add as a friend.
 */
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
/**
 * Deletes a friend for a given user.
 *
 * @param {string | ObjectId} userid - The ID of the user.
 * @param {string | ObjectId} targetUserId - The ID of the target user to delete as a friend.
 * @returns {Promise<Boolean>} - A promise that resolves to a boolean indicating the success of deleting the friend.
 */
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

/**
 * Queries a user's friends based on the provided parameters.
 *
 * @param {string} href - The href parameter for pagination.
 * @param {string} userid - The ID of the user.
 * @param {number} [offset=0] - The offset parameter for pagination.
 * @param {number} [limit=10] - The limit parameter for pagination.
 */
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



async function queryFriendInfo(userIds: Array<string | ObjectId>): Promise<Array<IFriend>> {
    try {
        const result = new Array<IFriend>();
        for (const id of userIds) {
            const targetUser = await User.findById(id).lean().exec();
            if (targetUser === null) {
                throw new Error(`cannot find user ${id} in queryUserInfo.`)
            }
            result.push({
                name: targetUser.name,
                userid: targetUser._id,
                avatar: targetUser.avatar as string,
                online: targetUser.online as unknown as boolean
            })
        }
        return result;
    } catch (error) {
        throw error;
    }
}

async function joinGroup(groupId: string | ObjectId, userId: string | ObjectId) {
    return new Promise<void | Error>(async (resolve, reject) => {
        try {
            const user = await User.findById(userId);
            const group = await Group.findById(groupId);
            if (user && group) {
                user.groups.push(groupId as ObjectId);
                group.members.push(userId as ObjectId)
                user.save();
                group.save();
                resolve();
            }

        } catch (error) {
            reject(error);
        }
    })
}

async function quitGroup(groupId: string | ObjectId, userId: string | ObjectId) {
    return new Promise<void | Error>(async (resolve, reject) => {
        try {
            const user = await User.findById(userId);
            const group = await Group.findById(groupId);
            if (user && group) {
                const userIndex = group.members.indexOf(userId as ObjectId);
                const groupIndex = user.groups.indexOf(groupId as ObjectId);
                if (userIndex !== -1 && groupIndex !== -1) {
                    user.groups.splice(groupIndex, 1);
                    group.members.splice(userIndex, 1);
                    await user.save();
                    await group.save();
                }
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Queries groups based on the provided group IDs.
 *
 * @param {Array<string> | Array<ObjectId>} groupIds - An array of group IDs to query.
 * @returns {Promise<Array<{ _id: string | ObjectId, groupName: string, groupAvatar: string }> | Error>} - A promise that resolves to an array of group objects or rejects with an error.
 */
async function queryGroups(groupIds: Array<string> | Array<ObjectId>): Promise<Array<{ _id: string | ObjectId; groupName: string; groupAvatar: string; }> | Error> {
    return new Promise<Array<{
        _id: string | ObjectId, groupName: string, groupAvatar: string
    }> | Error>(async (resolve, reject) => {
        try {
            const res = [];
            for (const id of groupIds) {
                const group = await Group.findById(id).lean().exec();
                if (group) {
                    const { _id, groupAvatar, groupName } = group;
                    res.push({
                        _id: (_id as unknown as ObjectId),
                        groupAvatar: (groupAvatar as string),
                        groupName: (groupName as string)
                    })
                }
            }
            resolve(res);
        } catch (error) {
            reject(error);
        }
    })
}

export async function toggleUserOnline(userId: string | ObjectId, state: boolean) {
    return new Promise<boolean>(async (resolve, reject) => {
        try {
            const user = await User.findById(userId);
            if (user) {
                user.online = state;
                await user.save();
                resolve(true);
            }
        } catch (error) {
            reject(error);
        }
    })
}

export async function queryUser(userId: string | ObjectId, field: string) {
    return new Promise<IUser>(async (resolve, reject) => {
        try {
            const res = await User.findById(userId).select(field).lean().exec();
            if (res !== null) {
                resolve(res as unknown as IUser);
            }
        } catch (error) {
            reject(error);
        }
    })
}

export { registerUser, getUser, addFriends, deleteFriends, queryFriends, joinGroup, quitGroup }