import { connectToMongo } from "./mongodb";
import express from "express";
import bodyParser from "body-parser";
import { router } from './router';
import { createSocket } from "./Socket.io/socket";
import { createServer } from "http";
const app = express();
const httpServer = createServer(app);
// if (process.env.MONGODB_URI) {
connectToMongo('mongodb://NenoSan:2440060505Jkl.@43.163.234.220:27017/');
// } else {
//     console.error('moongodb uri env variable not found');
// }
const io = createSocket(httpServer);
app.use(bodyParser.json());
app.use('/', router);

httpServer.listen(8080);