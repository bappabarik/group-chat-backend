import { WebSocket, WebSocketServer } from "ws";
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})

const port = process.env.PORT || 8080

const wss = new WebSocketServer({ port })

wss.on('connection', (ws) => {
    console.log("new connection established!")

    broadcastOnlineCount()

    ws.on('close', () => {
        console.log('A client disconnected');
        broadcastOnlineCount();
    });

    ws.on('message', (message) => {
        const receivedObject = JSON.parse(message)
        receivedObject.timestamp = new Date();

        console.log(`new message: ${receivedObject.client}: ${receivedObject.text}`)
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(receivedObject))
            }
        })
    })
    // const msgObject = {type: 'message' , client: 'server', text: 'Welcome to the WebSocket server!'}
    // ws.send(JSON.stringify(msgObject));

    function broadcastOnlineCount() {
        const onlineUsers = wss.clients.size

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'onlineCount', count: onlineUsers - 1 }));
            }
        })
    }
})


console.log(`WebSocket server is running on ws://localhost:${port}`);