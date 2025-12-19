package com.sachess.controller;

import com.sachess.dto.GameDTO;
import com.sachess.dto.MoveRequest;
import com.sachess.entity.User;
import com.sachess.service.GameService;
import com.sachess.service.MatchmakingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;
    private final MatchmakingService matchmakingService;

    @PostMapping("/create")
    public ResponseEntity<GameDTO> createGame(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Integer> request) {
        int timeControl = request.getOrDefault("timeControl", 10);
        int increment = request.getOrDefault("increment", 0);
        GameDTO game = gameService.createGame(user.getId(), timeControl, increment);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/{gameId}/join")
    public ResponseEntity<GameDTO> joinGame(
            @PathVariable String gameId,
            @AuthenticationPrincipal User user) {
        try {
            GameDTO game = gameService.joinGame(gameId, user.getId());
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{gameId}/move")
    public ResponseEntity<GameDTO> makeMove(
            @PathVariable String gameId,
            @AuthenticationPrincipal User user,
            @RequestBody MoveRequest moveRequest) {
        try {
            moveRequest.setGameId(gameId);
            moveRequest.setPlayerId(user.getId());
            GameDTO game = gameService.makeMove(moveRequest);
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{gameId}/resign")
    public ResponseEntity<GameDTO> resign(
            @PathVariable String gameId,
            @AuthenticationPrincipal User user) {
        try {
            GameDTO game = gameService.resign(gameId, user.getId());
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{gameId}/draw/offer")
    public ResponseEntity<GameDTO> offerDraw(
            @PathVariable String gameId,
            @AuthenticationPrincipal User user) {
        try {
            GameDTO game = gameService.offerDraw(gameId, user.getId());
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{gameId}/draw/accept")
    public ResponseEntity<GameDTO> acceptDraw(
            @PathVariable String gameId,
            @AuthenticationPrincipal User user) {
        try {
            GameDTO game = gameService.acceptDraw(gameId, user.getId());
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{gameId}/draw/decline")
    public ResponseEntity<GameDTO> declineDraw(
            @PathVariable String gameId,
            @AuthenticationPrincipal User user) {
        try {
            GameDTO game = gameService.declineDraw(gameId, user.getId());
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<GameDTO> getGame(@PathVariable String gameId) {
        try {
            GameDTO game = gameService.getGame(gameId);
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<GameDTO>> getActiveGames() {
        return ResponseEntity.ok(gameService.getActiveGames());
    }

    @GetMapping("/waiting")
    public ResponseEntity<List<GameDTO>> getWaitingGames() {
        return ResponseEntity.ok(gameService.getWaitingGames());
    }

    @GetMapping("/my-games")
    public ResponseEntity<List<GameDTO>> getMyGames(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(gameService.getPlayerGames(user.getId()));
    }

    @PostMapping("/{gameId}/analyze")
    public ResponseEntity<Void> analyzePosition(
            @PathVariable String gameId,
            @RequestBody Map<String, String> request) {
        String fen = request.get("fen");
        if (fen != null) {
            gameService.analyzePosition(gameId, fen);
        }
        return ResponseEntity.ok().build();
    }

    // Matchmaking endpoints
    @PostMapping("/matchmaking/join")
    public ResponseEntity<Void> joinMatchmaking(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Integer> request) {
        int timeControl = request.getOrDefault("timeControl", 10);
        int increment = request.getOrDefault("increment", 0);
        matchmakingService.joinQueue(user.getId(), timeControl, increment);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/matchmaking/leave")
    public ResponseEntity<Void> leaveMatchmaking(@AuthenticationPrincipal User user) {
        matchmakingService.leaveQueue(user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/matchmaking/status")
    public ResponseEntity<Map<String, Object>> getMatchmakingStatus() {
        return ResponseEntity.ok(Map.of(
                "queueSize", matchmakingService.getQueueSize()
        ));
    }

    // Invitation endpoints
    @PostMapping("/invite/create")
    public ResponseEntity<Map<String, String>> createInvitation(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Integer> request) {
        int timeControl = request.getOrDefault("timeControl", 10);
        int increment = request.getOrDefault("increment", 0);
        String code = matchmakingService.createInvitation(user.getId(), timeControl, increment);
        return ResponseEntity.ok(Map.of("code", code));
    }

    @PostMapping("/invite/{code}/accept")
    public ResponseEntity<GameDTO> acceptInvitation(
            @PathVariable String code,
            @AuthenticationPrincipal User user) {
        try {
            GameDTO game = matchmakingService.acceptInvitation(code, user.getId());
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/invite/{code}/cancel")
    public ResponseEntity<Void> cancelInvitation(
            @PathVariable String code,
            @AuthenticationPrincipal User user) {
        matchmakingService.cancelInvitation(code, user.getId());
        return ResponseEntity.ok().build();
    }
}
