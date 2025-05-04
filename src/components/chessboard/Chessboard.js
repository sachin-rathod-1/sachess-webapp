import React, { useState, useEffect } from 'react';
import './Chessboard.css';
import { isValidMove, makeMove, getPossibleMoves } from '../../utils/chessLogic';

const Chessboard = ({ 
  fen, 
  onMove, 
  orientation = 'white',
  allowMoves = true,
  showHints = false,
  correctMoves = []
}) => {
  const [board, setBoard] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [lastMove, setLastMove] = useState(null);

  // Parse FEN string and set up the board
  useEffect(() => {
    if (fen) {
      const parsedBoard = parseFen(fen);
      setBoard(parsedBoard);
    }
  }, [fen]);

  // Parse FEN string to board representation
  const parseFen = (fen) => {
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

  // Handle square click
  const handleSquareClick = (row, col) => {
    if (!allowMoves) return;
    
    const piece = board[row][col];
    
    // If a square is already selected
    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      const selectedPiece = board[selectedRow][selectedCol];
      
      // If clicking on the same square, deselect it
      if (selectedRow === row && selectedCol === col) {
        setSelectedSquare(null);
        setHighlightedSquares([]);
        return;
      }
      
      // If clicking on a different square, try to move the piece
      if (isValidMove(selectedPiece, selectedRow, selectedCol, row, col, board)) {
        const newBoard = makeMove(selectedRow, selectedCol, row, col, [...board]);
        setBoard(newBoard);
        setLastMove({ from: [selectedRow, selectedCol], to: [row, col] });
        setSelectedSquare(null);
        setHighlightedSquares([]);
        
        // Convert to algebraic notation and call the onMove callback
        const fromSquare = `${String.fromCharCode(97 + selectedCol)}${8 - selectedRow}`;
        const toSquare = `${String.fromCharCode(97 + col)}${8 - row}`;
        onMove && onMove(`${fromSquare}${toSquare}`);
      } 
      // If clicking on another piece of the same color, select that piece instead
      else if (piece && isPieceOfSameColor(selectedPiece, piece)) {
        setSelectedSquare([row, col]);
        const moves = getPossibleMoves(piece, row, col, board);
        setHighlightedSquares(moves);
      } 
      // If clicking on an invalid square, deselect
      else {
        setSelectedSquare(null);
        setHighlightedSquares([]);
      }
    } 
    // If no square is selected and clicking on a piece, select it
    else if (piece) {
      setSelectedSquare([row, col]);
      const moves = getPossibleMoves(piece, row, col, board);
      setHighlightedSquares(moves);
    }
  };

  // Check if two pieces are of the same color
  const isPieceOfSameColor = (piece1, piece2) => {
    return (piece1.toLowerCase() === piece1 && piece2.toLowerCase() === piece2) || 
           (piece1.toUpperCase() === piece1 && piece2.toUpperCase() === piece2);
  };

  // Get piece image
  const getPieceImage = (piece) => {
    if (!piece) return null;
    
    const color = piece.toLowerCase() === piece ? 'b' : 'w';
    const type = piece.toLowerCase();
    
    return `../../assets/pieces/${color}${type}.png`;
  };

  // Determine if a square should be highlighted
  const isHighlighted = (row, col) => {
    return highlightedSquares.some(([r, c]) => r === row && c === col);
  };

  // Determine if a square is part of the last move
  const isLastMove = (row, col) => {
    if (!lastMove) return false;
    
    const { from, to } = lastMove;
    return (from[0] === row && from[1] === col) || (to[0] === row && to[1] === col);
  };

  // Render the board
  const renderBoard = () => {
    const boardRows = [];
    
    for (let row = 0; row < 8; row++) {
      const squares = [];
      
      for (let col = 0; col < 8; col++) {
        const isWhiteSquare = (row + col) % 2 === 0;
        const piece = board[row] && board[row][col];
        const isSelected = selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;
        
        squares.push(
          <div 
            key={`${row}-${col}`}
            className={`
              square 
              ${isWhiteSquare ? 'white-square' : 'black-square'}
              ${isSelected ? 'selected' : ''}
              ${isHighlighted(row, col) ? 'highlighted' : ''}
              ${isLastMove(row, col) ? 'last-move' : ''}
            `}
            onClick={() => handleSquareClick(row, col)}
          >
            {piece && (
              <div className="piece">
                <img src={getPieceImage(piece)} alt={piece} />
              </div>
            )}
            {showHints && isHighlighted(row, col) && (
              <div className="hint-dot"></div>
            )}
            {/* Coordinates */}
            {col === 0 && (
              <div className="coordinate rank">
                {orientation === 'white' ? 8 - row : row + 1}
              </div>
            )}
            {row === 7 && (
              <div className="coordinate file">
                {orientation === 'white' 
                  ? String.fromCharCode(97 + col) 
                  : String.fromCharCode(104 - col)}
              </div>
            )}
          </div>
        );
      }
      
      boardRows.push(
        <div key={row} className="board-row">
          {squares}
        </div>
      );
    }
    
    return (
      <div className={`board ${orientation === 'black' ? 'flipped' : ''}`}>
        {boardRows}
      </div>
    );
  };

  return (
    <div className="chessboard-container">
      {renderBoard()}
    </div>
  );
};

export default Chessboard;