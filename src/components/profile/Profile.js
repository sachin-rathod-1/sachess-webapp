import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    puzzlesSolved: 0,
    currentRating: 1200,
    highestRating: 1200,
    streakDays: 0,
    totalTime: 0,
    averageTime: 0,
    completionRate: 0,
    hintsUsed: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch data from the backend
    // For now, we'll use mock data
    const fetchUserData = () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        // Mock user data
        const mockUser = {
          id: '123',
          name: 'Chess Enthusiast',
          email: 'chess@example.com',
          avatar: 'https://via.placeholder.com/150',
          memberSince: '2023-01-15'
        };
        
        // Mock stats
        const mockStats = {
          puzzlesSolved: 247,
          currentRating: 1450,
          highestRating: 1520,
          streakDays: 12,
          totalTime: 54320, // in seconds
          averageTime: 220, // in seconds
          completionRate: 78, // percentage
          hintsUsed: 53
        };
        
        // Mock recent activity
        const mockActivity = [
          { id: 1, type: 'puzzle', result: 'success', rating: 1400, date: '2023-05-10T14:30:00Z', timeSpent: 145 },
          { id: 2, type: 'puzzle', result: 'failed', rating: 1550, date: '2023-05-09T10:15:00Z', timeSpent: 210 },
          { id: 3, type: 'daily', result: 'success', rating: 1300, date: '2023-05-08T09:45:00Z', timeSpent: 180 },
          { id: 4, type: 'training', result: 'success', theme: 'Pins', date: '2023-05-07T16:20:00Z', timeSpent: 320 },
          { id: 5, type: 'puzzle', result: 'success', rating: 1420, date: '2023-05-06T11:10:00Z', timeSpent: 165 }
        ];
        
        // Mock achievements
        const mockAchievements = [
          { id: 1, name: 'First Steps', description: 'Solve your first puzzle', date: '2023-01-16T10:30:00Z', icon: '🏆' },
          { id: 2, name: 'Streak Master', description: 'Maintain a 7-day streak', date: '2023-02-05T14:20:00Z', icon: '🔥' },
          { id: 3, name: 'Tactical Genius', description: 'Solve 10 puzzles rated above 1500', date: '2023-03-12T09:15:00Z', icon: '🧠' },
          { id: 4, name: 'Speed Demon', description: 'Solve 5 puzzles in under 30 seconds each', date: '2023-04-20T16:45:00Z', icon: '⚡' }
        ];
        
        setUser(mockUser);
        setStats(mockStats);
        setRecentActivity(mockActivity);
        setAchievements(mockAchievements);
        setLoading(false);
      }, 1000);
    };
    
    fetchUserData();
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={user.avatar} alt={user.name} />
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-member-since">Member since {formatDate(user.memberSince)}</p>
        </div>
      </div>
      
      <div className="profile-stats-container">
        <h2>Your Stats</h2>
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.puzzlesSolved}</div>
            <div className="stat-label">Puzzles Solved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.currentRating}</div>
            <div className="stat-label">Current Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.streakDays}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>
        
        <div className="profile-detailed-stats">
          <div className="detailed-stat">
            <span className="detailed-stat-label">Highest Rating:</span>
            <span className="detailed-stat-value">{stats.highestRating}</span>
          </div>
          <div className="detailed-stat">
            <span className="detailed-stat-label">Total Time Spent:</span>
            <span className="detailed-stat-value">{formatTime(stats.totalTime)}</span>
          </div>
          <div className="detailed-stat">
            <span className="detailed-stat-label">Average Solve Time:</span>
            <span className="detailed-stat-value">{formatTime(stats.averageTime)}</span>
          </div>
          <div className="detailed-stat">
            <span className="detailed-stat-label">Hints Used:</span>
            <span className="detailed-stat-value">{stats.hintsUsed}</span>
          </div>
        </div>
      </div>
      
      <div className="profile-achievements">
        <h2>Achievements</h2>
        <div className="achievements-list">
          {achievements.map(achievement => (
            <div key={achievement.id} className="achievement-card">
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-details">
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
                <span className="achievement-date">Earned on {formatDate(achievement.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="profile-recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.map(activity => (
            <div key={activity.id} className="activity-card">
              <div className={`activity-result ${activity.result}`}>
                {activity.result === 'success' ? '✓' : '✗'}
              </div>
              <div className="activity-details">
                <div className="activity-type">
                  {activity.type === 'puzzle' && 'Puzzle'}
                  {activity.type === 'daily' && 'Daily Puzzle'}
                  {activity.type === 'training' && `Training (${activity.theme})`}
                </div>
                <div className="activity-info">
                  {activity.rating && <span>Rating: {activity.rating}</span>}
                  <span>Time: {formatTime(activity.timeSpent)}</span>
                </div>
                <div className="activity-date">{formatDate(activity.date)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;