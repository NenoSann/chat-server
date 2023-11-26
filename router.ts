import express from 'express'
import { Request, Response } from 'express';
import { registerUser, getUser } from './API/user';
import { IUser } from './mongodb/user';
const router = express.Router();

router.get('/', (req, res) => {
    res.send('connect to express server');
})

// handle the user register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, password, email } = req.body;
        const user = await registerUser(name, email, password);
        res.status(200).json({
            status: 'success',
            user: user,
            message: 'User registration successfully'
        })
    } catch (error) {
        console.error('Error registering user: ', error);
        res.status(500).json({
            status: 'fail',
            reason: 'An error occurred during user registration'
        })
    }
})

router.post('/login', async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const { email, password } = req.body;
        const user = await getUser(email, password);
        res.status(200).json({
            staus: 'success',
            user,
            message: 'User get successfully'
        })
    } catch (error: any) {
        res.status((error as any).statusCode).json({
            status: 'fail',
            reason: (error as any).message,
        })
    }
})

export { router };