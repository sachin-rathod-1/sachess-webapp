# SaChess Backend

Java Spring Boot backend for the SaChess real-time chess platform.

## Features

- Real-time game communication via WebSocket/STOMP
- JWT authentication
- Matchmaking with ELO-based pairing
- Game invitation system
- In-game chat
- Stockfish chess engine integration
- ELO rating system
- RESTful API

## Tech Stack

- **Java 17** - Programming language
- **Spring Boot 3.2** - Application framework
- **Spring WebSocket + STOMP** - Real-time communication
- **Spring Security + JWT** - Authentication
- **Spring Data JPA** - Database access
- **H2 Database** (dev) / **PostgreSQL** (prod)
- **Stockfish** - Chess engine integration
- **Lombok** - Reduce boilerplate

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.8 or higher
- Stockfish (optional, for analysis features)

### Installation

```bash
mvn clean install
```

### Running the Server

```bash
mvn spring-boot:run
```

The server will run on [http://localhost:8080](http://localhost:8080)

### Configuration

Edit `src/main/resources/application.properties`:

```properties
# Server
server.port=8080

# Database (H2 for development)
spring.datasource.url=jdbc:h2:mem:sachessdb
spring.datasource.username=sa
spring.datasource.password=

# JWT
jwt.secret=YourSecretKeyHere
jwt.expiration=604800000

# Stockfish (optional)
stockfish.path=stockfish
stockfish.depth=20

# CORS
cors.allowed-origins=http://localhost:3000
```

### Stockfish Setup (Optional)

1. Download Stockfish from [stockfishchess.org](https://stockfishchess.org/download/)
2. Add to system PATH or update `stockfish.path` in application.properties

## Project Structure

```
sachess-backend/
├── src/main/java/com/sachess/
│   ├── SachessApplication.java     # Main application
│   ├── config/
│   │   ├── SecurityConfig.java     # JWT security
│   │   ├── WebSocketConfig.java    # STOMP configuration
│   │   └── WebSocketEventListener.java
│   ├── controller/
│   │   ├── AuthController.java     # Login/Register
│   │   ├── GameController.java     # Game operations
│   │   ├── UserController.java     # User profiles
│   │   ├── ChatController.java     # Chat messages
│   │   ├── LeaderboardController.java
│   │   └── WebSocketController.java
│   ├── dto/                        # Data transfer objects
│   ├── entity/                     # JPA entities
│   ├── repository/                 # Data repositories
│   ├── security/                   # JWT implementation
│   └── service/
│       ├── AuthService.java
│       ├── GameService.java
│       ├── ChessService.java       # Move validation
│       ├── StockfishService.java   # Engine integration
│       ├── MatchmakingService.java
│       ├── ChatService.java
│       └── UserService.java
└── src/main/resources/
    └── application.properties
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login

### Games
- `POST /api/games/create` - Create a new game
- `POST /api/games/{id}/join` - Join a game
- `GET /api/games/{id}` - Get game details
- `POST /api/games/{id}/move` - Make a move
- `POST /api/games/{id}/resign` - Resign
- `POST /api/games/{id}/draw/offer` - Offer draw
- `GET /api/games/waiting` - List waiting games
- `GET /api/games/active` - List active games

### Matchmaking
- `POST /api/games/matchmaking/join` - Join queue
- `POST /api/games/matchmaking/leave` - Leave queue

### Invitations
- `POST /api/games/invite/create` - Create invitation
- `POST /api/games/invite/{code}/accept` - Accept invitation

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/leaderboard` - Get leaderboard

### WebSocket Endpoints
- `/ws` - WebSocket connection (SockJS)
- `/topic/game/{gameId}` - Game updates
- `/topic/chat/{gameId}` - Chat messages
- `/topic/game/{gameId}/analysis` - Analysis results
- `/app/game/{gameId}/move` - Send move
- `/app/chat/{gameId}` - Send chat message

## Building for Production

```bash
mvn package -DskipTests
java -jar target/sachess-server-1.0.0.jar
```

## H2 Console (Development)

Access at [http://localhost:8080/h2-console](http://localhost:8080/h2-console)

- JDBC URL: `jdbc:h2:mem:sachessdb`
- Username: `sa`
- Password: (empty)

## Frontend

This backend is designed to work with the SaChess frontend. See the `sachess-frontend` directory.
