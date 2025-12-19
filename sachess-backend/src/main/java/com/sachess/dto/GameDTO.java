package com.sachess.dto;

import com.sachess.entity.Game;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameDTO {
    private String id;
    private PlayerInfo whitePlayer;
    private PlayerInfo blackPlayer;
    private String currentFen;
    private String pgn;
    private List<String> moves;
    private Game.GameStatus status;
    private Game.GameResult result;
    private Game.Color currentTurn;
    private int timeControlMinutes;
    private int incrementSeconds;
    private long whiteTimeRemaining;
    private long blackTimeRemaining;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerInfo {
        private String id;
        private String username;
        private int rating;
        private String avatar;
    }

    public static GameDTO fromGame(Game game) {
        GameDTO.GameDTOBuilder builder = GameDTO.builder()
                .id(game.getId())
                .currentFen(game.getCurrentFen())
                .pgn(game.getPgn())
                .moves(game.getMoves())
                .status(game.getStatus())
                .result(game.getResult())
                .currentTurn(game.getCurrentTurn())
                .timeControlMinutes(game.getTimeControlMinutes())
                .incrementSeconds(game.getIncrementSeconds())
                .whiteTimeRemaining(game.getWhiteTimeRemaining())
                .blackTimeRemaining(game.getBlackTimeRemaining())
                .createdAt(game.getCreatedAt())
                .startedAt(game.getStartedAt());

        if (game.getWhitePlayer() != null) {
            builder.whitePlayer(PlayerInfo.builder()
                    .id(game.getWhitePlayer().getId())
                    .username(game.getWhitePlayer().getUsername())
                    .rating(game.getWhitePlayer().getRating())
                    .avatar(game.getWhitePlayer().getAvatar())
                    .build());
        }

        if (game.getBlackPlayer() != null) {
            builder.blackPlayer(PlayerInfo.builder()
                    .id(game.getBlackPlayer().getId())
                    .username(game.getBlackPlayer().getUsername())
                    .rating(game.getBlackPlayer().getRating())
                    .avatar(game.getBlackPlayer().getAvatar())
                    .build());
        }

        return builder.build();
    }
}
