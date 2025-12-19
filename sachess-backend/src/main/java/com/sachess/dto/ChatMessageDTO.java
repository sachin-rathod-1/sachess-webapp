package com.sachess.dto;

import com.sachess.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private String id;
    private String gameId;
    private String senderId;
    private String senderUsername;
    private String content;
    private LocalDateTime timestamp;
    private ChatMessage.MessageType type;

    public static ChatMessageDTO fromEntity(ChatMessage message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .gameId(message.getGameId())
                .senderId(message.getSenderId())
                .senderUsername(message.getSenderUsername())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .type(message.getType())
                .build();
    }
}
