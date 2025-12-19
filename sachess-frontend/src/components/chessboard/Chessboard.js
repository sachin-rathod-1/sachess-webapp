import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

// Default starting position FEN
const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Validate FEN string has all required parts
const isValidFen = (fen) => {
  if (!fen || typeof fen !== 'string') return false;
  const parts = fen.trim().split(/\s+/);
  return parts.length === 6;
};

const ChessboardComponent = ({ 
  fen = DEFAULT_FEN, 
  onMove, 
  orientation = 'white',
  allowMoves = true,
  showHints = false,
  correctMoves = [],
  customSquareStyles = {}
}) => {
  // Ensure we have a valid FEN, fallback to default if invalid
  const validFen = isValidFen(fen) ? fen : DEFAULT_FEN;
  const [game, setGame] = useState(() => {
    try {
      return new Chess(validFen);
    } catch (e) {
      console.warn('Invalid FEN provided, using default position:', e);
      return new Chess(DEFAULT_FEN);
    }
  });
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [lastMove, setLastMove] = useState(null);

  // Update the game when FEN changes
  useEffect(() => {
    if (!isValidFen(fen)) {
      console.warn('Invalid FEN string received, keeping current position');
      return;
    }
    try {
      const newGame = new Chess(fen);
      setGame(newGame);
    } catch (error) {
      console.error('Invalid FEN string:', error);
    }
  }, [fen]);

  // Get possible moves for a piece
  const getMoveOptions = useCallback((square) => {
    if (!allowMoves) return;
    
    const moves = game.moves({
      square,
      verbose: true
    });
    
    if (moves.length === 0) return;
    
    const newSquares = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background: showHints 
          ? 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)'
          : 'rgba(0, 0, 0, 0.05)',
        borderRadius: '50%'
      };
    });
    
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    
    setOptionSquares(newSquares);
    return true;
  }, [game, allowMoves, showHints]);

  // Handle square click
  const onSquareClick = useCallback((square) => {
    if (!allowMoves) return;
    
    // Check if we already have a piece selected
    if (moveFrom) {
      // Check if the clicked square is a valid move
      const moves = game.moves({
        square: moveFrom,
        verbose: true
      });
      
      const foundMove = moves.find(
        (m) => m.from === moveFrom && m.to === square
      );
      
      if (foundMove) {
        // Handle pawn promotion
        if (foundMove.promotion) {
          setMoveTo(square);
          setShowPromotionDialog(true);
          return;
        }
        
        // Make the move
        try {
          const moveResult = game.move({
            from: moveFrom,
            to: square
          });
          
          if (moveResult) {
            setLastMove({ from: moveFrom, to: square });
            setGame(new Chess(game.fen()));
            setMoveFrom('');
            setOptionSquares({});
            
            // Call the onMove callback
            onMove && onMove(`${moveFrom}${square}`);
          }
        } catch (error) {
          console.error('Invalid move:', error);
        }
      } else {
        // If the clicked square is not a valid move, check if it's a new piece selection
        const hasMoveOptions = getMoveOptions(square);
        
        if (hasMoveOptions) {
          setMoveFrom(square);
        } else {
          setMoveFrom('');
          setOptionSquares({});
        }
      }
    } else {
      // No piece is selected yet, so select the piece on the clicked square
      const hasMoveOptions = getMoveOptions(square);
      
      if (hasMoveOptions) {
        setMoveFrom(square);
      }
    }
  }, [moveFrom, game, getMoveOptions, allowMoves, onMove]);

  // Handle piece drop (drag and drop)
  const onDrop = useCallback((sourceSquare, targetSquare) => {
    if (!allowMoves) return false;
    
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });
      
      if (move) {
        setLastMove({ from: sourceSquare, to: targetSquare });
        setGame(new Chess(game.fen()));
        
        // Call the onMove callback
        onMove && onMove(`${sourceSquare}${targetSquare}`);
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
    
    return false;
  }, [game, allowMoves, onMove]);

  // Handle right-click to mark squares
  const onSquareRightClick = useCallback((square) => {
    const color = rightClickedSquares[square]
      ? undefined
      : 'rgba(255, 0, 0, 0.4)';
    
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]: color
    });
  }, [rightClickedSquares]);

  // Combine all square styles
  const combinedSquareStyles = {
    ...optionSquares,
    ...rightClickedSquares,
    ...customSquareStyles,
    ...(lastMove ? {
      [lastMove.from]: { backgroundColor: 'rgba(173, 216, 230, 0.5)' },
      [lastMove.to]: { backgroundColor: 'rgba(173, 216, 230, 0.5)' }
    } : {})
  };

  // Calculate dynamic board size based on viewport - Lichess-style sizing
  const getBoardSize = () => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    
    // Lichess-style sizing: maximize board size while keeping it visible
    // Use 85-90% of viewport height for desktop/laptop to make it much larger
    if (vw > 1400) {
      // Large desktop/laptop - maximize board size
      const heightBased = vh * 0.85;
      const widthBased = vw * 0.48;
      return Math.min(heightBased, widthBased, 900);
    } else if (vw > 1024) {
      // Standard laptop - still make it quite large
      const heightBased = vh * 0.82;
      const widthBased = vw * 0.52;
      return Math.min(heightBased, widthBased, 750);
    } else if (vw > 768) {
      // Tablet/small laptop
      const heightBased = vh * 0.75;
      const widthBased = vw * 0.65;
      return Math.min(heightBased, widthBased, 650);
    } else {
      // Mobile
      return Math.min(vw * 0.95, vh * 0.55, 450);
    }
  };

  const [boardSize, setBoardSize] = useState(getBoardSize());

  useEffect(() => {
    const handleResize = () => {
      setBoardSize(getBoardSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      width: boardSize,
      height: boardSize,
      margin: '0 auto',
      position: 'relative',
      transition: 'width 0.3s ease, height 0.3s ease'
    }}>
      <Chessboard
        position={game.fen()}
        onSquareClick={allowMoves ? onSquareClick : undefined}
        onPieceDrop={allowMoves ? onDrop : undefined}
        onSquareRightClick={onSquareRightClick}
        customSquareStyles={combinedSquareStyles}
        boardOrientation={orientation}
        boardWidth={boardSize}
        arePiecesDraggable={allowMoves}
        showBoardNotation={true}
        animationDuration={200}
        customDarkSquareStyle={{ backgroundColor: '#b58863' }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}
      />
    </div>
  );
};

export default ChessboardComponent;