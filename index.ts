import { connectToMongo } from "./mongodb";
import express from "express";
import bodyParser from "body-parser";
import { router } from './router';
import { createSocket } from "./Socket.io/socket";
import { createServer } from "http";
import { env } from "process";
const app = express();
const httpServer = createServer(app);
// if (process.env.MONGODB_URI) {
connectToMongo(process.env.MONGODB_ADMIN + '/chat');
console.log(process.env.MONGODB_ADMIN + '/chat');
// } else {
//     console.error('moongodb uri env variable not found');
// }
const io = createSocket(httpServer);
app.use(bodyParser.json());
app.use('/', router);

httpServer.listen(8081);