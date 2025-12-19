package com.sachess.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class ChessService {

    private static final String INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public String getInitialFen() {
        return INITIAL_FEN;
    }

    public boolean isValidMove(String fen, String from, String to, String promotion) {
        try {
            ChessPosition position = new ChessPosition(fen);
            return position.isLegalMove(from, to, promotion);
        } catch (Exception e) {
            log.error("Error validating move: {}", e.getMessage());
            return false;
        }
    }

    public String makeMove(String fen, String from, String to, String promotion) {
        try {
            ChessPosition position = new ChessPosition(fen);
            if (position.isLegalMove(from, to, promotion)) {
                position.makeMove(from, to, promotion);
                return position.toFen();
            }
        } catch (Exception e) {
            log.error("Error making move: {}", e.getMessage());
        }
        return null;
    }

    public boolean isCheckmate(String fen) {
        try {
            ChessPosition position = new ChessPosition(fen);
            return position.isCheckmate();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isStalemate(String fen) {
        try {
            ChessPosition position = new ChessPosition(fen);
            return position.isStalemate();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isCheck(String fen) {
        try {
            ChessPosition position = new ChessPosition(fen);
            return position.isInCheck();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isDraw(String fen) {
        try {
            ChessPosition position = new ChessPosition(fen);
            return position.isInsufficientMaterial() || position.isStalemate();
        } catch (Exception e) {
            return false;
        }
    }

    public String getMoveNotation(String fen, String from, String to, String promotion) {
        try {
            ChessPosition position = new ChessPosition(fen);
            return position.getMoveNotation(from, to, promotion);
        } catch (Exception e) {
            return from + to + (promotion != null ? promotion : "");
        }
    }

    public boolean isWhiteTurn(String fen) {
        String[] parts = fen.split(" ");
        return parts.length > 1 && "w".equals(parts[1]);
    }

    // Inner class for chess position handling
    private static class ChessPosition {
        private char[][] board = new char[8][8];
        private boolean whiteToMove;
        private boolean whiteKingsideCastle;
        private boolean whiteQueensideCastle;
        private boolean blackKingsideCastle;
        private boolean blackQueensideCastle;
        private String enPassantSquare;
        private int halfmoveClock;
        private int fullmoveNumber;

        public ChessPosition(String fen) {
            parseFen(fen);
        }

        private void parseFen(String fen) {
            String[] parts = fen.split(" ");
            String[] ranks = parts[0].split("/");

            for (int rank = 0; rank < 8; rank++) {
                int file = 0;
                for (char c : ranks[rank].toCharArray()) {
                    if (Character.isDigit(c)) {
                        int emptySquares = c - '0';
                        for (int i = 0; i < emptySquares; i++) {
                            board[rank][file++] = '.';
                        }
                    } else {
                        board[rank][file++] = c;
                    }
                }
            }

            whiteToMove = parts.length > 1 && "w".equals(parts[1]);

            String castling = parts.length > 2 ? parts[2] : "-";
            whiteKingsideCastle = castling.contains("K");
            whiteQueensideCastle = castling.contains("Q");
            blackKingsideCastle = castling.contains("k");
            blackQueensideCastle = castling.contains("q");

            enPassantSquare = parts.length > 3 && !"-".equals(parts[3]) ? parts[3] : null;
            halfmoveClock = parts.length > 4 ? Integer.parseInt(parts[4]) : 0;
            fullmoveNumber = parts.length > 5 ? Integer.parseInt(parts[5]) : 1;
        }

        public String toFen() {
            StringBuilder sb = new StringBuilder();

            for (int rank = 0; rank < 8; rank++) {
                int emptyCount = 0;
                for (int file = 0; file < 8; file++) {
                    char piece = board[rank][file];
                    if (piece == '.') {
                        emptyCount++;
                    } else {
                        if (emptyCount > 0) {
                            sb.append(emptyCount);
                            emptyCount = 0;
                        }
                        sb.append(piece);
                    }
                }
                if (emptyCount > 0) {
                    sb.append(emptyCount);
                }
                if (rank < 7) sb.append('/');
            }

            sb.append(' ').append(whiteToMove ? 'w' : 'b');

            sb.append(' ');
            StringBuilder castling = new StringBuilder();
            if (whiteKingsideCastle) castling.append('K');
            if (whiteQueensideCastle) castling.append('Q');
            if (blackKingsideCastle) castling.append('k');
            if (blackQueensideCastle) castling.append('q');
            sb.append(castling.length() > 0 ? castling : "-");

            sb.append(' ').append(enPassantSquare != null ? enPassantSquare : "-");
            sb.append(' ').append(halfmoveClock);
            sb.append(' ').append(fullmoveNumber);

            return sb.toString();
        }

        public boolean isLegalMove(String from, String to, String promotion) {
            int[] fromCoords = squareToCoords(from);
            int[] toCoords = squareToCoords(to);

            if (fromCoords == null || toCoords == null) return false;

            char piece = board[fromCoords[0]][fromCoords[1]];
            if (piece == '.') return false;

            boolean isWhitePiece = Character.isUpperCase(piece);
            if (isWhitePiece != whiteToMove) return false;

            if (!isPseudoLegalMove(fromCoords, toCoords, piece, promotion)) return false;

            // Make the move temporarily and check if king is in check
            char[][] tempBoard = copyBoard();
            char capturedPiece = board[toCoords[0]][toCoords[1]];
            
            board[toCoords[0]][toCoords[1]] = piece;
            board[fromCoords[0]][fromCoords[1]] = '.';

            // Handle promotion
            if (promotion != null && Character.toLowerCase(piece) == 'p') {
                char promotedPiece = promotion.charAt(0);
                if (isWhitePiece) promotedPiece = Character.toUpperCase(promotedPiece);
                board[toCoords[0]][toCoords[1]] = promotedPiece;
            }

            // Handle en passant capture
            if (Character.toLowerCase(piece) == 'p' && to.equals(enPassantSquare)) {
                int capturedPawnRank = isWhitePiece ? toCoords[0] + 1 : toCoords[0] - 1;
                board[capturedPawnRank][toCoords[1]] = '.';
            }

            // Handle castling
            if (Character.toLowerCase(piece) == 'k' && Math.abs(toCoords[1] - fromCoords[1]) == 2) {
                if (toCoords[1] > fromCoords[1]) { // Kingside
                    board[fromCoords[0]][5] = board[fromCoords[0]][7];
                    board[fromCoords[0]][7] = '.';
                } else { // Queenside
                    board[fromCoords[0]][3] = board[fromCoords[0]][0];
                    board[fromCoords[0]][0] = '.';
                }
            }

            boolean inCheck = isInCheck();

            // Restore board
            board = tempBoard;

            return !inCheck;
        }

        private boolean isPseudoLegalMove(int[] from, int[] to, char piece, String promotion) {
            int fromRank = from[0], fromFile = from[1];
            int toRank = to[0], toFile = to[1];
            char targetPiece = board[toRank][toFile];

            // Can't capture own piece
            if (targetPiece != '.' && Character.isUpperCase(piece) == Character.isUpperCase(targetPiece)) {
                return false;
            }

            char pieceType = Character.toLowerCase(piece);
            boolean isWhite = Character.isUpperCase(piece);

            switch (pieceType) {
                case 'p':
                    return isValidPawnMove(from, to, isWhite, promotion);
                case 'n':
                    return isValidKnightMove(from, to);
                case 'b':
                    return isValidBishopMove(from, to);
                case 'r':
                    return isValidRookMove(from, to);
                case 'q':
                    return isValidQueenMove(from, to);
                case 'k':
                    return isValidKingMove(from, to, isWhite);
                default:
                    return false;
            }
        }

        private boolean isValidPawnMove(int[] from, int[] to, boolean isWhite, String promotion) {
            int fromRank = from[0], fromFile = from[1];
            int toRank = to[0], toFile = to[1];
            int direction = isWhite ? -1 : 1;
            int startRank = isWhite ? 6 : 1;
            int promotionRank = isWhite ? 0 : 7;

            // Check promotion requirement
            if (toRank == promotionRank && promotion == null) return false;
            if (toRank != promotionRank && promotion != null) return false;

            // Forward move
            if (fromFile == toFile) {
                if (toRank == fromRank + direction && board[toRank][toFile] == '.') {
                    return true;
                }
                if (fromRank == startRank && toRank == fromRank + 2 * direction &&
                    board[fromRank + direction][fromFile] == '.' && board[toRank][toFile] == '.') {
                    return true;
                }
            }

            // Capture
            if (Math.abs(toFile - fromFile) == 1 && toRank == fromRank + direction) {
                if (board[toRank][toFile] != '.') return true;
                // En passant
                String targetSquare = coordsToSquare(toRank, toFile);
                if (targetSquare.equals(enPassantSquare)) return true;
            }

            return false;
        }

        private boolean isValidKnightMove(int[] from, int[] to) {
            int rankDiff = Math.abs(to[0] - from[0]);
            int fileDiff = Math.abs(to[1] - from[1]);
            return (rankDiff == 2 && fileDiff == 1) || (rankDiff == 1 && fileDiff == 2);
        }

        private boolean isValidBishopMove(int[] from, int[] to) {
            int rankDiff = Math.abs(to[0] - from[0]);
            int fileDiff = Math.abs(to[1] - from[1]);
            if (rankDiff != fileDiff || rankDiff == 0) return false;
            return isPathClear(from, to);
        }

        private boolean isValidRookMove(int[] from, int[] to) {
            if (from[0] != to[0] && from[1] != to[1]) return false;
            if (from[0] == to[0] && from[1] == to[1]) return false;
            return isPathClear(from, to);
        }

        private boolean isValidQueenMove(int[] from, int[] to) {
            return isValidBishopMove(from, to) || isValidRookMove(from, to);
        }

        private boolean isValidKingMove(int[] from, int[] to, boolean isWhite) {
            int rankDiff = Math.abs(to[0] - from[0]);
            int fileDiff = Math.abs(to[1] - from[1]);

            // Normal king move
            if (rankDiff <= 1 && fileDiff <= 1 && (rankDiff + fileDiff > 0)) {
                return true;
            }

            // Castling
            if (rankDiff == 0 && fileDiff == 2) {
                if (isInCheck()) return false;

                if (isWhite) {
                    if (to[1] > from[1] && whiteKingsideCastle) { // Kingside
                        return board[7][5] == '.' && board[7][6] == '.' &&
                               !isSquareAttacked(7, 5, false) && !isSquareAttacked(7, 6, false);
                    }
                    if (to[1] < from[1] && whiteQueensideCastle) { // Queenside
                        return board[7][1] == '.' && board[7][2] == '.' && board[7][3] == '.' &&
                               !isSquareAttacked(7, 2, false) && !isSquareAttacked(7, 3, false);
                    }
                } else {
                    if (to[1] > from[1] && blackKingsideCastle) { // Kingside
                        return board[0][5] == '.' && board[0][6] == '.' &&
                               !isSquareAttacked(0, 5, true) && !isSquareAttacked(0, 6, true);
                    }
                    if (to[1] < from[1] && blackQueensideCastle) { // Queenside
                        return board[0][1] == '.' && board[0][2] == '.' && board[0][3] == '.' &&
                               !isSquareAttacked(0, 2, true) && !isSquareAttacked(0, 3, true);
                    }
                }
            }

            return false;
        }

        private boolean isPathClear(int[] from, int[] to) {
            int rankDir = Integer.compare(to[0], from[0]);
            int fileDir = Integer.compare(to[1], from[1]);

            int rank = from[0] + rankDir;
            int file = from[1] + fileDir;

            while (rank != to[0] || file != to[1]) {
                if (board[rank][file] != '.') return false;
                rank += rankDir;
                file += fileDir;
            }

            return true;
        }

        public void makeMove(String from, String to, String promotion) {
            int[] fromCoords = squareToCoords(from);
            int[] toCoords = squareToCoords(to);
            char piece = board[fromCoords[0]][fromCoords[1]];
            boolean isWhite = Character.isUpperCase(piece);
            char pieceType = Character.toLowerCase(piece);

            // Handle en passant capture
            if (pieceType == 'p' && to.equals(enPassantSquare)) {
                int capturedPawnRank = isWhite ? toCoords[0] + 1 : toCoords[0] - 1;
                board[capturedPawnRank][toCoords[1]] = '.';
            }

            // Handle castling
            if (pieceType == 'k' && Math.abs(toCoords[1] - fromCoords[1]) == 2) {
                if (toCoords[1] > fromCoords[1]) { // Kingside
                    board[fromCoords[0]][5] = board[fromCoords[0]][7];
                    board[fromCoords[0]][7] = '.';
                } else { // Queenside
                    board[fromCoords[0]][3] = board[fromCoords[0]][0];
                    board[fromCoords[0]][0] = '.';
                }
            }

            // Update en passant square
            if (pieceType == 'p' && Math.abs(toCoords[0] - fromCoords[0]) == 2) {
                int epRank = (fromCoords[0] + toCoords[0]) / 2;
                enPassantSquare = coordsToSquare(epRank, fromCoords[1]);
            } else {
                enPassantSquare = null;
            }

            // Update castling rights
            if (pieceType == 'k') {
                if (isWhite) {
                    whiteKingsideCastle = false;
                    whiteQueensideCastle = false;
                } else {
                    blackKingsideCastle = false;
                    blackQueensideCastle = false;
                }
            }
            if (pieceType == 'r') {
                if (from.equals("a1")) whiteQueensideCastle = false;
                if (from.equals("h1")) whiteKingsideCastle = false;
                if (from.equals("a8")) blackQueensideCastle = false;
                if (from.equals("h8")) blackKingsideCastle = false;
            }

            // Make the move
            board[toCoords[0]][toCoords[1]] = piece;
            board[fromCoords[0]][fromCoords[1]] = '.';

            // Handle promotion
            if (promotion != null && pieceType == 'p') {
                char promotedPiece = promotion.charAt(0);
                if (isWhite) promotedPiece = Character.toUpperCase(promotedPiece);
                board[toCoords[0]][toCoords[1]] = promotedPiece;
            }

            // Update halfmove clock
            if (pieceType == 'p' || board[toCoords[0]][toCoords[1]] != '.') {
                halfmoveClock = 0;
            } else {
                halfmoveClock++;
            }

            // Update fullmove number
            if (!whiteToMove) {
                fullmoveNumber++;
            }

            whiteToMove = !whiteToMove;
        }

        public boolean isInCheck() {
            int[] kingPos = findKing(whiteToMove);
            if (kingPos == null) return false;
            return isSquareAttacked(kingPos[0], kingPos[1], !whiteToMove);
        }

        public boolean isCheckmate() {
            return isInCheck() && !hasLegalMoves();
        }

        public boolean isStalemate() {
            return !isInCheck() && !hasLegalMoves();
        }

        public boolean isInsufficientMaterial() {
            int whiteBishops = 0, blackBishops = 0;
            int whiteKnights = 0, blackKnights = 0;
            boolean hasOtherPieces = false;

            for (int rank = 0; rank < 8; rank++) {
                for (int file = 0; file < 8; file++) {
                    char piece = board[rank][file];
                    if (piece == '.') continue;
                    char pieceType = Character.toLowerCase(piece);
                    boolean isWhite = Character.isUpperCase(piece);

                    if (pieceType == 'k') continue;
                    if (pieceType == 'p' || pieceType == 'r' || pieceType == 'q') {
                        return false;
                    }
                    if (pieceType == 'b') {
                        if (isWhite) whiteBishops++;
                        else blackBishops++;
                    }
                    if (pieceType == 'n') {
                        if (isWhite) whiteKnights++;
                        else blackKnights++;
                    }
                }
            }

            int totalMinor = whiteBishops + blackBishops + whiteKnights + blackKnights;
            return totalMinor <= 1;
        }

        private boolean hasLegalMoves() {
            for (int fromRank = 0; fromRank < 8; fromRank++) {
                for (int fromFile = 0; fromFile < 8; fromFile++) {
                    char piece = board[fromRank][fromFile];
                    if (piece == '.') continue;
                    if (Character.isUpperCase(piece) != whiteToMove) continue;

                    for (int toRank = 0; toRank < 8; toRank++) {
                        for (int toFile = 0; toFile < 8; toFile++) {
                            String from = coordsToSquare(fromRank, fromFile);
                            String to = coordsToSquare(toRank, toFile);

                            // Check for promotion
                            String promotion = null;
                            if (Character.toLowerCase(piece) == 'p') {
                                int promotionRank = whiteToMove ? 0 : 7;
                                if (toRank == promotionRank) {
                                    promotion = "q";
                                }
                            }

                            if (isLegalMove(from, to, promotion)) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }

        private int[] findKing(boolean white) {
            char king = white ? 'K' : 'k';
            for (int rank = 0; rank < 8; rank++) {
                for (int file = 0; file < 8; file++) {
                    if (board[rank][file] == king) {
                        return new int[]{rank, file};
                    }
                }
            }
            return null;
        }

        private boolean isSquareAttacked(int rank, int file, boolean byWhite) {
            // Check pawn attacks
            int pawnDir = byWhite ? 1 : -1;
            char pawn = byWhite ? 'P' : 'p';
            if (rank + pawnDir >= 0 && rank + pawnDir < 8) {
                if (file > 0 && board[rank + pawnDir][file - 1] == pawn) return true;
                if (file < 7 && board[rank + pawnDir][file + 1] == pawn) return true;
            }

            // Check knight attacks
            char knight = byWhite ? 'N' : 'n';
            int[][] knightMoves = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};
            for (int[] move : knightMoves) {
                int r = rank + move[0], f = file + move[1];
                if (r >= 0 && r < 8 && f >= 0 && f < 8 && board[r][f] == knight) return true;
            }

            // Check king attacks
            char king = byWhite ? 'K' : 'k';
            for (int dr = -1; dr <= 1; dr++) {
                for (int df = -1; df <= 1; df++) {
                    if (dr == 0 && df == 0) continue;
                    int r = rank + dr, f = file + df;
                    if (r >= 0 && r < 8 && f >= 0 && f < 8 && board[r][f] == king) return true;
                }
            }

            // Check sliding piece attacks (bishop, rook, queen)
            char bishop = byWhite ? 'B' : 'b';
            char rook = byWhite ? 'R' : 'r';
            char queen = byWhite ? 'Q' : 'q';

            // Diagonal directions (bishop/queen)
            int[][] diagonals = {{-1,-1},{-1,1},{1,-1},{1,1}};
            for (int[] dir : diagonals) {
                int r = rank + dir[0], f = file + dir[1];
                while (r >= 0 && r < 8 && f >= 0 && f < 8) {
                    char p = board[r][f];
                    if (p != '.') {
                        if (p == bishop || p == queen) return true;
                        break;
                    }
                    r += dir[0];
                    f += dir[1];
                }
            }

            // Straight directions (rook/queen)
            int[][] straights = {{-1,0},{1,0},{0,-1},{0,1}};
            for (int[] dir : straights) {
                int r = rank + dir[0], f = file + dir[1];
                while (r >= 0 && r < 8 && f >= 0 && f < 8) {
                    char p = board[r][f];
                    if (p != '.') {
                        if (p == rook || p == queen) return true;
                        break;
                    }
                    r += dir[0];
                    f += dir[1];
                }
            }

            return false;
        }

        public String getMoveNotation(String from, String to, String promotion) {
            int[] fromCoords = squareToCoords(from);
            int[] toCoords = squareToCoords(to);
            char piece = board[fromCoords[0]][fromCoords[1]];
            char pieceType = Character.toLowerCase(piece);
            boolean isCapture = board[toCoords[0]][toCoords[1]] != '.' ||
                               (pieceType == 'p' && to.equals(enPassantSquare));

            StringBuilder notation = new StringBuilder();

            // Castling
            if (pieceType == 'k' && Math.abs(toCoords[1] - fromCoords[1]) == 2) {
                return toCoords[1] > fromCoords[1] ? "O-O" : "O-O-O";
            }

            // Piece letter (not for pawns)
            if (pieceType != 'p') {
                notation.append(Character.toUpperCase(pieceType));
            }

            // Disambiguation (simplified)
            if (pieceType != 'p' && pieceType != 'k') {
                notation.append(from);
            } else if (pieceType == 'p' && isCapture) {
                notation.append(from.charAt(0));
            }

            // Capture
            if (isCapture) {
                notation.append('x');
            }

            // Destination
            notation.append(to);

            // Promotion
            if (promotion != null) {
                notation.append('=').append(Character.toUpperCase(promotion.charAt(0)));
            }

            return notation.toString();
        }

        private int[] squareToCoords(String square) {
            if (square == null || square.length() != 2) return null;
            int file = square.charAt(0) - 'a';
            int rank = 8 - (square.charAt(1) - '0');
            if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
            return new int[]{rank, file};
        }

        private String coordsToSquare(int rank, int file) {
            return "" + (char)('a' + file) + (8 - rank);
        }

        private char[][] copyBoard() {
            char[][] copy = new char[8][8];
            for (int i = 0; i < 8; i++) {
                System.arraycopy(board[i], 0, copy[i], 0, 8);
            }
            return copy;
        }
    }
}
