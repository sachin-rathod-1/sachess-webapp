# saChess Web Application

A real-time chess platform with multiplayer gameplay, puzzle creation, social networking, and global rankings — available as a web and mobile app.

## Features

### User System
- Sign up/login (email + social media)
- Profile page with stats
- Progress tracking
- Daily streak counter

### Online Gameplay Features
- Online multiplayer games with real-time matchmaking
- Play with friends: Challenge friends and invite them to matches
- Real-time chat during gameplay
- Friends system: Add friends, view their profiles, and track progress
- Leaderboards and global rankings
- User profiles with chess statistics

### Puzzle Functionality
- Daily puzzles (new each day)
- Puzzle categories (tactics, endgames, openings)
- Difficulty levels (beginner to grandmaster)
- Hint system (limited uses)
- Solution explanation after solving
- Time attack mode (solve puzzles against clock)

### Training Features
- Theme-based training (pins, forks, skewers etc.)
- Personalized recommendations based on weaknesses
- Rating system that adjusts to user skill
- Milestone badges for achievements

## Tech Stack

### Frontend
- React.js for web interface
- React Router for navigation
- Axios for API communication
- Custom chessboard implementation
- Material-UI for UI components
- Responsive design for mobile and desktop

### Backend (to be implemented)
- Java with Spring Boot
- JWT authentication
- RESTful API design
- PostgreSQL database
- Responsive design for both mobile and desktop
- Stockfish integration for puzzle validation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/sachin-rathod-1/sachess-webapp.git

cd chess-puzzles-web
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Backend Setup (Coming Soon)

Instructions for setting up the Spring Boot backend will be provided in a separate repository.

## Future Enhancements

- Mobile app using React Native
- Advanced analytics dashboard
- Social features (friends, challenges)
- Tournament mode
- Integration with popular chess platforms (Lichess, Chess.com)


## Acknowledgments

- [Chess.js](https://github.com/jhlywa/chess.js) for chess move validation
- [Stockfish](https://stockfishchess.org/) for chess engine analysis
- Open-source puzzle databases
