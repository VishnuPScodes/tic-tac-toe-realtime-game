import { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuidv4 } from "uuid";
import { Game } from "../models/Game";
import { GameRoom, Player } from "../types/game.types";
import http from "http";

export class SocketService {
  private rooms: Map<string, GameRoom>;
  private io: SocketIOServer;
  private clientGameMap: Map<string, string>; // Track which client ID is in which game

  constructor() {
    this.rooms = new Map();
    this.clientGameMap = new Map();
    this.io = new SocketIOServer();
    console.log("Socket.IO server initialized");
  }

  setupSocketServer(server: http.Server) {
    this.io.attach(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on("connection", (socket: Socket) => {
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

  private async handleJoinGame(socket: Socket) {
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
      const gameId = uuidv4();
      room = {
        gameId,
        players: new Map(),
        game: new Game()
      };
      this.rooms.set(gameId, room);
    }

    const player: Player = room.players.size === 0 ? "X" : "O";
    room.players.set(player, socket);
    this.clientGameMap.set(socket.id, room.gameId);

    socket.emit('GAME_UPDATE', {
      gameId: room.gameId,
      gameState: {
        ...room.game.getGameState(),
        waitingForPlayer: room.players.size < 2
      },
      player
    });

    if (room.players.size === 2) {
      this.broadcastGameState(room);
    }
  }

  private findAvailableRoom(): GameRoom | undefined {
    for (const [_, room] of this.rooms) {
      if (room.players.size < 2) {
        return room;
      }
    }
    return undefined;
  }

  private handleMove(socket: Socket, gameId: string, move: { row: number; col: number }) {
    const room = this.rooms.get(gameId);
    if (!room) {
      socket.emit('ERROR', { error: "Game not found" });
      return;
    }

    let playerSymbol: Player | null = null;
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
    } catch (error) {
      socket.emit('ERROR', { error: (error as Error).message });
    }
  }

  private broadcastGameState(room: GameRoom) {
    const gameState = room.game.getGameState();
    room.players.forEach((socket, player) => {
      socket.emit('GAME_UPDATE', {
        gameId: room.gameId,
        gameState: {
          ...gameState,
          waitingForPlayer: room.players.size < 2
        },
        player
      });
    });
  }

  private handleDisconnect(socket: Socket) {
    const gameId = this.clientGameMap.get(socket.id);
    if (gameId) {
      const room = this.rooms.get(gameId);
      if (room) {
        let playerToRemove: Player | null = null;
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
          } else {
            console.log(`Game ${gameId} continues with ${room.players.size} player(s)`);
            this.broadcastGameState(room);
          }
        }
      }
    }

    this.clientGameMap.delete(socket.id);
  }
}
