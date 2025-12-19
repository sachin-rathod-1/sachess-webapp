package com.sachess.controller;

import com.sachess.dto.UserDTO;
import com.sachess.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getLeaderboard(
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(userService.getLeaderboard(Math.min(limit, 100)));
    }
}
