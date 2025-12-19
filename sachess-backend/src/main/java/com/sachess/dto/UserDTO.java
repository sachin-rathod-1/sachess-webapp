package com.sachess.dto;

import com.sachess.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String username;
    private String email;
    private int rating;
    private int gamesPlayed;
    private int wins;
    private int losses;
    private int draws;
    private String avatar;
    private boolean isOnline;

    public static UserDTO fromUser(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .rating(user.getRating())
                .gamesPlayed(user.getGamesPlayed())
                .wins(user.getWins())
                .losses(user.getLosses())
                .draws(user.getDraws())
                .avatar(user.getAvatar())
                .isOnline(user.isOnline())
                .build();
    }
}
