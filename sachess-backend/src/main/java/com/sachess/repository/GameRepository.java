package com.sachess.repository;

import com.sachess.entity.Game;
import com.sachess.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, String> {
    
    List<Game> findByStatus(Game.GameStatus status);
    
    List<Game> findByWhitePlayerOrBlackPlayer(User whitePlayer, User blackPlayer);
    
    @Query("SELECT g FROM Game g WHERE g.whitePlayer.id = ?1 OR g.blackPlayer.id = ?1 ORDER BY g.createdAt DESC")
    List<Game> findByPlayerId(String playerId);
    
    @Query("SELECT g FROM Game g WHERE g.status = 'ACTIVE' ORDER BY g.createdAt DESC")
    List<Game> findActiveGames();
    
    @Query("SELECT g FROM Game g WHERE g.status = 'WAITING' ORDER BY g.createdAt ASC")
    List<Game> findWaitingGames();
    
    @Query("SELECT g FROM Game g WHERE (g.whitePlayer.id = ?1 OR g.blackPlayer.id = ?1) AND g.status = 'COMPLETED' ORDER BY g.endedAt DESC")
    List<Game> findCompletedGamesByPlayer(String playerId);
}
