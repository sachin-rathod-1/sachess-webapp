package com.sachess.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoveRequest {
    private String gameId;
    private String from;
    private String to;
    private String promotion; // For pawn promotion: q, r, b, n
    private String playerId;
}
