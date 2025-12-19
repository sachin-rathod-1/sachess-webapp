// Game Database Service - Stores and manages chess games
class GameDatabase {
  constructor() {
    this.dbName = 'SaChessGamesDB';
    this.dbVersion = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Games store
        if (!db.objectStoreNames.contains('games')) {
          const gamesStore = db.createObjectStore('games', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // Indexes for efficient queries
          gamesStore.createIndex('date', 'date', { unique: false });
          gamesStore.createIndex('white', 'white', { unique: false });
          gamesStore.createIndex('black', 'black', { unique: false });
          gamesStore.createIndex('result', 'result', { unique: false });
          gamesStore.createIndex('opening', 'opening', { unique: false });
          gamesStore.createIndex('eco', 'eco', { unique: false });
        }
        
        // Analysis store
        if (!db.objectStoreNames.contains('analysis')) {
          const analysisStore = db.createObjectStore('analysis', { 
            keyPath: 'gameId' 
          });
          analysisStore.createIndex('date', 'date', { unique: false });
        }
        
        // Opening book store
        if (!db.objectStoreNames.contains('openings')) {
          const openingsStore = db.createObjectStore('openings', { 
            keyPath: 'position' 
          });
          openingsStore.createIndex('frequency', 'frequency', { unique: false });
        }
      };
    });
  }

  // Save a game to database
  async saveGame(gameData) {
    const transaction = this.db.transaction(['games'], 'readwrite');
    const store = transaction.objectStore('games');
    
    const game = {
      date: new Date().toISOString(),
      white: gameData.white || 'Anonymous',
      black: gameData.black || 'Anonymous',
      result: gameData.result || '*',
      pgn: gameData.pgn,
      fen: gameData.fen,
      moves: gameData.moves || [],
      opening: gameData.opening || 'Unknown',
      eco: gameData.eco || '',
      timeControl: gameData.timeControl || 'unlimited',
      rating: gameData.rating || null,
      analysis: gameData.analysis || null,
      tags: gameData.tags || [],
      ...gameData
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(game);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all games
  async getAllGames() {
    const transaction = this.db.transaction(['games'], 'readonly');
    const store = transaction.objectStore('games');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get games by player
  async getGamesByPlayer(playerName) {
    const transaction = this.db.transaction(['games'], 'readonly');
    const store = transaction.objectStore('games');
    
    const games = [];
    
    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const game = cursor.value;
          if (game.white === playerName || game.black === playerName) {
            games.push(game);
          }
          cursor.continue();
        } else {
          resolve(games);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Get games by date range
  async getGamesByDateRange(startDate, endDate) {
    const transaction = this.db.transaction(['games'], 'readonly');
    const store = transaction.objectStore('games');
    const index = store.index('date');
    
    const range = IDBKeyRange.bound(startDate, endDate);
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(range);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete a game
  async deleteGame(gameId) {
    const transaction = this.db.transaction(['games'], 'readwrite');
    const store = transaction.objectStore('games');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(gameId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Save analysis for a game
  async saveAnalysis(gameId, analysisData) {
    const transaction = this.db.transaction(['analysis'], 'readwrite');
    const store = transaction.objectStore('analysis');
    
    const analysis = {
      gameId,
      date: new Date().toISOString(),
      engineEvaluations: analysisData.evaluations || [],
      blunders: analysisData.blunders || [],
      mistakes: analysisData.mistakes || [],
      inaccuracies: analysisData.inaccuracies || [],
      bestMoves: analysisData.bestMoves || [],
      accuracy: analysisData.accuracy || { white: 0, black: 0 },
      ...analysisData
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(analysis);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get analysis for a game
  async getAnalysis(gameId) {
    const transaction = this.db.transaction(['analysis'], 'readonly');
    const store = transaction.objectStore('analysis');
    
    return new Promise((resolve, reject) => {
      const request = store.get(gameId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Save opening statistics
  async updateOpeningStats(position, move, result) {
    const transaction = this.db.transaction(['openings'], 'readwrite');
    const store = transaction.objectStore('openings');
    
    return new Promise(async (resolve, reject) => {
      const getRequest = store.get(position);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        
        if (existing) {
          // Update existing opening stats
          const moveStats = existing.moves[move] || { 
            count: 0, 
            wins: 0, 
            draws: 0, 
            losses: 0 
          };
          
          moveStats.count++;
          if (result === '1-0') moveStats.wins++;
          else if (result === '0-1') moveStats.losses++;
          else if (result === '1/2-1/2') moveStats.draws++;
          
          existing.moves[move] = moveStats;
          existing.frequency++;
          
          const updateRequest = store.put(existing);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          // Create new opening entry
          const newEntry = {
            position,
            frequency: 1,
            moves: {
              [move]: { 
                count: 1, 
                wins: result === '1-0' ? 1 : 0,
                draws: result === '1/2-1/2' ? 1 : 0,
                losses: result === '0-1' ? 1 : 0
              }
            }
          };
          
          const addRequest = store.add(newEntry);
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = () => reject(addRequest.error);
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Get opening statistics for a position
  async getOpeningStats(position) {
    const transaction = this.db.transaction(['openings'], 'readonly');
    const store = transaction.objectStore('openings');
    
    return new Promise((resolve, reject) => {
      const request = store.get(position);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Export all games as PGN
  async exportAllGames() {
    const games = await this.getAllGames();
    const pgns = games.map(game => game.pgn).join('\n\n');
    
    const blob = new Blob([pgns], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sachess_games_${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import games from PGN
  async importPGN(pgnText) {
    // Split multiple games
    const games = pgnText.split(/\n\n(?=\[)/);
    const imported = [];
    
    for (const gamePgn of games) {
      if (gamePgn.trim()) {
        try {
          // Parse PGN headers
          const headers = {};
          const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g;
          let match;
          
          while ((match = headerRegex.exec(gamePgn)) !== null) {
            headers[match[1]] = match[2];
          }
          
          const gameData = {
            pgn: gamePgn,
            white: headers.White || 'Unknown',
            black: headers.Black || 'Unknown',
            result: headers.Result || '*',
            date: headers.Date || new Date().toISOString(),
            opening: headers.Opening || '',
            eco: headers.ECO || '',
            event: headers.Event || '',
            site: headers.Site || ''
          };
          
          const gameId = await this.saveGame(gameData);
          imported.push(gameId);
        } catch (error) {
          console.error('Failed to import game:', error);
        }
      }
    }
    
    return imported;
  }

  // Get game statistics
  async getStatistics() {
    const games = await this.getAllGames();
    
    const stats = {
      totalGames: games.length,
      wins: { white: 0, black: 0 },
      draws: 0,
      openings: {},
      averageLength: 0,
      timeControls: {},
      dates: {}
    };
    
    let totalMoves = 0;
    
    games.forEach(game => {
      // Results
      if (game.result === '1-0') stats.wins.white++;
      else if (game.result === '0-1') stats.wins.black++;
      else if (game.result === '1/2-1/2') stats.draws++;
      
      // Openings
      if (game.opening) {
        stats.openings[game.opening] = (stats.openings[game.opening] || 0) + 1;
      }
      
      // Move count
      if (game.moves) {
        totalMoves += game.moves.length;
      }
      
      // Time controls
      if (game.timeControl) {
        stats.timeControls[game.timeControl] = (stats.timeControls[game.timeControl] || 0) + 1;
      }
      
      // Dates
      const date = new Date(game.date).toISOString().split('T')[0];
      stats.dates[date] = (stats.dates[date] || 0) + 1;
    });
    
    stats.averageLength = games.length > 0 ? Math.round(totalMoves / games.length) : 0;
    
    return stats;
  }
}

// Singleton instance
let dbInstance = null;

export const getGameDatabase = async () => {
  if (!dbInstance) {
    dbInstance = new GameDatabase();
    await dbInstance.init();
  }
  return dbInstance;
};

export default GameDatabase;
