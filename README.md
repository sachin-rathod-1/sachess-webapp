# SaChess - Real-Time Chess Platform

A full-stack real-time chess platform similar to Lichess, featuring multiplayer gameplay, real-time chat, matchmaking, and Stockfish analysis.

## Project Structure

```
sachess-webapp/
├── sachess-frontend/    # React frontend application
├── sachess-backend/     # Java Spring Boot backend
└── README.md
```

## Quick Start

### 1. Start the Backend

```bash
cd sachess-backend
mvn clean install
mvn spring-boot:run
```

Backend runs on: http://localhost:8080

### 2. Start the Frontend

```bash
cd sachess-frontend
npm install
npm start
```

Frontend runs on: http://localhost:3000

## Features

- **Real-time multiplayer chess** via WebSocket
- **Matchmaking** with ELO-based pairing
- **Play with friends** via invitation codes
- **In-game chat**
- **Stockfish analysis**
- **Multiple time controls** (Bullet, Blitz, Rapid, Classical)
- **JWT authentication**
- **ELO rating system**
- **Leaderboard**

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React 18 | Java 17 |
| Material-UI | Spring Boot 3.2 |
| react-chessboard | Spring WebSocket |
| chess.js | Spring Security + JWT |
| SockJS + STOMP | Spring Data JPA |
| Axios | H2 / PostgreSQL |

## Documentation

- [Frontend README](./sachess-frontend/README.md)
- [Backend README](./sachess-backend/README.md)

## License

MIT License
