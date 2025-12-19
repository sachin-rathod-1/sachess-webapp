package com.sachess.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "games")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "white_player_id")
    private User whitePlayer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "black_player_id")
    private User blackPlayer;

    @Column(length = 100)
    @Builder.Default
    private String currentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    @Column(length = 10000)
    @Builder.Default
    private String pgn = "";

    @ElementCollection
    @CollectionTable(name = "game_moves", joinColumns = @JoinColumn(name = "game_id"))
    @Column(name = "move")
    @Builder.Default
    private List<String> moves = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private GameStatus status = GameStatus.WAITING;

    @Enumerated(EnumType.STRING)
    private GameResult result;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Color currentTurn = Color.WHITE;

    @Builder.Default
    private int timeControlMinutes = 10;

    @Builder.Default
    private int incrementSeconds = 0;

    @Builder.Default
    private long whiteTimeRemaining = 600000; // milliseconds

    @Builder.Default
    private long blackTimeRemaining = 600000;

    private LocalDateTime lastMoveTime;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    private int whiteRatingChange;

    private int blackRatingChange;

    public enum GameStatus {
        WAITING,      // Waiting for opponent
        ACTIVE,       // Game in progress
        COMPLETED,    // Game finished normally
        ABANDONED,    // Player disconnected
        DRAW_OFFERED, // Draw has been offered
        ABORTED       // Game aborted before moves
    }

    public enum GameResult {
        WHITE_WINS,
        BLACK_WINS,
        DRAW,
        STALEMATE,
        WHITE_TIMEOUT,
        BLACK_TIMEOUT,
        WHITE_RESIGNED,
        BLACK_RESIGNED,
        ABORTED
    }

    public enum Color {
        WHITE, BLACK
    }
}
