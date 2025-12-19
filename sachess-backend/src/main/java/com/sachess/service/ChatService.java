package com.sachess.service;

import com.sachess.dto.ChatMessageDTO;
import com.sachess.entity.ChatMessage;
import com.sachess.entity.User;
import com.sachess.repository.ChatMessageRepository;
import com.sachess.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatMessageDTO sendMessage(String gameId, String senderId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Basic content moderation
        String sanitizedContent = sanitizeMessage(content);
        if (sanitizedContent.isEmpty()) {
            throw new RuntimeException("Message cannot be empty");
        }

        ChatMessage message = ChatMessage.builder()
                .gameId(gameId)
                .senderId(senderId)
                .senderUsername(sender.getUsername())
                .content(sanitizedContent)
                .timestamp(LocalDateTime.now())
                .type(ChatMessage.MessageType.CHAT)
                .build();

        message = chatMessageRepository.save(message);

        ChatMessageDTO dto = ChatMessageDTO.fromEntity(message);

        // Broadcast to game channel
        messagingTemplate.convertAndSend("/topic/chat/" + gameId, dto);

        log.debug("Chat message sent in game {}: {} - {}", gameId, sender.getUsername(), sanitizedContent);

        return dto;
    }

    public ChatMessageDTO sendSystemMessage(String gameId, String content, ChatMessage.MessageType type) {
        ChatMessage message = ChatMessage.builder()
                .gameId(gameId)
                .senderId("SYSTEM")
                .senderUsername("System")
                .content(content)
                .timestamp(LocalDateTime.now())
                .type(type)
                .build();

        message = chatMessageRepository.save(message);

        ChatMessageDTO dto = ChatMessageDTO.fromEntity(message);

        messagingTemplate.convertAndSend("/topic/chat/" + gameId, dto);

        return dto;
    }

    public List<ChatMessageDTO> getGameMessages(String gameId) {
        return chatMessageRepository.findByGameIdOrderByTimestampAsc(gameId)
                .stream()
                .map(ChatMessageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> getRecentMessages(String gameId) {
        List<ChatMessage> messages = chatMessageRepository.findTop50ByGameIdOrderByTimestampDesc(gameId);
        // Reverse to get chronological order
        return messages.stream()
                .sorted((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()))
                .map(ChatMessageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private String sanitizeMessage(String content) {
        if (content == null) return "";

        // Trim and limit length
        String sanitized = content.trim();
        if (sanitized.length() > 500) {
            sanitized = sanitized.substring(0, 500);
        }

        // Basic profanity filter (simplified - in production use a proper library)
        // This is just a placeholder
        sanitized = sanitized.replaceAll("(?i)\\b(badword1|badword2)\\b", "***");

        return sanitized;
    }
}
