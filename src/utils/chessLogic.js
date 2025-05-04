// Basic chess move validation
// Note: This is a simplified version and doesn't handle all chess rules
// For a production app, consider using a chess library like chess.js

// Check if a move is valid
export const isValidMove = (piece, fromRow, fromCol, toRow, toCol, board) => {
  if (!piece) return false;
  
  // Can't move to a square with a piece of the same color
  const targetPiece = board[toRow][toCol];
  if (targetPiece && isPieceOfSameColor(piece, targetPiece)) {
    return false;
  }
  
  const pieceType = piece.toLowerCase();
  
  switch (pieceType) {
    case 'p': // Pawn
      return isValidPawnMove(piece, fromRow, fromCol, toRow, toCol, board);
    case 'r': // Rook
      return isValidRookMove(fromRow, fromCol, toRow, toCol, board);
    case 'n': // Knight
      return isValidKnightMove(fromRow, fromCol, toRow, toCol);
    case 'b': // Bishop
      return isValidBishopMove(fromRow, fromCol, toRow, toCol, board);
    case 'q': // Queen
      return isValidQueenMove(fromRow, fromCol, toRow, toCol, board);
    case 'k': // King
      return isValidKingMove(fromRow, fromCol, toRow, toCol);
    default:
      return false;
  }
};

// Check if two pieces are of the same color
const isPieceOfSameColor = (piece1, piece2) => {
  return (piece1.toLowerCase() === piece1 && piece2.toLowerCase() === piece2) || 
         (piece1.toUpperCase() === piece1 && piece2.toUpperCase() === piece2);
};

// Pawn move validation
const isValidPawnMove = (piece, fromRow, fromCol, toRow, toCol, board) => {
  const isWhite = piece === piece.toUpperCase();
  const direction = isWhite ? -1 : 1; // White pawns move up, black pawns move down
  const startRow = isWhite ? 6 : 1;
  
  // Forward move (no capture)
  if (fromCol === toCol) {
    // One square forward
    if (toRow === fromRow + direction && !board[toRow][toCol]) {
      return true;
    }
    
    // Two squares forward from starting position
    if (fromRow === startRow && 
        toRow === fromRow + 2 * direction && 
        !board[fromRow + direction][fromCol] && 
        !board[toRow][toCol]) {
      return true;
    }
  }
  
  // Diagonal capture
  if ((toCol === fromCol - 1 || toCol === fromCol + 1) && 
      toRow === fromRow + direction) {
    const targetPiece = board[toRow][toCol];
    if (targetPiece && !isPieceOfSameColor(piece, targetPiece)) {
      return true;
    }
    // En passant would be checked here in a full implementation
  }
  
  return false;
};

// Rook move validation
const isValidRookMove = (fromRow, fromCol, toRow, toCol, board) => {
  // Rooks move horizontally or vertically
  if (fromRow !== toRow && fromCol !== toCol) {
    return false;
  }
  
  // Check if path is clear
  if (fromRow === toRow) {
    // Horizontal move
    const start = Math.min(fromCol, toCol) + 1;
    const end = Math.max(fromCol, toCol);
    
    for (let col = start; col < end; col++) {
      if (board[fromRow][col]) {
        return false; // Path is blocked
      }
    }
  } else {
    // Vertical move
    const start = Math.min(fromRow, toRow) + 1;
    const end = Math.max(fromRow, toRow);
    
    for (let row = start; row < end; row++) {
      if (board[row][fromCol]) {
        return false; // Path is blocked
      }
    }
  }
  
  return true;
};

// Knight move validation
const isValidKnightMove = (fromRow, fromCol, toRow, toCol) => {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  
  // Knights move in an L-shape: 2 squares in one direction and 1 square perpendicular
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
};

// Bishop move validation
const isValidBishopMove = (fromRow, fromCol, toRow, toCol, board) => {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  
  // Bishops move diagonally
  if (rowDiff !== colDiff) {
    return false;
  }
  
  // Check if path is clear
  const rowDirection = toRow > fromRow ? 1 : -1;
  const colDirection = toCol > fromCol ? 1 : -1;
  
  for (let i = 1; i < rowDiff; i++) {
    const row = fromRow + i * rowDirection;
    const col = fromCol + i * colDirection;
    
    if (board[row][col]) {
      return false; // Path is blocked
    }
  }
  
  return true;
};

// Queen move validation
const isValidQueenMove = (fromRow, fromCol, toRow, toCol, board) => {
  // Queens can move like rooks or bishops
  return isValidRookMove(fromRow, fromCol, toRow, toCol, board) || 
         isValidBishopMove(fromRow, fromCol, toRow, toCol, board);
};

// King move validation
const isValidKingMove = (fromRow, fromCol, toRow, toCol) => {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  
  // Kings move one square in any direction
  return rowDiff <= 1 && colDiff <= 1;
  
  // Castling would be checked here in a full implementation
};

// Make a move on the board
export const makeMove = (fromRow, fromCol, toRow, toCol, board) => {
  const newBoard = [...board.map(row => [...row])];
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;
  
  // Handle pawn promotion (simplified - always promotes to queen)
  const piece = newBoard[toRow][toCol];
  if (piece && piece.toLowerCase() === 'p') {
    if ((piece === 'P' && toRow === 0) || (piece === 'p' && toRow === 7)) {
      newBoard[toRow][toCol] = piece === 'P' ? 'Q' : 'q';
    }
  }
  
  return newBoard;
};

// Get all possible moves for a piece
export const getPossibleMoves = (piece, row, col, board) => {
  if (!piece) return [];
  
  const possibleMoves = [];
  
  // Check all squares on the board
  for (let toRow = 0; toRow < 8; toRow++) {
    for (let toCol = 0; toCol < 8; toCol++) {
      if (isValidMove(piece, row, col, toRow, toCol, board)) {
        possibleMoves.push([toRow, toCol]);
      }
    }
  }
  
  return possibleMoves;
};

// Convert FEN to board representation
export const fenToBoard = (fen) => {
  const fenParts = fen.split(' ');
  const boardPart = fenParts[0];
  const rows = boardPart.split('/');
  
  const boardArray = [];
  
  for (let i = 0; i < 8; i++) {
    const row = [];
    let j = 0;
    
    for (let char of rows[i]) {
      if (/[1-8]/.test(char)) {
        const emptyCount = parseInt(char);
        for (let k = 0; k < emptyCount; k++) {
          row.push(null);
          j++;
        }
      } else {
        row.push(char);
        j++;
      }
    }
    
    boardArray.push(row);
  }
  
  return boardArray;
};

// Convert board representation to FEN
export const boardToFen = (board) => {
  let fen = '';
  
  for (let row = 0; row < 8; row++) {
    let emptyCount = 0;
    
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      
      if (piece) {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        fen += piece;
      } else {
        emptyCount++;
      }
    }
    
    if (emptyCount > 0) {
      fen += emptyCount;
    }
    
    if (row < 7) {
      fen += '/';
    }
  }
  
  // Add other FEN components (simplified)
  fen += ' w - - 0 1';
  
  return fen;
};