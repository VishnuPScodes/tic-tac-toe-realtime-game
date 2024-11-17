import express from 'express';
import http from 'http';
import gameRoutes from './routes/game.routes';
import { WebSocketService } from './services/websocket.service';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/game', gameRoutes);

const wsService = new WebSocketService();
wsService.setupWebSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
