package com.sachess.service;

import com.sachess.dto.GameDTO;
import com.sachess.entity.User;
import com.sachess.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchmakingService {

    private final GameService gameService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Queue for players waiting for a match
    private final Queue<QueuedPlayer> matchmakingQueue = new ConcurrentLinkedQueue<>();
    
    // Map of pending game invitations
    private final Map<String, GameInvitation> pendingInvitations = new ConcurrentHashMap<>();

    public void joinQueue(String playerId, int timeControl, int increment) {
        // Remove if already in queue
        matchmakingQueue.removeIf(p -> p.playerId.equals(playerId));

        User user = userRepository.findById(playerId).orElse(null);
        if (user == null) return;

        QueuedPlayer player = new QueuedPlayer(
                playerId,
                user.getUsername(),
                user.getRating(),
                timeControl,
                increment,
                System.currentTimeMillis()
        );

        matchmakingQueue.add(player);
        log.info("Player {} joined matchmaking queue", user.getUsername());

        // Try to find a match immediately
        tryMatch(player);
    }

    public void leaveQueue(String playerId) {
        matchmakingQueue.removeIf(p -> p.playerId.equals(playerId));
        log.info("Player {} left matchmaking queue", playerId);
    }

    @Scheduled(fixedRate = 2000)
    public void processMatchmaking() {
        List<QueuedPlayer> players = new ArrayList<>(matchmakingQueue);
        Set<String> matched = new HashSet<>();

        for (int i = 0; i < players.size(); i++) {
            QueuedPlayer p1 = players.get(i);
            if (matched.contains(p1.playerId)) continue;

            for (int j = i + 1; j < players.size(); j++) {
                QueuedPlayer p2 = players.get(j);
                if (matched.contains(p2.playerId)) continue;

                if (isCompatibleMatch(p1, p2)) {
                    createMatch(p1, p2);
                    matched.add(p1.playerId);
                    matched.add(p2.playerId);
                    break;
                }
            }
        }

        // Remove matched players from queue
        matchmakingQueue.removeIf(p -> matched.contains(p.playerId));
    }

    private boolean isCompatibleMatch(QueuedPlayer p1, QueuedPlayer p2) {
        // Same time control
        if (p1.timeControl != p2.timeControl || p1.increment != p2.increment) {
            return false;
        }

        // Rating difference check (expands over time)
        long waitTime = Math.min(
                System.currentTimeMillis() - p1.joinedAt,
                System.currentTimeMillis() - p2.joinedAt
        );

        // Start with 100 rating difference, expand by 50 every 10 seconds
        int allowedDiff = 100 + (int) (waitTime / 10000) * 50;
        allowedDiff = Math.min(allowedDiff, 500); // Cap at 500

        return Math.abs(p1.rating - p2.rating) <= allowedDiff;
    }

    private void tryMatch(QueuedPlayer newPlayer) {
        for (QueuedPlayer waiting : matchmakingQueue) {
            if (!waiting.playerId.equals(newPlayer.playerId) && isCompatibleMatch(newPlayer, waiting)) {
                createMatch(newPlayer, waiting);
                matchmakingQueue.remove(waiting);
                matchmakingQueue.remove(newPlayer);
                return;
            }
        }
    }

    private void createMatch(QueuedPlayer p1, QueuedPlayer p2) {
        // Randomly assign colors
        boolean p1IsWhite = Math.random() < 0.5;
        QueuedPlayer white = p1IsWhite ? p1 : p2;
        QueuedPlayer black = p1IsWhite ? p2 : p1;

        // Create the game
        GameDTO game = gameService.createGame(white.playerId, white.timeControl, white.increment);
        
        // Join the second player
        GameDTO joinedGame = gameService.joinGame(game.getId(), black.playerId);

        log.info("Match created: {} vs {} (Game: {})", white.username, black.username, game.getId());

        // Notify both players
        MatchFoundMessage matchMessage = new MatchFoundMessage(
                joinedGame.getId(),
                white.playerId,
                white.username,
                black.playerId,
                black.username,
                white.timeControl,
                white.increment
        );

        messagingTemplate.convertAndSendToUser(white.playerId, "/queue/matchmaking", matchMessage);
        messagingTemplate.convertAndSendToUser(black.playerId, "/queue/matchmaking", matchMessage);
    }

    // Game invitation methods
    public String createInvitation(String fromPlayerId, int timeControl, int increment) {
        User fromUser = userRepository.findById(fromPlayerId).orElse(null);
        if (fromUser == null) return null;

        String inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        GameInvitation invitation = new GameInvitation(
                inviteCode,
                fromPlayerId,
                fromUser.getUsername(),
                fromUser.getRating(),
                timeControl,
                increment,
                System.currentTimeMillis()
        );

        pendingInvitations.put(inviteCode, invitation);
        log.info("Game invitation created: {} by {}", inviteCode, fromUser.getUsername());

        return inviteCode;
    }

    public GameDTO acceptInvitation(String inviteCode, String acceptingPlayerId) {
        GameInvitation invitation = pendingInvitations.remove(inviteCode);
        if (invitation == null) {
            throw new RuntimeException("Invalid or expired invitation code");
        }

        if (invitation.fromPlayerId.equals(acceptingPlayerId)) {
            throw new RuntimeException("Cannot accept your own invitation");
        }

        // Check if invitation is expired (15 minutes)
        if (System.currentTimeMillis() - invitation.createdAt > 15 * 60 * 1000) {
            throw new RuntimeException("Invitation has expired");
        }

        // Randomly assign colors
        boolean inviterIsWhite = Math.random() < 0.5;
        String whitePlayerId = inviterIsWhite ? invitation.fromPlayerId : acceptingPlayerId;
        String blackPlayerId = inviterIsWhite ? acceptingPlayerId : invitation.fromPlayerId;

        // Create and start the game
        GameDTO game = gameService.createGame(whitePlayerId, invitation.timeControl, invitation.increment);
        GameDTO joinedGame = gameService.joinGame(game.getId(), blackPlayerId);

        // Notify the inviter
        User acceptingUser = userRepository.findById(acceptingPlayerId).orElse(null);
        String acceptingUsername = acceptingUser != null ? acceptingUser.getUsername() : "Unknown";

        MatchFoundMessage matchMessage = new MatchFoundMessage(
                joinedGame.getId(),
                whitePlayerId,
                inviterIsWhite ? invitation.fromUsername : acceptingUsername,
                blackPlayerId,
                inviterIsWhite ? acceptingUsername : invitation.fromUsername,
                invitation.timeControl,
                invitation.increment
        );

        messagingTemplate.convertAndSendToUser(invitation.fromPlayerId, "/queue/matchmaking", matchMessage);

        log.info("Invitation {} accepted by {}", inviteCode, acceptingUsername);

        return joinedGame;
    }

    public void cancelInvitation(String inviteCode, String playerId) {
        GameInvitation invitation = pendingInvitations.get(inviteCode);
        if (invitation != null && invitation.fromPlayerId.equals(playerId)) {
            pendingInvitations.remove(inviteCode);
            log.info("Invitation {} cancelled", inviteCode);
        }
    }

    public int getQueueSize() {
        return matchmakingQueue.size();
    }

    public List<QueuedPlayer> getQueueStatus() {
        return new ArrayList<>(matchmakingQueue);
    }

    // Clean up expired invitations periodically
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredInvitations() {
        long now = System.currentTimeMillis();
        pendingInvitations.entrySet().removeIf(entry -> 
                now - entry.getValue().createdAt > 15 * 60 * 1000);
    }

    // Inner classes
    public record QueuedPlayer(
            String playerId,
            String username,
            int rating,
            int timeControl,
            int increment,
            long joinedAt
    ) {}

    public record GameInvitation(
            String code,
            String fromPlayerId,
            String fromUsername,
            int fromRating,
            int timeControl,
            int increment,
            long createdAt
    ) {}

    public record MatchFoundMessage(
            String gameId,
            String whitePlayerId,
            String whiteUsername,
            String blackPlayerId,
            String blackUsername,
            int timeControl,
            int increment
    ) {}
}
