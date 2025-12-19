package com.sachess.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String id;
    private String username;
    private String email;
    private int rating;
    private int gamesPlayed;
    private int wins;
    private int losses;
    private int draws;
    private String avatar;
}
