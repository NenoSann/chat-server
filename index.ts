import express, { Express, Request, Response } from "express";
import { handleConnection } from "./ws";
import { WebSocketServer } from "ws";
const app: Express = express();
const wss = new WebSocketServer({ port: 8081 });
const port: number = 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Express + typescript!')
})

app.listen(port, () => {
    console.log(`listening on port ${port}`);
    wss.on('connection', handleConnection);
});