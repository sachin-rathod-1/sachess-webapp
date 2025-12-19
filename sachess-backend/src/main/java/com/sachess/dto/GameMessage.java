package com.sachess.dto;

import com.sachess.entity.Game;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameMessage {
    private MessageType type;
    private String gameId;
    private String playerId;
    private String playerUsername;
    private String from;
    private String to;
    private String promotion;
    private String fen;
    private String pgn;
    private Game.GameStatus status;
    private Game.GameResult result;
    private Game.Color currentTurn;
    private long whiteTimeRemaining;
    private long blackTimeRemaining;
    private String message;
    private AnalysisResult analysis;

    public enum MessageType {
        MOVE,
        GAME_START,
        GAME_END,
        DRAW_OFFER,
        DRAW_ACCEPT,
        DRAW_DECLINE,
        RESIGN,
        TIMEOUT,
        PLAYER_JOINED,
        PLAYER_LEFT,
        ERROR,
        ANALYSIS
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalysisResult {
        private String bestMove;
        private int evaluation; // Centipawns
        private String pv; // Principal variation
        private int depth;
        private String mate; // Mate in X moves
    }
}
