// Stockfish Engine Integration for Analysis
class StockfishEngine {
  constructor() {
    this.engine = null;
    this.isReady = false;
    this.onMessage = null;
    this.depth = 20;
    this.multiPV = 3;
    this.evalCache = new Map();
  }

  async init() {
    return new Promise((resolve, reject) => {
      try {
        // Load Stockfish.js web worker
        this.engine = new Worker('/stockfish/stockfish.js');
        
        this.engine.onmessage = (e) => {
          const message = e.data;
          
          if (message === 'uciok') {
            this.isReady = true;
            this.setupEngine();
            resolve();
          }
          
          if (this.onMessage) {
            this.onMessage(message);
          }
        };
        
        this.engine.postMessage('uci');
      } catch (error) {
        console.error('Failed to initialize Stockfish:', error);
        reject(error);
      }
    });
  }

  setupEngine() {
    // Configure engine options
    this.engine.postMessage('setoption name MultiPV value ' + this.multiPV);
    this.engine.postMessage('setoption name Threads value 2');
    this.engine.postMessage('setoption name Hash value 128');
    this.engine.postMessage('setoption name Ponder value false');
    this.engine.postMessage('isready');
  }

  analyze(fen, depth = this.depth, moveTime = null) {
    return new Promise((resolve) => {
      if (!this.isReady) {
        resolve({ error: 'Engine not ready' });
        return;
      }

      // Check cache first
      const cacheKey = `${fen}-${depth}`;
      if (this.evalCache.has(cacheKey)) {
        resolve(this.evalCache.get(cacheKey));
        return;
      }

      const analysis = {
        fen,
        depth: 0,
        score: null,
        mate: null,
        bestMove: null,
        pv: [],
        lines: []
      };

      const messageHandler = (message) => {
        if (typeof message !== 'string') return;

        // Parse depth
        const depthMatch = message.match(/depth (\d+)/);
        if (depthMatch) {
          analysis.depth = parseInt(depthMatch[1]);
        }

        // Parse score
        const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
        if (scoreMatch) {
          if (scoreMatch[1] === 'cp') {
            analysis.score = parseInt(scoreMatch[2]) / 100; // Convert centipawns to pawns
          } else {
            analysis.mate = parseInt(scoreMatch[2]);
          }
        }

        // Parse principal variation
        const pvMatch = message.match(/pv (.+)/);
        if (pvMatch) {
          const moves = pvMatch[1].split(' ');
          const pvLine = {
            moves,
            score: analysis.score,
            mate: analysis.mate,
            depth: analysis.depth
          };
          
          // Handle MultiPV
          const multiPvMatch = message.match(/multipv (\d+)/);
          if (multiPvMatch) {
            const pvIndex = parseInt(multiPvMatch[1]) - 1;
            analysis.lines[pvIndex] = pvLine;
          } else {
            analysis.pv = moves;
            analysis.bestMove = moves[0];
          }
        }

        // Check if analysis is complete
        if (message.startsWith('bestmove')) {
          const bestMoveMatch = message.match(/bestmove (\w+)/);
          if (bestMoveMatch) {
            analysis.bestMove = bestMoveMatch[1];
          }
          
          this.onMessage = null;
          
          // Cache the result
          this.evalCache.set(cacheKey, analysis);
          
          resolve(analysis);
        }
      };

      this.onMessage = messageHandler;
      this.engine.postMessage('position fen ' + fen);
      
      if (moveTime) {
        this.engine.postMessage(`go movetime ${moveTime}`);
      } else {
        this.engine.postMessage(`go depth ${depth}`);
      }
    });
  }

  getBestMove(fen, depth = 15) {
    return this.analyze(fen, depth).then(analysis => analysis.bestMove);
  }

  evaluatePosition(fen) {
    return this.analyze(fen, 20).then(analysis => ({
      score: analysis.score,
      mate: analysis.mate,
      bestMove: analysis.bestMove
    }));
  }

  getTopMoves(fen, numMoves = 3, depth = 20) {
    const oldMultiPV = this.multiPV;
    this.multiPV = numMoves;
    this.setupEngine();
    
    return this.analyze(fen, depth).then(analysis => {
      this.multiPV = oldMultiPV;
      this.setupEngine();
      return analysis.lines;
    });
  }

  stop() {
    if (this.engine) {
      this.engine.postMessage('stop');
    }
  }

  quit() {
    if (this.engine) {
      this.engine.postMessage('quit');
      this.engine.terminate();
      this.engine = null;
      this.isReady = false;
    }
  }

  // Clear evaluation cache
  clearCache() {
    this.evalCache.clear();
  }
}

// Singleton instance
let engineInstance = null;

export const getStockfish = async () => {
  if (!engineInstance) {
    engineInstance = new StockfishEngine();
    await engineInstance.init();
  }
  return engineInstance;
};

export default StockfishEngine;
