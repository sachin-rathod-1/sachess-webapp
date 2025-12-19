# SaChess Frontend

React-based frontend for the SaChess real-time chess platform.

## Features

- Real-time multiplayer chess games
- Matchmaking system
- Play with friends via invitation codes
- In-game chat
- Stockfish position analysis
- Multiple time controls (Bullet, Blitz, Rapid, Classical)
- User profiles and leaderboard

## Tech Stack

- **React 18** - UI framework
- **Material-UI** - Component library
- **react-chessboard** - Chess board component
- **chess.js** - Chess logic
- **SockJS + STOMP** - WebSocket client
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file (already included):

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=http://localhost:8080/ws
```

### Running the Development Server

```bash
npm start
```

The app will run on [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

## Project Structure

```
sachess-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, Signup
│   │   ├── common/         # Navbar, Footer
│   │   ├── game/           # GameLobby, MultiplayerGame, GameChat, Leaderboard
│   │   ├── profile/        # User profile
│   │   ├── puzzles/        # Daily puzzles
│   │   └── training/       # Training modes
│   ├── context/            # AuthContext, GameContext
│   ├── services/           # API, WebSocket services
│   ├── utils/              # Chess logic utilities
│   ├── App.js
│   └── index.js
├── .env
└── package.json
```

## Available Scripts

- `npm start` - Run development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

## Backend

This frontend requires the SaChess backend to be running. See the `sachess-backend` directory for backend setup instructions.
