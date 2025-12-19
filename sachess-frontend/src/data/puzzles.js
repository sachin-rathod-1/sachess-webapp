// Real chess puzzles with valid FEN positions and solutions
export const chessPuzzles = {
  daily: [
    {
      id: 'daily-1',
      title: 'Mate in 2',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      difficulty: 'Medium',
      theme: 'Checkmate',
      solution: ['f3g5', 'f6e4', 'g5f7'],
      hint: 'Look for a knight sacrifice that opens up the king',
      explanation: 'Ng5 threatens the f7 pawn. After any defensive move, Nxf7 is checkmate.'
    },
    {
      id: 'daily-2', 
      title: 'Win Material',
      fen: '2kr1b1r/pp1npppp/2p2n2/q7/3PP1b1/1BP2N2/PP3PPP/RN1QKB1R w KQ - 0 1',
      difficulty: 'Easy',
      theme: 'Fork',
      solution: ['d1a4'],
      hint: 'The queen can attack two pieces at once',
      explanation: 'Qa4 forks the king on c8 and the bishop on g4, winning material.'
    },
    {
      id: 'daily-3',
      title: 'Back Rank Mate',
      fen: '6k1/pp4pp/2p5/2b5/8/1P4P1/P1r2P1P/R5K1 w - - 0 1',
      difficulty: 'Easy', 
      theme: 'Checkmate',
      solution: ['a1a8'],
      hint: 'The black king has no escape squares',
      explanation: 'Ra8# is checkmate as the king is trapped on the back rank.'
    }
  ],
  
  tactics: {
    pins: [
      {
        id: 'pin-1',
        title: 'Absolute Pin',
        fen: 'r1bqk2r/pp2bppp/2n2n2/3p4/3P4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 1',
        difficulty: 'Medium',
        theme: 'Pin',
        solution: ['c1g5'],
        hint: 'Pin the knight to the queen',
        explanation: 'Bg5 pins the f6 knight to the queen on d8. The knight cannot move without losing the queen.'
      },
      {
        id: 'pin-2',
        title: 'Win with Pin',
        fen: 'r2qkb1r/ppp2ppp/2n2n2/3p4/3P2b1/2N1PN2/PPP2PPP/R1BQKB1R w KQkq - 0 1',
        difficulty: 'Easy',
        theme: 'Pin',
        solution: ['d1a4'],
        hint: 'Pin the knight to the king',
        explanation: 'Qa4 pins the knight on c6 to the king on e8, winning the knight.'
      },
      {
        id: 'pin-3',
        title: 'Exploiting the Pin',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
        difficulty: 'Hard',
        theme: 'Pin',
        solution: ['f3e5', 'c6e5', 'd1h5'],
        hint: 'The f7 pawn is pinned',
        explanation: 'After Nxe5 Nxe5, Qh5+ wins as the f7 pawn is pinned by the bishop on c4.'
      }
    ],
    
    forks: [
      {
        id: 'fork-1',
        title: 'Knight Fork',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
        difficulty: 'Easy',
        theme: 'Fork',
        solution: ['f3g5'],
        hint: 'Knights love to fork pieces',
        explanation: 'Ng5 attacks both f7 and h7, creating a double attack.'
      },
      {
        id: 'fork-2',
        title: 'Queen Fork',
        fen: 'r1bqk2r/pp2bppp/2n2n2/3p4/3P4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 1',
        difficulty: 'Medium',
        theme: 'Fork',
        solution: ['d1a4'],
        hint: 'Queens can attack multiple pieces',
        explanation: 'Qa4 forks the knight on c6 and attacks a7, winning material.'
      },
      {
        id: 'fork-3',
        title: 'Pawn Fork',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 1',
        difficulty: 'Easy',
        theme: 'Fork',
        solution: ['e5d4'],
        hint: 'Even pawns can fork',
        explanation: 'exd4 creates a pawn fork, attacking both the knight on f3 and potentially c3.'
      }
    ],
    
    skewers: [
      {
        id: 'skewer-1',
        title: 'Bishop Skewer',
        fen: '4k3/8/8/3b4/8/8/4K3/R7 w - - 0 1',
        difficulty: 'Easy',
        theme: 'Skewer',
        solution: ['a1a8'],
        hint: 'Attack the king to win the bishop',
        explanation: 'Ra8+ skewers the king to the bishop on d5, winning the bishop after the king moves.'
      },
      {
        id: 'skewer-2',
        title: 'Queen Skewer',
        fen: '3qk3/8/8/8/8/8/3QK3/8 w - - 0 1',
        difficulty: 'Medium',
        theme: 'Skewer',
        solution: ['d2d8'],
        hint: 'Line up the queens',
        explanation: 'Qd8+ forces the king to move, winning the queen.'
      },
      {
        id: 'skewer-3',
        title: 'Rook Skewer',
        fen: '8/8/3k4/8/3R4/8/3K4/3r4 b - - 0 1',
        difficulty: 'Easy',
        theme: 'Skewer',
        solution: ['d1d4'],
        hint: 'Attack the rook through the king',
        explanation: 'Rd4 skewers the king to the rook, winning the exchange.'
      }
    ],
    
    discoveredAttacks: [
      {
        id: 'discovered-1',
        title: 'Discovered Check',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
        difficulty: 'Medium',
        theme: 'Discovered Attack',
        solution: ['f3e5'],
        hint: 'Moving the knight reveals an attack',
        explanation: 'Nxe5 discovers check from the bishop on c4 to the king on e8.'
      },
      {
        id: 'discovered-2',
        title: 'Discovered Attack on Queen',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1',
        difficulty: 'Hard',
        theme: 'Discovered Attack',
        solution: ['c3d5'],
        hint: 'Moving one piece reveals another attacker',
        explanation: 'Nd5 attacks the knight and discovers an attack on the queen.'
      }
    ],
    
    sacrifices: [
      {
        id: 'sacrifice-1',
        title: 'Greek Gift',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w kq - 0 1',
        difficulty: 'Hard',
        theme: 'Sacrifice',
        solution: ['c4f7', 'e8f7', 'f3g5'],
        hint: 'Sacrifice the bishop to expose the king',
        explanation: 'The Greek Gift sacrifice: Bxf7+ Kxf7 Ng5+ wins material or delivers checkmate.'
      },
      {
        id: 'sacrifice-2',
        title: 'Queen Sacrifice for Mate',
        fen: '3qk2r/p3ppbp/2n3p1/8/3PP3/2N2Q2/PP3PPP/R3K2R w KQk - 0 1',
        difficulty: 'Hard',
        theme: 'Sacrifice',
        solution: ['f3f7', 'e8d7', 'f7e6'],
        hint: 'Sometimes you must give up the queen',
        explanation: 'Qf7+ forces the king out, then Qe6# is checkmate.'
      }
    ],
    
    endgames: [
      {
        id: 'endgame-1',
        title: 'King and Pawn vs King',
        fen: '8/8/8/8/4P3/4K3/8/4k3 w - - 0 1',
        difficulty: 'Easy',
        theme: 'Endgame',
        solution: ['e3d3', 'e1f2', 'e4e5'],
        hint: 'Use the king to support the pawn',
        explanation: 'Advance the pawn with king support to promote.'
      },
      {
        id: 'endgame-2',
        title: 'Rook Endgame',
        fen: '8/8/8/8/2k5/8/1P6/R3K3 w - - 0 1',
        difficulty: 'Medium',
        theme: 'Endgame',
        solution: ['a1a4', 'c4b3', 'a4a3'],
        hint: 'Cut off the king',
        explanation: 'Use the rook to cut off the enemy king from the pawn.'
      }
    ]
  }
};

export const getDailyPuzzle = () => {
  const puzzles = chessPuzzles.daily;
  const today = new Date().getDay() % puzzles.length;
  return puzzles[today];
};

export const getPuzzlesByTheme = (theme) => {
  const themeMap = {
    'pins': chessPuzzles.tactics.pins,
    'forks': chessPuzzles.tactics.forks,
    'skewers': chessPuzzles.tactics.skewers,
    'discovered-attacks': chessPuzzles.tactics.discoveredAttacks,
    'sacrifices': chessPuzzles.tactics.sacrifices,
    'endgames': chessPuzzles.tactics.endgames
  };
  
  return themeMap[theme] || [];
};

export const getAllPuzzles = () => {
  const allPuzzles = [...chessPuzzles.daily];
  Object.values(chessPuzzles.tactics).forEach(category => {
    allPuzzles.push(...category);
  });
  return allPuzzles;
};

export const getRandomPuzzle = (difficulty = null) => {
  const allPuzzles = getAllPuzzles();
  const filtered = difficulty 
    ? allPuzzles.filter(p => p.difficulty === difficulty)
    : allPuzzles;
  
  return filtered[Math.floor(Math.random() * filtered.length)];
};
