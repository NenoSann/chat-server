import { connectToMongo } from "./mongodb";
import express from "express";
import bodyParser from "body-parser";
import { router } from './router';
import { createSocket } from "./Socket.io/socket";
import { createServer } from "http";
import { env } from "process";
import 'dotenv/config';
const app = express();
const httpServer = createServer(app);
// if (process.env.MONGODB_URI) {
connectToMongo(process.env.MONGODB_CHAT + '/chat-dev');
console.log(process.env.MONGODB_CHAT + '/chat-dev');
const io = createSocket(httpServer);
app.use(bodyParser.json());
app.use('/', router);

httpServer.listen(8081);