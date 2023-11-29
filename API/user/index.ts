import { User, IUser } from "../../mongodb/user";
import bcrypt from 'bcrypt'

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
export { registerUser, getUser }