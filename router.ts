import express from 'express'
import { Request, Response } from 'express';
import { registerUser } from './API/user';
const router = express.Router();

router.get('/', (req, res) => {
    res.send('connect to express server');
})

// handle the user register
router.post('/register', async (req: Request, res: Response) => {
    const body = req.body;
    await registerUser(body, res);
})

export { router };