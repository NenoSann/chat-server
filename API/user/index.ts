import { User, IUser } from "../../mongodb/user";

/**
 * @NenoSann
 * @description using provided args to create user, return created user if success, throw error if 
 * something mess up.
 * @returns Promise contain created user or error
 */
const registerUser = function (name: string, email: string, password: string): Promise<IUser | Error> {
    return new Promise<IUser>((resolve, reject) => {
        if (name && email && password) {
            const user = new User({
                name,
                email,
                password
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

export { registerUser }