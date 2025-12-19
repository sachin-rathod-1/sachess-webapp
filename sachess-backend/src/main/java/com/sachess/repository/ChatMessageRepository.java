package com.sachess.repository;

import com.sachess.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    
    List<ChatMessage> findByGameIdOrderByTimestampAsc(String gameId);
    
    List<ChatMessage> findTop50ByGameIdOrderByTimestampDesc(String gameId);
}
