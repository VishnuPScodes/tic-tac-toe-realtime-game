export type Player = 'X' | 'O';

export interface GameBoard {
    board: (Player | null)[][];
    currentPlayer: Player;
    winner: Player | null;
    isGameOver: boolean;
}

export interface GameMove {
    row: number;
    col: number;
    player: Player;
}

export interface WebSocketMessage {
    type: 'JOIN_GAME' | 'MAKE_MOVE' | 'GAME_UPDATE' | 'ERROR';
    gameId?: string;
    move?: GameMove;
    gameState?: GameBoard;
    error?: string;
}

export interface GameRoom {
    gameId: string;
    players: Map<Player, WebSocket>;
    game: Game;
}
