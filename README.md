# Real-Time Multiplayer Tic Tac Toe

A real-time multiplayer Tic Tac Toe game built with modern web technologies. Play against other players in real-time with smooth animations and a responsive interface.

## Tech Stack

### Frontend
- React + TypeScript
- Vite for fast development and building
- TailwindCSS for styling
- Framer Motion for animations
- Socket.IO client for real-time communication

### Backend
- Node.js + TypeScript
- Express server
- Socket.IO for real-time game state management
- UUID for unique game session IDs

## Features

- 🎮 Real-time multiplayer gameplay
- 👥 Two-player matchmaking system
- 🎯 Visual feedback for winning combinations
- 🔄 Automatic game state synchronization
- 💫 Smooth animations for moves and wins
- 🎨 Responsive design with modern UI
- 📱 Works on both desktop and mobile
- 🔒 Username persistence across sessions

## Game Flow

1. **Player Registration**
   - Enter username to join
   - Username is preserved across sessions
   - Automatic reconnection on page refresh

2. **Game Matching**
   - Players are automatically matched
   - Waiting room for unmatched players
   - Queue system for additional players

3. **Gameplay**
   - Real-time move updates
   - Turn-based gameplay (X starts first)
   - Visual indicators for current turn
   - Colored symbols (X in red, O in blue)

4. **Win Detection**
   - Automatic win detection
   - Animated winning line display
   - Support for horizontal, vertical, and diagonal wins
   - Draw detection when no moves remain

5. **Post-Game**
   - Winner announcement
   - Play Again option
   - Automatic game reset

## Project Structure

```
├── BE/                 # Backend server code
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/     # Game logic
│   │   ├── services/   # Socket handling
│   │   └── types/      # TypeScript types
│   └── package.json
│
└── FE/                 # Frontend React application
    ├── src/
    │   ├── components/
    │   └── App.tsx     # Main game component
    └── package.json
```

## Running Locally

1. Start the backend server:
```bash
cd BE
npm install
npm run dev
```

2. Start the frontend development server:
```bash
cd FE
npm install
npm run dev
```

The game will be available at `http://localhost:5173` (or next available port).
