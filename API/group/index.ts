/**
 * This file handles all CRUD about Group document
 */
import { ObjectId } from "mongoose";
import { Group, IGroup } from "../../mongodb/group";
import { User } from "../../mongodb/user";
import { userInfo } from "os";

/**
 * @description create a group that only caontains the founder
 * @param {string} groupName
 * @param {string} founderId
 * 
 */
const createGroup = async function (groupName: string, founderId: string) {
    return new Promise<IGroup>(async (resolve, reject) => {
        try {
            const founder = await User.findById(founderId);
            if (founder !== null) {
                const newGroup = new Group({
                    groupName,
                    members: [founder.id]
                });
                await newGroup.save();
                founder.groups.push(newGroup.id);
                await founder.save();
                resolve(newGroup);
            }
        } catch (error) {
            console.error(error);
            reject(error);
        }
    })
}

const addUserToGroup = async function (groupId: string | ObjectId, userid: string | ObjectId) {
    return new Promise<IGroup>(async (resolve, reject) => {
        try {
            const group = await Group.findById(groupId);
            if (group !== null && await User.findById(userid) !== null) {
                group.members.push(userid as ObjectId);
                await group.save();
                resolve(group);
            } else {
                reject({
                    status: 'fail',
                    message: 'gourp not exist or userid not exist'
                })
            }
        } catch (error) {
            reject({
                status: 'fail',
                message: 'fail to join group'
            })
        }
    })
}


export { createGroup, addUserToGroup }