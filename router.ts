import express from 'express'
import { Request, Response } from 'express';
import { registerUser, getUser } from './API/user';
import { createGroup } from './API/group';
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

router.post('/test/:count', async (req, res) => {
    try {
        const count = parseInt(req.params.count);
        console.log(count);
        for (let i = count; i < count + 10; i++) {
            const user = await registerUser(`NenoSan${i}`, `NenoSan${i}@gmail.com`, '2440060505');
            console.log(user);
        }
        res.status(200).send('成功获取参数');
    } catch (error) {
        // 错误处理
        res.status(500).send('服务器错误');
    }
});

router.post('/createGroup', async (req: Request, res: Response) => {
    try {
        const { groupName, founderId } = req.body;
        if (groupName && founderId) {
            const group = await createGroup(groupName, founderId);
            res.status(200).send({
                status: 'suceess',
                message: 'create group success',
                data: group
            })
        }
    } catch (error) {
        res.status(500).send({
            status: 'fail',
            message: 'create group fail'
        })
    }
})
export { router };