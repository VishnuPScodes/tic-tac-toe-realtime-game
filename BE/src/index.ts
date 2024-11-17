import express from 'express';
import http from 'http';
import cors from 'cors';
import gameRoutes from './routes/game.routes';
import { SocketService } from './services/socket.service';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use('/api/game', gameRoutes);

const socketService = new SocketService();

socketService.setupSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
