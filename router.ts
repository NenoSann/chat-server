import express from 'express'
import { Request, Response } from 'express';
import { registerUser, getUser, addFriends, deleteFriends, quitGroup, joinGroup, queryFriends } from './API/user';
import { createGroup } from './API/group';
import { BaseResponse } from './API/interface/response';
import { queryUnreadChats } from './API/message';
import { ImageBucket, TempCredentialGenerator } from './API/ImageBucket';
import 'dotenv/config';
let base = "localhost:8081";
const router = express.Router();
let imageBucket: ImageBucket;
let tempCredentialGenerator: TempCredentialGenerator;
if (process.env['SecretKey'] && process.env['SecretId']) {
    imageBucket = new ImageBucket(process.env['SecretKey'], process.env['SecretId']);
    tempCredentialGenerator = new TempCredentialGenerator(process.env['SecretKey'], process.env['SecretId']);
} else {
    throw new Error('secretKey and secretId for cos not defined');
}
router.get('/', (_req, res) => {
    res.send('connect to express server');
})

// handle the user register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { username: name, pwd: password, email } = req.body;
        console.log({
            name, password, email
        })
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

router.post('/addFriend', async (req: Request, res: Response) => {
    try {
        const { userId, targetUserId } = req.query;
        await addFriends(userId as string, targetUserId as string);
        const response: BaseResponse = {
            status: 'success',
            message: 'add friend success'
        }
        res.status(200).json(response);
    } catch (error) {
        let status: number = 400;
        if ((error as BaseResponse).status === 'client_fail') {
            status = 400;
        } else if ((error as BaseResponse).status === 'server_fail') {
            status = 500;
        }
        const response: BaseResponse = {
            status: (error as BaseResponse).status,
            message: (error as BaseResponse).message
        }
        res.status(status).json(response);
    }
})

router.get('/friends', async (req: Request, res: Response) => {
    try {
        console.log('got request for friends');
        const url = base + req.url;
        const { userId, offset, limit } = req.query;
        console.log({
            userId, offset, limit
        })
        if (userId) {
            const response = await queryFriends(url, userId as string, Number(offset), Number(limit));
            res.json(response);
        }
    } catch (error) {
        res.send({
            message: error,
            status: 'client_fail'
        })
    }
})

router.get('/queryUnreadChats', async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        if (userId) {
            const result = await queryUnreadChats(userId as string);
            res.status(200).send(result);
        }
    } catch {

    }
})

router.post('/joinGroup', async (req: Request, res: Response) => {
    try {
        // const url = base + req.url
        const { userId, groupId } = req.query;
        await joinGroup(groupId as string, userId as string).then(() => {
            res.status(200).send({
                message: 'successfully join group',
                status: 'Success'
            })
        })
    } catch {
        res.status(500).send({
            message: 'cannot join Group for user',
            status: 'server_fail'
        })
    }
})

router.post('/quitGroup', async (req: Request, res: Response) => {
    try {
        const { userId, groupId } = req.query;
        await quitGroup(groupId as string, userId as string).then(() => {
            res.status(200).send({
                message: 'successfully quit the group',
                status: 'success'
            })
        })
    } catch {
        res.status(500).send({
            message: 'cannot quit group for user',
            status: 'server_fail'
        })
    }

})

router.post('/getTempSTS', async (req: Request, res: Response) => {
    try {
        const credential = await tempCredentialGenerator.getCredential();
        res.status(200).send(credential);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get('/getCosPath', async (req: Request, res: Response) => {
    try {
        const CosPath = imageBucket.getCosPath();
        res.status(200).send(CosPath);
    } catch (error) {
        res.status(500).send(error);
    }
})

export { router };