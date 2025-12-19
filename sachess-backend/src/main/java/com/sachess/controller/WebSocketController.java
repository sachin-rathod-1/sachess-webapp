package com.sachess.controller;

import com.sachess.dto.ChatMessageDTO;
import com.sachess.dto.GameMessage;
import com.sachess.dto.MoveRequest;
import com.sachess.service.ChatService;
import com.sachess.service.GameService;
import com.sachess.service.MatchmakingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final GameService gameService;
    private final ChatService chatService;
    private final MatchmakingService matchmakingService;

    @MessageMapping("/game/{gameId}/move")
    public void handleMove(
            @DestinationVariable String gameId,
            @Payload MoveRequest moveRequest,
            Principal principal) {
        try {
            moveRequest.setGameId(gameId);
            if (principal != null) {
                moveRequest.setPlayerId(principal.getName());
            }
            gameService.makeMove(moveRequest);
        } catch (Exception e) {
            log.error("Error processing move: {}", e.getMessage());
        }
    }

    @MessageMapping("/game/{gameId}/resign")
    public void handleResign(
            @DestinationVariable String gameId,
            Principal principal) {
        try {
            if (principal != null) {
                gameService.resign(gameId, principal.getName());
            }
        } catch (Exception e) {
            log.error("Error processing resignation: {}", e.getMessage());
        }
    }

    @MessageMapping("/game/{gameId}/draw/offer")
    public void handleDrawOffer(
            @DestinationVariable String gameId,
            Principal principal) {
        try {
            if (principal != null) {
                gameService.offerDraw(gameId, principal.getName());
            }
        } catch (Exception e) {
            log.error("Error processing draw offer: {}", e.getMessage());
        }
    }

    @MessageMapping("/game/{gameId}/draw/accept")
    public void handleDrawAccept(
            @DestinationVariable String gameId,
            Principal principal) {
        try {
            if (principal != null) {
                gameService.acceptDraw(gameId, principal.getName());
            }
        } catch (Exception e) {
            log.error("Error accepting draw: {}", e.getMessage());
        }
    }

    @MessageMapping("/game/{gameId}/draw/decline")
    public void handleDrawDecline(
            @DestinationVariable String gameId,
            Principal principal) {
        try {
            if (principal != null) {
                gameService.declineDraw(gameId, principal.getName());
            }
        } catch (Exception e) {
            log.error("Error declining draw: {}", e.getMessage());
        }
    }

    @MessageMapping("/game/{gameId}/analyze")
    public void handleAnalyzeRequest(
            @DestinationVariable String gameId,
            @Payload Map<String, String> request) {
        String fen = request.get("fen");
        if (fen != null) {
            gameService.analyzePosition(gameId, fen);
        }
    }

    @MessageMapping("/chat/{gameId}")
    public void handleChatMessage(
            @DestinationVariable String gameId,
            @Payload Map<String, String> message,
            Principal principal) {
        try {
            if (principal != null) {
                String content = message.get("content");
                chatService.sendMessage(gameId, principal.getName(), content);
            }
        } catch (Exception e) {
            log.error("Error processing chat message: {}", e.getMessage());
        }
    }

    @MessageMapping("/matchmaking/join")
    public void handleJoinMatchmaking(
            @Payload Map<String, Integer> request,
            Principal principal) {
        try {
            if (principal != null) {
                int timeControl = request.getOrDefault("timeControl", 10);
                int increment = request.getOrDefault("increment", 0);
                matchmakingService.joinQueue(principal.getName(), timeControl, increment);
            }
        } catch (Exception e) {
            log.error("Error joining matchmaking: {}", e.getMessage());
        }
    }

    @MessageMapping("/matchmaking/leave")
    public void handleLeaveMatchmaking(Principal principal) {
        try {
            if (principal != null) {
                matchmakingService.leaveQueue(principal.getName());
            }
        } catch (Exception e) {
            log.error("Error leaving matchmaking: {}", e.getMessage());
        }
    }
}
