import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Box, Paper, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const ChessboardContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  maxWidth: 600,
  margin: '0 auto',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
  }
}));

const ChessboardComponent = ({ 
  fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", 
  onMove, 
  orientation = 'white',
  allowMoves = true,
  showHints = false,
  correctMoves = [],
  customSquareStyles = {},
  skipValidation = true
}) => {
  const [game, setGame] = useState(new Chess(fen,skipValidation));
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [lastMove, setLastMove] = useState(null);
  const theme = useTheme();

  // Update the game when FEN changes
  useEffect(() => {
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

  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ 
        width: '100%', 
        maxWidth: 600, 
        margin: '0 auto',
        '& .promotion-piece-q': {
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s'
          }
        }
      }}
    >
      <ChessboardContainer elevation={3}>
        <Chessboard
          id="ChessPuzzleBoard"
          position={game.fen()}
          onSquareClick={onSquareClick}
          onPieceDrop={onDrop}
          onSquareRightClick={onSquareRightClick}
          customSquareStyles={combinedSquareStyles}
          boardOrientation={orientation}
          areArrowsAllowed={true}
          showBoardNotation={true}
          animationDuration={200}
          boardWidth={undefined}
          customDarkSquareStyle={{ backgroundColor: theme.palette.mode === 'dark' ? '#779556' : '#b58863' }}
          customLightSquareStyle={{ backgroundColor: theme.palette.mode === 'dark' ? '#edeed1' : '#f0d9b5' }}
          customPieces={{
            // You can customize pieces here if needed
          }}
          promotionToSquare={moveTo}
          showPromotionDialog={showPromotionDialog}
          onPromotionPieceSelect={(piece) => {
            // Handle promotion
            if (moveFrom && moveTo) {
              try {
                const promotion = piece[1].toLowerCase();
                const move = game.move({
                  from: moveFrom,
                  to: moveTo,
                  promotion
                });
                
                if (move) {
                  setLastMove({ from: moveFrom, to: moveTo });
                  setGame(new Chess(game.fen()));
                  
                  // Call the onMove callback
                  onMove && onMove(`${moveFrom}${moveTo}${promotion}`);
                }
              } catch (error) {
                console.error('Invalid promotion:', error);
              }
            }
            
            setMoveFrom('');
            setMoveTo(null);
            setShowPromotionDialog(false);
            setOptionSquares({});
          }}
        />
      </ChessboardContainer>
    </Box>
  );
};

export default ChessboardComponent;