import { Socket } from 'socket.io';
import { ServerResponse } from '../lib/ResponseClass';
const receiveMessage = function (socket: Socket, data: any) {
    console.log('got message');
    socket.emitWithAck('message', `You sent ${data}`, new ServerResponse('you just sent an emit'))
}

const privateMessage = function () {

}
export { receiveMessage }