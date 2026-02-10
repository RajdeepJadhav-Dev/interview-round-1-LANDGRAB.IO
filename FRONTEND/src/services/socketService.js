import { io } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log('Connected to server');
      useGameStore.getState().setConnected(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      useGameStore.getState().setConnected(false);
    });

    // Initial state
    this.socket.on('initial-state', (data) => {
      useGameStore.getState().setInitialState(
        data.grid,
        data.users,
        data.currentUser
      );
    });

    // Cell claimed
    this.socket.on('cell-claimed', (data) => {
      useGameStore.getState().updateCell(data);
    });

    // User joined
    this.socket.on('user-joined', (user) => {
      useGameStore.getState().addUser(user);
    });

    // User left
    this.socket.on('user-left', (data) => {
      useGameStore.getState().removeUser(data.userId);
    });

    // Leaderboard update
    this.socket.on('leaderboard-update', (leaderboard) => {
      useGameStore.getState().updateLeaderboard(leaderboard);
    });

    // Claim error
    this.socket.on('claim-error', (data) => {
      console.error('Claim error:', data.error);
      // Could show toast notification here
    });
    
    // ✅ Game state reset (when round starts)
    this.socket.on('game-state-reset', (data) => {
      const store = useGameStore.getState();
      store.setInitialState(data.grid, store.users, store.currentUser);
    });
  }

  claimCell(x, y) {
    if (this.socket) {
      this.socket.emit('claim-cell', { x, y });
    }
  }

  // ✅ NEW: Start round
  startRound() {
    if (this.socket) {
      this.socket.emit('start-round');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const socketService = new SocketService();