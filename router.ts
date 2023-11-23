import express from 'express'
import { Request, Response } from 'express';
import { registerUser } from './API/user';
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
            message: 'User registration successful'
        })
    } catch (error) {
        console.error('Error registering user: ', error);
        res.status(500).json({
            status: 'fail',
            reason: 'An error occurred during user registration'
        })
    }
})

export { router };