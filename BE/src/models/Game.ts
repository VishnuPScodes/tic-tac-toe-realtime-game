import { GameBoard, Player } from "../types/game.types";

export class Game {
  private board: (Player | null)[][];
  private currentPlayer: Player;
  private winner: null | Player;
  private isGameOver: boolean;

  constructor() {
    this.board = Array(3)
      .fill(null)
      .map(() => Array(3).fill(null));
    this.currentPlayer = "X";
    this.winner = null;
    this.isGameOver = false;
  }

  getGameState(): GameBoard {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      isGameOver: this.isGameOver,
      winningLine: this.winningLine
    };
  }

  makeMove(row: number, col: number): void {
    if (this.isGameOver) {
      throw new Error("Game is already over");
    }

    if (this.board[row][col] !== null) {
      throw new Error("Position is already occupied");
    }

    this.board[row][col] = this.currentPlayer;
    this.checkForWinner();
    this.switchPlayer();
  }

  private winningLine: { start: number[]; end: number[] } | null = null;

  checkForWinner(): void {
    // Check rows for a winner
    for (let i = 0; i < 3; i++) {
      if (
        this.board[i][0] === this.board[i][1] &&
        this.board[i][1] === this.board[i][2] &&
        this.board[i][0] !== null
      ) {
        this.winner = this.board[i][0];
        this.isGameOver = true;
        this.winningLine = { start: [i, 0], end: [i, 2] };
        return;
      }
    }

    // Check columns for a winner
    for (let i = 0; i < 3; i++) {
      if (
        this.board[0][i] === this.board[1][i] &&
        this.board[1][i] === this.board[2][i] &&
        this.board[0][i] !== null
      ) {
        this.winner = this.board[0][i];
        this.isGameOver = true;
        this.winningLine = { start: [0, i], end: [2, i] };
        return;
      }
    }

    // Check diagonals for a winner
    if (
      this.board[0][0] === this.board[1][1] &&
      this.board[1][1] === this.board[2][2] &&
      this.board[0][0] !== null
    ) {
      this.winner = this.board[1][1];
      this.isGameOver = true;
      this.winningLine = { start: [0, 0], end: [2, 2] };
      return;
    }

    if (
      this.board[0][2] === this.board[1][1] &&
      this.board[1][1] === this.board[2][0] &&
      this.board[0][2] !== null
    ) {
      this.winner = this.board[1][1];
      this.isGameOver = true;
      this.winningLine = { start: [0, 2], end: [2, 0] };
      return;
    }

    // Check if the game is a draw
    if (!this.board.flat().includes(null)) {
      this.isGameOver = true;
    }
  }

  switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
  }
}
