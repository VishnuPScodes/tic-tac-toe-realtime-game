"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const uuid_1 = require("uuid");
const Game_1 = require("../models/Game");
class SocketService {
    constructor() {
        this.rooms = new Map();
        this.clientGameMap = new Map();
        this.io = new socket_io_1.Server();
        console.log("Socket.IO server initialized");
    }
    setupSocketServer(server) {
        this.io.attach(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.io.on("connection", (socket) => {
            console.log('Client connected');
            socket.emit('CONNECTION_SUCCESS', {
                timestamp: new Date().toISOString()
            });
            socket.on('JOIN_GAME', () => this.handleJoinGame(socket));
            socket.on('MAKE_MOVE', (data) => this.handleMove(socket, data.gameId, data.move));
            socket.on('disconnect', () => this.handleDisconnect(socket));
            socket.on('error', (error) => {
                console.error('Socket error:', error);
                this.handleDisconnect(socket);
            });
        });
    }
    handleJoinGame(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingGameId = this.clientGameMap.get(socket.id);
            if (existingGameId) {
                const existingRoom = this.rooms.get(existingGameId);
                if (existingRoom) {
                    for (const [player, playerSocket] of existingRoom.players.entries()) {
                        if (playerSocket.id === socket.id) {
                            existingRoom.players.delete(player);
                            break;
                        }
                    }
                }
            }
            let room = this.findAvailableRoom();
            if (!room) {
                const gameId = (0, uuid_1.v4)();
                room = {
                    gameId,
                    players: new Map(),
                    game: new Game_1.Game()
                };
                this.rooms.set(gameId, room);
            }
            const player = room.players.size === 0 ? "X" : "O";
            room.players.set(player, socket);
            this.clientGameMap.set(socket.id, room.gameId);
            socket.emit('GAME_UPDATE', {
                gameId: room.gameId,
                gameState: Object.assign(Object.assign({}, room.game.getGameState()), { waitingForPlayer: room.players.size < 2 }),
                player
            });
            if (room.players.size === 2) {
                this.broadcastGameState(room);
            }
        });
    }
    findAvailableRoom() {
        for (const [_, room] of this.rooms) {
            if (room.players.size < 2) {
                return room;
            }
        }
        return undefined;
    }
    handleMove(socket, gameId, move) {
        const room = this.rooms.get(gameId);
        if (!room) {
            socket.emit('ERROR', { error: "Game not found" });
            return;
        }
        let playerSymbol = null;
        for (const [symbol, playerSocket] of room.players.entries()) {
            if (playerSocket.id === socket.id) {
                playerSymbol = symbol;
                break;
            }
        }
        if (!playerSymbol) {
            socket.emit('ERROR', { error: "Player not found in game" });
            return;
        }
        if (playerSymbol !== room.game.getGameState().currentPlayer) {
            socket.emit('ERROR', { error: "Not your turn" });
            return;
        }
        try {
            room.game.makeMove(move.row, move.col);
            this.broadcastGameState(room);
        }
        catch (error) {
            socket.emit('ERROR', { error: error.message });
        }
    }
    broadcastGameState(room) {
        const gameState = room.game.getGameState();
        room.players.forEach((socket, player) => {
            socket.emit('GAME_UPDATE', {
                gameId: room.gameId,
                gameState: Object.assign(Object.assign({}, gameState), { waitingForPlayer: room.players.size < 2 }),
                player
            });
        });
    }
    handleDisconnect(socket) {
        const gameId = this.clientGameMap.get(socket.id);
        if (gameId) {
            const room = this.rooms.get(gameId);
            if (room) {
                let playerToRemove = null;
                for (const [player, playerSocket] of room.players.entries()) {
                    if (playerSocket.id === socket.id) {
                        playerToRemove = player;
                        break;
                    }
                }
                if (playerToRemove) {
                    room.players.delete(playerToRemove);
                    console.log(`Player ${playerToRemove} left game ${gameId}`);
                    if (room.players.size === 0) {
                        console.log(`Game ${gameId} ended - all players left`);
                        this.rooms.delete(gameId);
                    }
                    else {
                        console.log(`Game ${gameId} continues with ${room.players.size} player(s)`);
                        this.broadcastGameState(room);
                    }
                }
            }
        }
        this.clientGameMap.delete(socket.id);
    }
}
exports.SocketService = SocketService;
