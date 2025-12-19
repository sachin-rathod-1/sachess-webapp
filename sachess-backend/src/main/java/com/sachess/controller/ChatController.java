package com.sachess.controller;

import com.sachess.dto.ChatMessageDTO;
import com.sachess.entity.User;
import com.sachess.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/{gameId}")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @PathVariable String gameId,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        try {
            String content = request.get("content");
            ChatMessageDTO message = chatService.sendMessage(gameId, user.getId(), content);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(@PathVariable String gameId) {
        return ResponseEntity.ok(chatService.getGameMessages(gameId));
    }

    @GetMapping("/{gameId}/recent")
    public ResponseEntity<List<ChatMessageDTO>> getRecentMessages(@PathVariable String gameId) {
        return ResponseEntity.ok(chatService.getRecentMessages(gameId));
    }
}
