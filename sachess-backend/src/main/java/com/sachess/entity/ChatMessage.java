package com.sachess.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String gameId;

    @Column(nullable = false)
    private String senderId;

    @Column(nullable = false)
    private String senderUsername;

    @Column(nullable = false, length = 1000)
    private String content;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MessageType type = MessageType.CHAT;

    public enum MessageType {
        CHAT,
        SYSTEM,
        DRAW_OFFER,
        DRAW_ACCEPT,
        DRAW_DECLINE,
        RESIGN,
        GAME_START,
        GAME_END
    }
}
