/**
 * This file handles all CRUD about Group document
 */
import { Group, IGroup } from "../../mongodb/group";
import { User } from "../../mongodb/user";

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
export { createGroup }