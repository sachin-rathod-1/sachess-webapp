// Opening Explorer Service - Shows popular moves and statistics
class OpeningExplorer {
  constructor() {
    this.cache = new Map();
    this.lichessAPI = 'https://explorer.lichess.ovh';
    this.openingDatabase = this.initializeOpeningDatabase();
  }

  // Initialize with common openings
  initializeOpeningDatabase() {
    return {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': {
        name: 'Starting Position',
        eco: 'A00',
        moves: [
          { move: 'e2e4', san: 'e4', percentage: 45, wins: 48, draws: 30, losses: 22, games: 1000000 },
          { move: 'd2d4', san: 'd4', percentage: 35, wins: 46, draws: 32, losses: 22, games: 800000 },
          { move: 'g1f3', san: 'Nf3', percentage: 10, wins: 45, draws: 33, losses: 22, games: 200000 },
          { move: 'c2c4', san: 'c4', percentage: 5, wins: 44, draws: 34, losses: 22, games: 100000 },
          { move: 'b1c3', san: 'Nc3', percentage: 2, wins: 43, draws: 32, losses: 25, games: 40000 }
        ]
      },
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': {
        name: 'Kings Pawn',
        eco: 'B00',
        moves: [
          { move: 'e7e5', san: 'e5', percentage: 35, wins: 22, draws: 30, losses: 48, games: 500000 },
          { move: 'c7c5', san: 'c5', percentage: 25, wins: 24, draws: 32, losses: 44, games: 350000 },
          { move: 'e7e6', san: 'e6', percentage: 15, wins: 23, draws: 33, losses: 44, games: 200000 },
          { move: 'c7c6', san: 'c6', percentage: 10, wins: 25, draws: 31, losses: 44, games: 150000 },
          { move: 'd7d5', san: 'd5', percentage: 8, wins: 26, draws: 30, losses: 44, games: 100000 }
        ]
      },
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': {
        name: 'Queens Pawn',
        eco: 'A40',
        moves: [
          { move: 'd7d5', san: 'd5', percentage: 35, wins: 22, draws: 32, losses: 46, games: 450000 },
          { move: 'g8f6', san: 'Nf6', percentage: 30, wins: 23, draws: 33, losses: 44, games: 400000 },
          { move: 'e7e6', san: 'e6', percentage: 15, wins: 24, draws: 31, losses: 45, games: 200000 },
          { move: 'f7f5', san: 'f5', percentage: 8, wins: 25, draws: 28, losses: 47, games: 100000 },
          { move: 'c7c6', san: 'c6', percentage: 5, wins: 23, draws: 32, losses: 45, games: 60000 }
        ]
      }
    };
  }

  async getMovesForPosition(fen, options = {}) {
    const {
      source = 'master', // 'master', 'lichess', 'player'
      speeds = ['classical', 'rapid', 'blitz'],
      ratings = [1600, 1800, 2000, 2200, 2500],
      playerName = null
    } = options;

    // Check cache first
    const cacheKey = `${fen}-${source}-${speeds.join(',')}-${ratings.join(',')}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Check local database
    if (this.openingDatabase[fen]) {
      return this.formatLocalData(this.openingDatabase[fen]);
    }

    try {
      // For production, make API call to Lichess
      // const response = await fetch(`${this.lichessAPI}/${source}?fen=${encodeURIComponent(fen)}&speeds=${speeds.join(',')}&ratings=${ratings.join(',')}`);
      // const data = await response.json();
      
      // For now, return mock data
      const data = this.generateMockData(fen);
      
      // Cache the result
      this.cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Failed to fetch opening data:', error);
      return this.generateMockData(fen);
    }
  }

  formatLocalData(data) {
    const totalGames = data.moves.reduce((sum, m) => sum + m.games, 0);
    
    return {
      opening: data.name,
      eco: data.eco,
      moves: data.moves.map(move => ({
        uci: move.move,
        san: move.san,
        white: move.wins,
        draws: move.draws,
        black: move.losses,
        averageRating: 1900,
        games: move.games,
        percentage: (move.games / totalGames * 100).toFixed(1)
      })),
      topGames: [],
      recentGames: []
    };
  }

  generateMockData(fen) {
    // Generate realistic mock data for any position
    const moves = this.generatePossibleMoves(fen);
    const totalGames = Math.floor(Math.random() * 100000) + 10000;
    
    const mockMoves = moves.slice(0, 5).map((move, index) => {
      const games = Math.floor(totalGames * Math.pow(0.5, index));
      const winRate = 35 + Math.random() * 30;
      const drawRate = 20 + Math.random() * 20;
      
      return {
        uci: move.from + move.to,
        san: move.san,
        white: Math.floor(games * winRate / 100),
        draws: Math.floor(games * drawRate / 100),
        black: Math.floor(games * (100 - winRate - drawRate) / 100),
        averageRating: 1800 + Math.floor(Math.random() * 400),
        games: games,
        percentage: (games / totalGames * 100).toFixed(1)
      };
    });

    return {
      opening: this.getOpeningName(fen),
      eco: this.getECOCode(fen),
      moves: mockMoves,
      topGames: [],
      recentGames: []
    };
  }

  generatePossibleMoves(fen) {
    // Use chess.js to generate legal moves
    const { Chess } = require('chess.js');
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    
    return moves.map(move => ({
      from: move.from,
      to: move.to,
      san: move.san,
      promotion: move.promotion
    }));
  }

  getOpeningName(fen) {
    // Simplified opening recognition
    const moveCount = fen.split(' ')[5];
    
    if (moveCount === '1') {
      return 'Starting Position';
    } else if (fen.includes('e4') && moveCount === '2') {
      return "King's Pawn Game";
    } else if (fen.includes('d4') && moveCount === '2') {
      return "Queen's Pawn Game";
    } else if (fen.includes('Nf3') && moveCount === '2') {
      return "Réti Opening";
    } else if (fen.includes('c4') && moveCount === '2') {
      return "English Opening";
    }
    
    return 'Unknown Opening';
  }

  getECOCode(fen) {
    // Simplified ECO code assignment
    const moveCount = parseInt(fen.split(' ')[5]);
    
    if (moveCount <= 1) return 'A00';
    if (fen.includes('e4')) {
      if (fen.includes('e5')) return 'C20';
      if (fen.includes('c5')) return 'B20';
      if (fen.includes('e6')) return 'C00';
      if (fen.includes('c6')) return 'B10';
      return 'B00';
    }
    if (fen.includes('d4')) {
      if (fen.includes('d5')) return 'D00';
      if (fen.includes('Nf6')) return 'A45';
      return 'A40';
    }
    if (fen.includes('c4')) return 'A10';
    if (fen.includes('Nf3')) return 'A04';
    
    return 'A00';
  }

  async getGamesByOpening(opening, options = {}) {
    // Fetch games that started with a specific opening
    const { limit = 10, playerName = null } = options;
    
    // Mock implementation
    return {
      games: [],
      total: 0
    };
  }

  async getOpeningTree(startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', depth = 3) {
    // Build an opening tree from a starting position
    const tree = {
      fen: startingFen,
      data: await this.getMovesForPosition(startingFen),
      children: []
    };
    
    if (depth > 0 && tree.data.moves.length > 0) {
      // Only explore top 3 moves
      const topMoves = tree.data.moves.slice(0, 3);
      
      for (const move of topMoves) {
        // Apply move to get new position
        const { Chess } = require('chess.js');
        const chess = new Chess(startingFen);
        chess.move(move.san);
        const newFen = chess.fen();
        
        const child = await this.getOpeningTree(newFen, depth - 1);
        tree.children.push({
          move: move.san,
          ...child
        });
      }
    }
    
    return tree;
  }

  getOpeningRepertoire(color = 'white') {
    // Return a curated opening repertoire
    const whiteRepertoire = [
      { opening: "King's Pawn", moves: ['e4'], description: "Direct play for the center" },
      { opening: "Queen's Pawn", moves: ['d4'], description: "Solid and strategic" },
      { opening: "English Opening", moves: ['c4'], description: "Flexible and transpositional" },
      { opening: "Reti Opening", moves: ['Nf3', 'g3'], description: "Hypermodern approach" }
    ];
    
    const blackRepertoire = [
      { opening: "Sicilian Defense", moves: ['c5'], description: "Counter-attacking defense against e4" },
      { opening: "French Defense", moves: ['e6'], description: "Solid defense against e4" },
      { opening: "King's Indian Defense", moves: ['Nf6', 'g6'], description: "Dynamic defense against d4" },
      { opening: "Slav Defense", moves: ['d5', 'c6'], description: "Solid defense against d4" }
    ];
    
    return color === 'white' ? whiteRepertoire : blackRepertoire;
  }

  clearCache() {
    this.cache.clear();
  }
}

// Singleton instance
let explorerInstance = null;

export const getOpeningExplorer = () => {
  if (!explorerInstance) {
    explorerInstance = new OpeningExplorer();
  }
  return explorerInstance;
};

export default OpeningExplorer;
