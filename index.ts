import { connectToMongo } from "./mongodb";
import express from "express";
import bodyParser from "body-parser";
import { router } from './router';
import { createSocket } from "./Socket.io/socket";
import { createServer } from "http";
const app = express();
const httpServer = createServer(app);
connectToMongo('mongodb://127.0.0.1:27017');
const io = createSocket(httpServer);
app.use(bodyParser.json());
app.use('/', router);

httpServer.listen(8080);