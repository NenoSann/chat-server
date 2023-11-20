import { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';
const wss = new WebSocketServer({ port: 8080 });

function handleConnection(ws: WebSocket) {
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        console.log(`Received: ${data}`);
        ws.send(`You send: ${data}`)
    });
    ws.send('Connection established');
}

export { handleConnection }