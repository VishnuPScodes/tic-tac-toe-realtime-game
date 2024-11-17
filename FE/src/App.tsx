import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";

const App: React.FC = () => {
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(null))
  );
  const [isXNext, setIsXNext] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [waitingForPlayer, setWaitingForPlayer] = useState(true);
  const [gameState, setGameState] = useState<any>(null);
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem("username") || ""
  );
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null);  const [winningLine, setWinningLine] = useState<{ start: number[]; end: number[]; } | null>(null);

  useEffect(() => {
    if (!username) return;

    console.log("Connecting with username:", username);
    const newSocket = io("http://localhost:3001");

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket connection closed, attempting to reconnect...");
      // Don't set socket to null on disconnect to maintain connection info
    });

    newSocket.on("connect", () => {
      console.log("Socket connected, joining game with username:", username);
      newSocket.emit("JOIN_GAME", { username });
      // Remove alert to avoid confusion on reconnects
      setWaitingForPlayer(true);
      console.log("Emitted JOIN_GAME event");
    });

    newSocket.on("GAME_UPDATE", (data) => {
      console.log("Received GAME_UPDATE:", data);
      setGameId(data.gameId);
      setBoard(data.gameState.board);
      setIsXNext(data.gameState.currentPlayer === "X");
      setGameState(data.gameState);
      setWaitingForPlayer(data.gameState.waitingForPlayer);  // Use the waitingForPlayer flag from server
      setPlayerSymbol(data.player);
      console.log("Updated game state:", {
        waitingForPlayer: data.gameState.waitingForPlayer,
        players: data.gameState.players
      });

      // Set winning line if game is won
      if (data.gameState.winner && data.gameState.winningLine) {
        setWinningLine(data.gameState.winningLine);
      } else {
        setWinningLine(null);
      }
      console.log('Winning line:', data.gameState.winningLine);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleClick = (row: number, col: number) => {
    if (!socket || waitingForPlayer || board[row][col] || gameState?.isGameOver)
      return;

    socket.emit("MAKE_MOVE", {
      gameId,
      move: { row, col, player: isXNext ? "X" : "O" },
    });
  };

  const renderCell = (row: number, col: number) => {
    return (
      <motion.div
        className="bg-game-secondary/5 rounded-lg overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="game-cell" onClick={() => handleClick(row, col)}>
          {board[row][col] && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={
                board[row][col] === "X"
                  ? "text-game-accent"
                  : "text-game-secondary"
              }
            >
              {board[row][col]}
            </motion.span>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {gameState?.gameFull ? (
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            Game in Progress
          </h1>
          <div className="text-2xl text-game-secondary animate-pulse mb-8">
            A game is currently in progress.
            <br />
            Please wait for the current game to end.
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-game-accent"
          >
            🎮
          </motion.div>
        </div>
      ) : !username ? (
        <div className="mb-8">
          <input
            type="text"
            placeholder="Enter your name"
            className="p-2 rounded border text-black"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && username.trim()) {
                const trimmedUsername = username.trim();
                setUsername(trimmedUsername);
                localStorage.setItem("username", trimmedUsername);
              }
            }}
          />
        </div>
      ) : (
        <div>
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">
            Tic Tac Toe
          </h1>
          {waitingForPlayer ? (
            <div className="text-2xl text-game-secondary animate-pulse">
              Waiting for another player to join...
            </div>
          ) : (
            <>
              <div className="game-board relative">
                {board.map((row, rowIndex) =>
                  row.map((_, colIndex) => renderCell(rowIndex, colIndex))
                )}
                {winningLine && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute h-1 transform origin-left
                  ${
                    gameState.winner === "X"
                      ? "bg-game-accent"
                      : "bg-game-secondary"
                  }`}
                    style={{
                      top: `${(winningLine.start[0] + 0.5) * 33.33}%`,
                      left: `${winningLine.start[1] * 33.33}%`,
                      width: "100%",
                      transform: `rotate(${
                        winningLine.start[0] === winningLine.end[0]
                          ? 0 // horizontal
                          : winningLine.start[1] === winningLine.end[1]
                          ? 90 // vertical
                          : winningLine.start[0] < winningLine.end[0]
                          ? 45
                          : -45 // diagonal
                      }deg)`,
                    }}
                  />
                )}
              </div>
              {gameState?.isGameOver ? (
                <div className="mt-8 text-2xl text-center">
                  {gameState.winner
                    ? "Player " + gameState.winner + " wins!"
                    : "It's a draw!"}
                  <button
                    onClick={() => {
                      setBoard(
                        Array(3)
                          .fill(null)
                          .map(() => Array(3).fill(null))
                      );
                      setWaitingForPlayer(true);
                      setGameState(null);
                      setWinningLine(null);
                      setIsXNext(true); // Reset turn state
                      socket?.emit("JOIN_GAME", { username });
                    }}
                    className="block mx-auto mt-4 px-4 py-2 bg-game-secondary/20 rounded hover:bg-game-secondary/30"
                  >
                    Play Again
                  </button>
                </div>
              ) : (
                <div className="mt-8 text-xl">
                  {isXNext ? (
                    playerSymbol === "X" ? (
                      <span>
                        Your turn (<span className="text-game-accent">X</span>)
                      </span>
                    ) : (
                      `${gameState?.players?.X || "Opponent"}'s turn (X)`
                    )
                  ) : playerSymbol === "O" ? (
                    <span>
                      Your turn (<span className="text-game-secondary">O</span>)
                    </span>
                  ) : (
                    `${gameState?.players?.O || "Opponent"}'s turn (O)`
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
