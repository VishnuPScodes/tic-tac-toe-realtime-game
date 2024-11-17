import { Game } from '../models/Game';
import { Socket } from 'socket.io';
export type Player = 'X' | 'O';

export interface GameBoard {
    board: (Player | null)[][];
    currentPlayer: Player;
    winner: Player | null;
    isGameOver: boolean;
    waitingForPlayer?: boolean;
    winningLine?: { start: number[]; end: number[] } | null;
}

export interface GameMove {
    row: number;
    col: number;
    player: Player;
}

export interface WebSocketMessage {
    type: 'JOIN_GAME' | 'MAKE_MOVE' | 'GAME_UPDATE' | 'ERROR' | 'CONNECTION_SUCCESS';
    gameId?: string;
    move?: GameMove;
    gameState?: GameBoard;
    error?: string;
    player?: Player;
    timestamp?: string;
}

export interface GameRoom {
    gameId: string;
    players: Map<Player, Socket>;
    game: Game;
}
