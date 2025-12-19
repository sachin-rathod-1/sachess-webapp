package com.sachess.service;

import com.sachess.dto.GameDTO;
import com.sachess.dto.GameMessage;
import com.sachess.dto.MoveRequest;
import com.sachess.entity.Game;
import com.sachess.entity.User;
import com.sachess.repository.GameRepository;
import com.sachess.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final ChessService chessService;
    private final StockfishService stockfishService;
    private final SimpMessagingTemplate messagingTemplate;

    // In-memory storage for active game timers
    private final Map<String, GameTimer> gameTimers = new ConcurrentHashMap<>();

    @Transactional
    public GameDTO createGame(String playerId, int timeControlMinutes, int incrementSeconds) {
        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        Game game = Game.builder()
                .whitePlayer(player)
                .currentFen(chessService.getInitialFen())
                .timeControlMinutes(timeControlMinutes)
                .incrementSeconds(incrementSeconds)
                .whiteTimeRemaining(timeControlMinutes * 60 * 1000L)
                .blackTimeRemaining(timeControlMinutes * 60 * 1000L)
                .status(Game.GameStatus.WAITING)
                .moves(new ArrayList<>())
                .build();

        game = gameRepository.save(game);
        log.info("Game created: {} by player: {}", game.getId(), player.getUsername());

        return GameDTO.fromGame(game);
    }

    @Transactional
    public GameDTO joinGame(String gameId, String playerId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != Game.GameStatus.WAITING) {
            throw new RuntimeException("Game is not available to join");
        }

        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (game.getWhitePlayer().getId().equals(playerId)) {
            throw new RuntimeException("Cannot join your own game");
        }

        game.setBlackPlayer(player);
        game.setStatus(Game.GameStatus.ACTIVE);
        game.setStartedAt(LocalDateTime.now());
        game.setLastMoveTime(LocalDateTime.now());

        game = gameRepository.save(game);

        // Start game timer
        startGameTimer(game);

        // Notify players
        GameMessage startMessage = GameMessage.builder()
                .type(GameMessage.MessageType.GAME_START)
                .gameId(game.getId())
                .fen(game.getCurrentFen())
                .status(game.getStatus())
                .currentTurn(game.getCurrentTurn())
                .whiteTimeRemaining(game.getWhiteTimeRemaining())
                .blackTimeRemaining(game.getBlackTimeRemaining())
                .build();

        messagingTemplate.convertAndSend("/topic/game/" + gameId, startMessage);

        log.info("Player {} joined game {}", player.getUsername(), gameId);

        return GameDTO.fromGame(game);
    }

    @Transactional
    public GameDTO makeMove(MoveRequest moveRequest) {
        Game game = gameRepository.findById(moveRequest.getGameId())
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != Game.GameStatus.ACTIVE) {
            throw new RuntimeException("Game is not active");
        }

        // Validate it's the player's turn
        boolean isWhiteTurn = game.getCurrentTurn() == Game.Color.WHITE;
        String currentPlayerId = isWhiteTurn ? 
                game.getWhitePlayer().getId() : game.getBlackPlayer().getId();

        if (!currentPlayerId.equals(moveRequest.getPlayerId())) {
            throw new RuntimeException("Not your turn");
        }

        // Validate and make the move
        String newFen = chessService.makeMove(
                game.getCurrentFen(),
                moveRequest.getFrom(),
                moveRequest.getTo(),
                moveRequest.getPromotion()
        );

        if (newFen == null) {
            throw new RuntimeException("Invalid move");
        }

        // Update time
        updateGameTime(game);

        // Get move notation
        String moveNotation = chessService.getMoveNotation(
                game.getCurrentFen(),
                moveRequest.getFrom(),
                moveRequest.getTo(),
                moveRequest.getPromotion()
        );

        // Update game state
        game.setCurrentFen(newFen);
        game.getMoves().add(moveRequest.getFrom() + moveRequest.getTo() + 
                (moveRequest.getPromotion() != null ? moveRequest.getPromotion() : ""));
        game.setCurrentTurn(isWhiteTurn ? Game.Color.BLACK : Game.Color.WHITE);
        game.setLastMoveTime(LocalDateTime.now());

        // Update PGN
        String pgn = game.getPgn();
        if (isWhiteTurn) {
            int moveNumber = (game.getMoves().size() + 1) / 2;
            pgn += moveNumber + ". " + moveNotation + " ";
        } else {
            pgn += moveNotation + " ";
        }
        game.setPgn(pgn);

        // Check for game end conditions
        if (chessService.isCheckmate(newFen)) {
            game.setStatus(Game.GameStatus.COMPLETED);
            game.setResult(isWhiteTurn ? Game.GameResult.WHITE_WINS : Game.GameResult.BLACK_WINS);
            game.setEndedAt(LocalDateTime.now());
            updatePlayerRatings(game);
            stopGameTimer(game.getId());
        } else if (chessService.isStalemate(newFen)) {
            game.setStatus(Game.GameStatus.COMPLETED);
            game.setResult(Game.GameResult.STALEMATE);
            game.setEndedAt(LocalDateTime.now());
            updatePlayerRatings(game);
            stopGameTimer(game.getId());
        } else if (chessService.isDraw(newFen)) {
            game.setStatus(Game.GameStatus.COMPLETED);
            game.setResult(Game.GameResult.DRAW);
            game.setEndedAt(LocalDateTime.now());
            updatePlayerRatings(game);
            stopGameTimer(game.getId());
        }

        game = gameRepository.save(game);

        // Send move to all subscribers
        GameMessage moveMessage = GameMessage.builder()
                .type(game.getStatus() == Game.GameStatus.COMPLETED ? 
                        GameMessage.MessageType.GAME_END : GameMessage.MessageType.MOVE)
                .gameId(game.getId())
                .playerId(moveRequest.getPlayerId())
                .from(moveRequest.getFrom())
                .to(moveRequest.getTo())
                .promotion(moveRequest.getPromotion())
                .fen(newFen)
                .pgn(game.getPgn())
                .status(game.getStatus())
                .result(game.getResult())
                .currentTurn(game.getCurrentTurn())
                .whiteTimeRemaining(game.getWhiteTimeRemaining())
                .blackTimeRemaining(game.getBlackTimeRemaining())
                .build();

        messagingTemplate.convertAndSend("/topic/game/" + game.getId(), moveMessage);

        return GameDTO.fromGame(game);
    }

    @Transactional
    public GameDTO resign(String gameId, String playerId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != Game.GameStatus.ACTIVE) {
            throw new RuntimeException("Game is not active");
        }

        boolean isWhitePlayer = game.getWhitePlayer().getId().equals(playerId);
        boolean isBlackPlayer = game.getBlackPlayer() != null && 
                game.getBlackPlayer().getId().equals(playerId);

        if (!isWhitePlayer && !isBlackPlayer) {
            throw new RuntimeException("You are not a player in this game");
        }

        game.setStatus(Game.GameStatus.COMPLETED);
        game.setResult(isWhitePlayer ? Game.GameResult.BLACK_WINS : Game.GameResult.WHITE_WINS);
        game.setEndedAt(LocalDateTime.now());

        updatePlayerRatings(game);
        stopGameTimer(gameId);

        game = gameRepository.save(game);

        GameMessage resignMessage = GameMessage.builder()
                .type(GameMessage.MessageType.RESIGN)
                .gameId(gameId)
                .playerId(playerId)
                .status(game.getStatus())
                .result(game.getResult())
                .message((isWhitePlayer ? "White" : "Black") + " resigned")
                .build();

        messagingTemplate.convertAndSend("/topic/game/" + gameId, resignMessage);

        return GameDTO.fromGame(game);
    }

    @Transactional
    public GameDTO offerDraw(String gameId, String playerId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != Game.GameStatus.ACTIVE) {
            throw new RuntimeException("Game is not active");
        }

        game.setStatus(Game.GameStatus.DRAW_OFFERED);
        game = gameRepository.save(game);

        User player = userRepository.findById(playerId).orElse(null);
        String playerName = player != null ? player.getUsername() : "Unknown";

        GameMessage drawMessage = GameMessage.builder()
                .type(GameMessage.MessageType.DRAW_OFFER)
                .gameId(gameId)
                .playerId(playerId)
                .playerUsername(playerName)
                .message(playerName + " offers a draw")
                .build();

        messagingTemplate.convertAndSend("/topic/game/" + gameId, drawMessage);

        return GameDTO.fromGame(game);
    }

    @Transactional
    public GameDTO acceptDraw(String gameId, String playerId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != Game.GameStatus.DRAW_OFFERED) {
            throw new RuntimeException("No draw offer to accept");
        }

        game.setStatus(Game.GameStatus.COMPLETED);
        game.setResult(Game.GameResult.DRAW);
        game.setEndedAt(LocalDateTime.now());

        updatePlayerRatings(game);
        stopGameTimer(gameId);

        game = gameRepository.save(game);

        GameMessage drawMessage = GameMessage.builder()
                .type(GameMessage.MessageType.DRAW_ACCEPT)
                .gameId(gameId)
                .status(game.getStatus())
                .result(game.getResult())
                .message("Draw accepted")
                .build();

        messagingTemplate.convertAndSend("/topic/game/" + gameId, drawMessage);

        return GameDTO.fromGame(game);
    }

    @Transactional
    public GameDTO declineDraw(String gameId, String playerId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != Game.GameStatus.DRAW_OFFERED) {
            throw new RuntimeException("No draw offer to decline");
        }

        game.setStatus(Game.GameStatus.ACTIVE);
        game = gameRepository.save(game);

        GameMessage drawMessage = GameMessage.builder()
                .type(GameMessage.MessageType.DRAW_DECLINE)
                .gameId(gameId)
                .message("Draw declined")
                .build();

        messagingTemplate.convertAndSend("/topic/game/" + gameId, drawMessage);

        return GameDTO.fromGame(game);
    }

    public GameDTO getGame(String gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        return GameDTO.fromGame(game);
    }

    public List<GameDTO> getActiveGames() {
        return gameRepository.findActiveGames().stream()
                .map(GameDTO::fromGame)
                .collect(Collectors.toList());
    }

    public List<GameDTO> getWaitingGames() {
        return gameRepository.findWaitingGames().stream()
                .map(GameDTO::fromGame)
                .collect(Collectors.toList());
    }

    public List<GameDTO> getPlayerGames(String playerId) {
        return gameRepository.findByPlayerId(playerId).stream()
                .map(GameDTO::fromGame)
                .collect(Collectors.toList());
    }

    public void analyzePosition(String gameId, String fen) {
        if (!stockfishService.isAvailable()) {
            return;
        }

        stockfishService.analyzePosition(fen).thenAccept(analysis -> {
            if (analysis != null) {
                GameMessage analysisMessage = GameMessage.builder()
                        .type(GameMessage.MessageType.ANALYSIS)
                        .gameId(gameId)
                        .fen(fen)
                        .analysis(analysis)
                        .build();

                messagingTemplate.convertAndSend("/topic/game/" + gameId + "/analysis", analysisMessage);
            }
        });
    }

    private void updateGameTime(Game game) {
        if (game.getLastMoveTime() != null) {
            long elapsedMs = java.time.Duration.between(
                    game.getLastMoveTime(), LocalDateTime.now()).toMillis();

            if (game.getCurrentTurn() == Game.Color.WHITE) {
                game.setWhiteTimeRemaining(Math.max(0, game.getWhiteTimeRemaining() - elapsedMs));
                // Add increment
                game.setWhiteTimeRemaining(game.getWhiteTimeRemaining() + 
                        game.getIncrementSeconds() * 1000L);
            } else {
                game.setBlackTimeRemaining(Math.max(0, game.getBlackTimeRemaining() - elapsedMs));
                game.setBlackTimeRemaining(game.getBlackTimeRemaining() + 
                        game.getIncrementSeconds() * 1000L);
            }
        }
    }

    private void updatePlayerRatings(Game game) {
        if (game.getWhitePlayer() == null || game.getBlackPlayer() == null) {
            return;
        }

        User white = game.getWhitePlayer();
        User black = game.getBlackPlayer();

        int whiteRating = white.getRating();
        int blackRating = black.getRating();

        // ELO calculation
        double expectedWhite = 1.0 / (1.0 + Math.pow(10, (blackRating - whiteRating) / 400.0));
        double expectedBlack = 1.0 - expectedWhite;

        double actualWhite, actualBlack;
        switch (game.getResult()) {
            case WHITE_WINS:
            case BLACK_TIMEOUT:
            case BLACK_RESIGNED:
                actualWhite = 1.0;
                actualBlack = 0.0;
                white.setWins(white.getWins() + 1);
                black.setLosses(black.getLosses() + 1);
                break;
            case BLACK_WINS:
            case WHITE_TIMEOUT:
            case WHITE_RESIGNED:
                actualWhite = 0.0;
                actualBlack = 1.0;
                white.setLosses(white.getLosses() + 1);
                black.setWins(black.getWins() + 1);
                break;
            default:
                actualWhite = 0.5;
                actualBlack = 0.5;
                white.setDraws(white.getDraws() + 1);
                black.setDraws(black.getDraws() + 1);
        }

        int K = 32; // K-factor
        int whiteChange = (int) Math.round(K * (actualWhite - expectedWhite));
        int blackChange = (int) Math.round(K * (actualBlack - expectedBlack));

        white.setRating(Math.max(100, whiteRating + whiteChange));
        black.setRating(Math.max(100, blackRating + blackChange));

        white.setGamesPlayed(white.getGamesPlayed() + 1);
        black.setGamesPlayed(black.getGamesPlayed() + 1);

        game.setWhiteRatingChange(whiteChange);
        game.setBlackRatingChange(blackChange);

        userRepository.save(white);
        userRepository.save(black);
    }

    private void startGameTimer(Game game) {
        GameTimer timer = new GameTimer(game.getId(), this);
        gameTimers.put(game.getId(), timer);
        timer.start();
    }

    private void stopGameTimer(String gameId) {
        GameTimer timer = gameTimers.remove(gameId);
        if (timer != null) {
            timer.stop();
        }
    }

    @Transactional
    public void handleTimeout(String gameId) {
        Optional<Game> optGame = gameRepository.findById(gameId);
        if (optGame.isEmpty()) return;

        Game game = optGame.get();
        if (game.getStatus() != Game.GameStatus.ACTIVE) return;

        // Determine who timed out
        boolean whiteTimeout = game.getWhiteTimeRemaining() <= 0;

        game.setStatus(Game.GameStatus.COMPLETED);
        game.setResult(whiteTimeout ? Game.GameResult.WHITE_TIMEOUT : Game.GameResult.BLACK_TIMEOUT);
        game.setEndedAt(LocalDateTime.now());

        updatePlayerRatings(game);
        gameRepository.save(game);

        GameMessage timeoutMessage = GameMessage.builder()
                .type(GameMessage.MessageType.TIMEOUT)
                .gameId(gameId)
                .status(game.getStatus())
                .result(game.getResult())
                .message((whiteTimeout ? "White" : "Black") + " ran out of time")
                .build();

        messagingTemplate.convertAndSend("/topic/game/" + gameId, timeoutMessage);
    }

    // Inner class for game timer
    private static class GameTimer {
        private final String gameId;
        private final GameService gameService;
        private volatile boolean running = false;
        private Thread timerThread;

        public GameTimer(String gameId, GameService gameService) {
            this.gameId = gameId;
            this.gameService = gameService;
        }

        public void start() {
            running = true;
            timerThread = new Thread(() -> {
                while (running) {
                    try {
                        Thread.sleep(1000);
                        // Check for timeout periodically
                        // In production, use a more sophisticated timer
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            });
            timerThread.setDaemon(true);
            timerThread.start();
        }

        public void stop() {
            running = false;
            if (timerThread != null) {
                timerThread.interrupt();
            }
        }
    }
}
