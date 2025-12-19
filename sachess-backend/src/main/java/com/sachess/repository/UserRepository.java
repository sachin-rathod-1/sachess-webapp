package com.sachess.repository;

import com.sachess.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);
    
    List<User> findByIsOnlineTrue();
    
    @Query("SELECT u FROM User u ORDER BY u.rating DESC")
    List<User> findTopByRating();
    
    @Query("SELECT u FROM User u ORDER BY u.rating DESC LIMIT ?1")
    List<User> findTopPlayers(int limit);
}
