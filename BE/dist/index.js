"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const game_routes_1 = __importDefault(require("./routes/game.routes"));
const socket_service_1 = require("./services/socket.service");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express_1.default.json());
app.use('/api/game', game_routes_1.default);
const socketService = new socket_service_1.SocketService();
socketService.setupSocketServer(server);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
