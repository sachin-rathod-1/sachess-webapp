import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect(token) {
    return new Promise((resolve, reject) => {
      if (this.connected && this.client) {
        resolve();
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS(SOCKET_URL),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('STOMP: ' + str);
          }
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket connected');
          this.connected = true;
          this.reconnectAttempts = 0;
          this.notifyListeners('connect', { connected: true });
          resolve();
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          this.connected = false;
          this.notifyListeners('disconnect', { connected: false });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message']);
          this.notifyListeners('error', { error: frame.headers['message'] });
          reject(new Error(frame.headers['message']));
        },
        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
          this.notifyListeners('error', { error: 'WebSocket connection error' });
        }
      });

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((sub) => {
        if (sub.unsubscribe) sub.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  subscribe(destination, callback) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    if (this.subscriptions.has(destination)) {
      return this.subscriptions.get(destination);
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (e) {
        callback(message.body);
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  send(destination, body) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body)
    });
    return true;
  }

  // Game-specific methods
  subscribeToGame(gameId, callback) {
    return this.subscribe(`/topic/game/${gameId}`, callback);
  }

  subscribeToChat(gameId, callback) {
    return this.subscribe(`/topic/chat/${gameId}`, callback);
  }

  subscribeToAnalysis(gameId, callback) {
    return this.subscribe(`/topic/game/${gameId}/analysis`, callback);
  }

  subscribeToMatchmaking(userId, callback) {
    return this.subscribe(`/user/${userId}/queue/matchmaking`, callback);
  }

  sendMove(gameId, from, to, promotion = null) {
    return this.send(`/app/game/${gameId}/move`, {
      from,
      to,
      promotion
    });
  }

  sendResign(gameId) {
    return this.send(`/app/game/${gameId}/resign`, {});
  }

  sendDrawOffer(gameId) {
    return this.send(`/app/game/${gameId}/draw/offer`, {});
  }

  sendDrawAccept(gameId) {
    return this.send(`/app/game/${gameId}/draw/accept`, {});
  }

  sendDrawDecline(gameId) {
    return this.send(`/app/game/${gameId}/draw/decline`, {});
  }

  sendChatMessage(gameId, content) {
    return this.send(`/app/chat/${gameId}`, { content });
  }

  requestAnalysis(gameId, fen) {
    return this.send(`/app/game/${gameId}/analyze`, { fen });
  }

  joinMatchmaking(timeControl, increment) {
    return this.send('/app/matchmaking/join', { timeControl, increment });
  }

  leaveMatchmaking() {
    return this.send('/app/matchmaking/leave', {});
  }

  // Event listener management
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Singleton instance
const websocketService = new WebSocketService();
export default websocketService;
