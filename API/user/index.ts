import { Response } from "express";
import { User } from "../../mongodb/user";

const registerUser = async function (userInfo: {
    name: string,
    password: string,
    email: string
}, res: Response) {

}

export { registerUser }