import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { gameAPI } from '../services/api';
import websocketService from '../services/websocket';

const GameContext = createContext(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { user, wsConnected } = useAuth();
  const [currentGame, setCurrentGame] = useState(null);
  const [gameMessages, setGameMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [waitingGames, setWaitingGames] = useState([]);
  const [activeGames, setActiveGames] = useState([]);
  
  const gameSubscriptionRef = useRef(null);
  const chatSubscriptionRef = useRef(null);
  const analysisSubscriptionRef = useRef(null);
  const matchmakingSubscriptionRef = useRef(null);

  // Subscribe to matchmaking when searching
  useEffect(() => {
    if (wsConnected && isSearching && user) {
      matchmakingSubscriptionRef.current = websocketService.subscribeToMatchmaking(
        user.id,
        (message) => {
          console.log('Matchmaking message:', message);
          if (message.gameId) {
            setIsSearching(false);
            loadGame(message.gameId);
          }
        }
      );
    }

    return () => {
      if (matchmakingSubscriptionRef.current) {
        websocketService.unsubscribe(`/user/${user?.id}/queue/matchmaking`);
        matchmakingSubscriptionRef.current = null;
      }
    };
  }, [wsConnected, isSearching, user]);

  // Subscribe to game updates when in a game
  useEffect(() => {
    if (wsConnected && currentGame) {
      // Subscribe to game events
      gameSubscriptionRef.current = websocketService.subscribeToGame(
        currentGame.id,
        handleGameMessage
      );

      // Subscribe to chat
      chatSubscriptionRef.current = websocketService.subscribeToChat(
        currentGame.id,
        handleChatMessage
      );

      // Subscribe to analysis
      analysisSubscriptionRef.current = websocketService.subscribeToAnalysis(
        currentGame.id,
        handleAnalysisMessage
      );
    }

    return () => {
      if (currentGame) {
        websocketService.unsubscribe(`/topic/game/${currentGame.id}`);
        websocketService.unsubscribe(`/topic/chat/${currentGame.id}`);
        websocketService.unsubscribe(`/topic/game/${currentGame.id}/analysis`);
      }
    };
  }, [wsConnected, currentGame?.id]);

  const handleGameMessage = useCallback((message) => {
    console.log('Game message:', message);
    setGameMessages(prev => [...prev, message]);

    switch (message.type) {
      case 'MOVE':
      case 'GAME_START':
        setCurrentGame(prev => ({
          ...prev,
          currentFen: message.fen,
          pgn: message.pgn || prev?.pgn,
          status: message.status,
          currentTurn: message.currentTurn,
          whiteTimeRemaining: message.whiteTimeRemaining,
          blackTimeRemaining: message.blackTimeRemaining
        }));
        break;
      case 'GAME_END':
      case 'RESIGN':
      case 'TIMEOUT':
        setCurrentGame(prev => ({
          ...prev,
          currentFen: message.fen || prev?.currentFen,
          status: message.status,
          result: message.result
        }));
        break;
      case 'DRAW_OFFER':
        setCurrentGame(prev => ({
          ...prev,
          status: 'DRAW_OFFERED',
          drawOfferedBy: message.playerId
        }));
        break;
      case 'DRAW_ACCEPT':
        setCurrentGame(prev => ({
          ...prev,
          status: message.status,
          result: message.result
        }));
        break;
      case 'DRAW_DECLINE':
        setCurrentGame(prev => ({
          ...prev,
          status: 'ACTIVE'
        }));
        break;
      default:
        break;
    }
  }, []);

  const handleChatMessage = useCallback((message) => {
    setChatMessages(prev => [...prev, message]);
  }, []);

  const handleAnalysisMessage = useCallback((message) => {
    if (message.analysis) {
      setAnalysis(message.analysis);
    }
  }, []);

  const createGame = useCallback(async (timeControl = 10, increment = 0) => {
    try {
      const response = await gameAPI.createGame(timeControl, increment);
      setCurrentGame(response.data);
      setChatMessages([]);
      setGameMessages([]);
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }, []);

  const joinGame = useCallback(async (gameId) => {
    try {
      const response = await gameAPI.joinGame(gameId);
      setCurrentGame(response.data);
      setChatMessages([]);
      setGameMessages([]);
      return response.data;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  }, []);

  const loadGame = useCallback(async (gameId) => {
    try {
      const response = await gameAPI.getGame(gameId);
      setCurrentGame(response.data);
      setChatMessages([]);
      setGameMessages([]);
      return response.data;
    } catch (error) {
      console.error('Error loading game:', error);
      throw error;
    }
  }, []);

  const makeMove = useCallback((from, to, promotion = null) => {
    if (!currentGame || !wsConnected) return false;
    return websocketService.sendMove(currentGame.id, from, to, promotion);
  }, [currentGame, wsConnected]);

  const resign = useCallback(() => {
    if (!currentGame || !wsConnected) return false;
    return websocketService.sendResign(currentGame.id);
  }, [currentGame, wsConnected]);

  const offerDraw = useCallback(() => {
    if (!currentGame || !wsConnected) return false;
    return websocketService.sendDrawOffer(currentGame.id);
  }, [currentGame, wsConnected]);

  const acceptDraw = useCallback(() => {
    if (!currentGame || !wsConnected) return false;
    return websocketService.sendDrawAccept(currentGame.id);
  }, [currentGame, wsConnected]);

  const declineDraw = useCallback(() => {
    if (!currentGame || !wsConnected) return false;
    return websocketService.sendDrawDecline(currentGame.id);
  }, [currentGame, wsConnected]);

  const sendChat = useCallback((content) => {
    if (!currentGame || !wsConnected) return false;
    return websocketService.sendChatMessage(currentGame.id, content);
  }, [currentGame, wsConnected]);

  const requestAnalysis = useCallback((fen) => {
    if (!currentGame || !wsConnected) return false;
    return websocketService.requestAnalysis(currentGame.id, fen || currentGame.currentFen);
  }, [currentGame, wsConnected]);

  const startMatchmaking = useCallback(async (timeControl = 10, increment = 0) => {
    try {
      setIsSearching(true);
      await gameAPI.joinMatchmaking(timeControl, increment);
      if (wsConnected) {
        websocketService.joinMatchmaking(timeControl, increment);
      }
    } catch (error) {
      console.error('Error starting matchmaking:', error);
      setIsSearching(false);
      throw error;
    }
  }, [wsConnected]);

  const cancelMatchmaking = useCallback(async () => {
    try {
      setIsSearching(false);
      await gameAPI.leaveMatchmaking();
      if (wsConnected) {
        websocketService.leaveMatchmaking();
      }
    } catch (error) {
      console.error('Error canceling matchmaking:', error);
    }
  }, [wsConnected]);

  const createInvitation = useCallback(async (timeControl = 10, increment = 0) => {
    try {
      const response = await gameAPI.createInvitation(timeControl, increment);
      return response.data.code;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }, []);

  const acceptInvitation = useCallback(async (code) => {
    try {
      const response = await gameAPI.acceptInvitation(code);
      setCurrentGame(response.data);
      setChatMessages([]);
      setGameMessages([]);
      return response.data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }, []);

  const fetchWaitingGames = useCallback(async () => {
    try {
      const response = await gameAPI.getWaitingGames();
      setWaitingGames(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching waiting games:', error);
      return [];
    }
  }, []);

  const fetchActiveGames = useCallback(async () => {
    try {
      const response = await gameAPI.getActiveGames();
      setActiveGames(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching active games:', error);
      return [];
    }
  }, []);

  const leaveGame = useCallback(() => {
    setCurrentGame(null);
    setChatMessages([]);
    setGameMessages([]);
    setAnalysis(null);
  }, []);

  const value = {
    currentGame,
    gameMessages,
    chatMessages,
    analysis,
    isSearching,
    waitingGames,
    activeGames,
    createGame,
    joinGame,
    loadGame,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    sendChat,
    requestAnalysis,
    startMatchmaking,
    cancelMatchmaking,
    createInvitation,
    acceptInvitation,
    fetchWaitingGames,
    fetchActiveGames,
    leaveGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
