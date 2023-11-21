
import express from "express";
import { router } from './httpServer';
import { createSocket } from "./Socket.io/socket";
import { createServer } from "http";
const app = express();
const httpServer = createServer(app);
const io = createSocket(httpServer);
app.use('/', router);

httpServer.listen(8080);