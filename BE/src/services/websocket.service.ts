import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Game } from '../models/Game';
import { GameRoom, WebSocketMessage, Player } from '../types/game.types';

export class WebSocketService {
    private rooms: Map<string, GameRoom>;

    constructor() {
        this.rooms = new Map();
    }

    setupWebSocketServer(server: any) {
        const wss = new WebSocket.Server({ server });

        wss.on('connection', (ws: WebSocket) => {
            ws.on('message', (message: string) => this.handleMessage(ws, message));
            ws.on('close', () => this.handleDisconnect(ws));
        });
    }

    private handleMessage(ws: WebSocket, message: string) {
        try {
            const data: WebSocketMessage = JSON.parse(message);
            
            switch (data.type) {
                case 'JOIN_GAME':
                    this.handleJoinGame(ws);
                    break;
                case 'MAKE_MOVE':
                    if (data.gameId && data.move) {
                        this.handleMove(ws, data.gameId, data.move);
                    }
                    break;
            }
        } catch (error) {
            this.sendError(ws, 'Invalid message format');
        }
    }

    private handleJoinGame(ws: WebSocket) {
        // Find an available room or create a new one
        let room = this.findAvailableRoom();
        if (!room) {
            const gameId = uuidv4();
            room = {
                gameId,
                players: new Map(),
                game: new Game()
            };
            this.rooms.set(gameId, room);
        }

        const player: Player = room.players.size === 0 ? 'X' : 'O';
        room.players.set(player, ws);

        ws.send(JSON.stringify({
            type: 'GAME_UPDATE',
            gameId: room.gameId,
            gameState: room.game.getGameState()
        }));
    }

    private findAvailableRoom(): GameRoom | undefined {
        for (const [_, room] of this.rooms) {
            if (room.players.size < 2) {
                return room;
            }
        }
        return undefined;
    }

    private handleMove(ws: WebSocket, gameId: string, move: any) {
        const room = this.rooms.get(gameId);
        if (!room) {
            this.sendError(ws, 'Game not found');
            return;
        }

        try {
            room.game.makeMove(move.row, move.col);
            this.broadcastGameState(room);
        } catch (error) {
            this.sendError(ws, (error as Error).message);
        }
    }

    private broadcastGameState(room: GameRoom) {
        const gameState = room.game.getGameState();
        const message: WebSocketMessage = {
            type: 'GAME_UPDATE',
            gameState
        };

        room.players.forEach((ws) => {
            ws.send(JSON.stringify(message));
        });
    }

    private handleDisconnect(ws: WebSocket) {
        // Clean up rooms when players disconnect
        for (const [gameId, room] of this.rooms) {
            for (const [player, playerWs] of room.players) {
                if (playerWs === ws) {
                    room.players.delete(player);
                    if (room.players.size === 0) {
                        this.rooms.delete(gameId);
                    }
                    break;
                }
            }
        }
    }

    private sendError(ws: WebSocket, error: string) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            error
        }));
    }
}
